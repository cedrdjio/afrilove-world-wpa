# PHASE 1 — AUDIT COMPLET DE `afrilove-world-mob`

> Source de vérité : **`afrolove-world-mob`** (Expo SDK 57 / React Native 0.86 / React 19.2).
> Cible : **`afrilove-world-wpa`** (Next.js 16 / App Router / React 19 / Tailwind 4).
> Date de l'audit : 2026-08-04. Auteur : migration engineering.

Ce document est l'inventaire exhaustif de l'application mobile. Il sert de
référentiel de non-régression : **toute** entrée listée ici doit exister dans la
PWA à la fin de la migration. La matrice finale (§20) est la checklist maîtresse.

---

## 0. Résumé exécutif

| Indicateur | Mobile (Expo) | Web (Next.js) — état initial |
| --- | --- | --- |
| Fichiers `.ts/.tsx` (src+app) | 235 src + 113 routes | ~70 |
| Lignes de code (src+app) | ~19 700 | ~2 500 |
| Modules métier | 15 (`src/modules/*`) + `shared` | 2 (auth, onboarding) |
| Écrans / routes | ~150 écrans, 113 fichiers de route | ~10 pages |
| Migrations Supabase | 52 | 57 (schéma **déjà miroir**, légèrement en avance) |
| Edge Functions | 6 | 6 (déjà copiées) |
| Tables Postgres | ~40 | idem (partagées) |
| RPC (fonctions SQL) | ~90 | idem (partagées) |
| Paiement | CamerPay (Mobile Money) | non implémenté |
| Temps réel | Supabase Realtime (messages, présence, notifications) | non implémenté |

**Conclusion :** le backend Supabase (tables, RLS, RPC, Storage, Edge Functions,
templates e-mail) est **commun aux deux apps et déjà présent** dans le repo web.
La migration est donc à **~95 % un travail de front-end** : reproduire ~150
écrans, ~30 hooks, ~18 services, 11 stores et toute la logique métier client en
Next.js. Le socle web actuel s'arrête au « Sprint 01 » (auth + onboarding +
placeholders discover/profil).

> ⚠️ **Note de nommage** : le dossier Git du mobile est `afrolove-world-mob`
> (marque produit « AfroLove World » / « AfriLove World » selon `app.json`).
> On l'appelle « mob » ci-dessous. Le web est `afrilove-world-wpa` (« wpa »).

---

## 1. Architecture

### 1.1 Stack mobile (source de vérité)

| Domaine | Technologie |
| --- | --- |
| Framework | Expo SDK ~57, React Native 0.86, React 19.2 |
| Navigation | `expo-router` ^57 (file-based, typed routes activés) |
| Styling | NativeWind 4 (Tailwind 3.4) + `register-css-interop` |
| Animations | `react-native-reanimated` ^4.5, `react-native-gesture-handler`, `react-native-worklets`, Lottie (`lottie-react-native`, `@lottiefiles/dotlottie-react`) |
| Data fetching | `@tanstack/react-query` ^5.101 |
| State local | `zustand` ^5 |
| Formulaires | `react-hook-form` ^7.80 + `@hookform/resolvers` + `zod` ^4 |
| Backend | `@supabase/supabase-js` ^2.110 |
| Storage session | `expo-secure-store` (adapter chiffré) |
| Push | `expo-notifications` |
| Localisation | `expo-location` |
| Média | `expo-image`, `expo-image-picker`, `expo-image-manipulator` |
| UI natif | `@gorhom/bottom-sheet`, `expo-blur`, `expo-linear-gradient`, `expo-haptics`, `@shopify/flash-list` |
| Icônes | `lucide-react-native` |
| Fonts | Barlow, Barlow Condensed, Montserrat, Nunito, Plus Jakarta Sans (`@expo-google-fonts/*`) |
| Monitoring | `@sentry/react-native` (inerte si DSN vide) |
| Deep links | scheme `afrolove://`, `expo-linking`, `expo-auth-session`, `expo-web-browser` |

### 1.2 Organisation des dossiers (mob)

```
app/                       # Routes expo-router (file-based)
  (auth)/                  # Groupe non authentifié
  (onboarding)/            # Groupe onboarding (post-signup)
  (tabs)/                  # Groupe principal (4 onglets)
  profile/  chat/  edit-profile/  search/  premium/
  kyc/  settings/  notifications/  matches/  reports/
  blocked-users/  legal/  system/
  _layout.tsx  index.tsx  +not-found.tsx
  discover-filters.tsx  discover-like-limit.tsx  matches-search.tsx
  profile-completion.tsx

src/
  modules/<feature>/       # Découpage vertical par domaine métier
    components/ hooks/ screens/ services/ stores/ types/ constants/
  shared/
    components/  (ui/ layout/ feedback/)
    hooks/  services/  stores/  theme/  styles/  constants/  utils/  types/
  assets/  (images, lottie)

supabase/
  migrations/  functions/  templates/  seed/  config.toml
```

**Modules métier (`src/modules/`)** : `auth`, `onboarding`, `discovery`,
`matches`, `messaging`, `notifications`, `profile`, `search`, `premium`,
`kyc`, `settings`, `reports`, `blocked-users`, `legal`, `system`, `favorites`.

**Principe d'architecture** : *feature-sliced vertical*. Chaque module est
autonome (`components/hooks/screens/services/stores/types`). Les routes
`app/**` ne sont que de minces adaptateurs qui montent un écran du module
correspondant (ex. `app/index.tsx` → `SplashScreen`, `app/(auth)/login.tsx` →
`LoginScreen`). **Ce pattern doit être répliqué** côté web : les fichiers
`app/**/page.tsx` restent minces, la logique vit dans `src/features/<module>`.

### 1.3 Dépendances — correspondances Expo → Next.js

| Mobile | Équivalent web retenu | Statut wpa |
| --- | --- | --- |
| expo-router | Next.js App Router | ✅ en place |
| NativeWind | Tailwind CSS v4 | ✅ |
| reanimated / gesture-handler | `framer-motion` (Motion) + Pointer Events / `@use-gesture` si besoin | ⚠️ partiel |
| lucide-react-native | `lucide-react` | ✅ |
| @gorhom/bottom-sheet | `vaul` (drawer) | ✅ provider présent |
| expo-secure-store | cookies httpOnly via `@supabase/ssr` | ✅ |
| expo-notifications | Web Push API + Service Worker | ❌ |
| expo-location | `navigator.geolocation` | ❌ |
| expo-image-picker | `<input type=file>` + preview | ⚠️ onboarding uniquement |
| expo-haptics | Vibration API (best-effort) | ✅ hook présent |
| Sentry RN | `@sentry/nextjs` (optionnel) | ❌ |
| flash-list | virtualisation (`@tanstack/react-virtual`) | ❌ |
| Lottie RN | `lottie-react` / `@lottiefiles/dotlottie-react` | ❌ |

### 1.4 Stack web (cible) — état des lieux

Next.js 16 (App Router), React 19, Tailwind v4, shadcn/ui (Radix), `framer-motion`,
TanStack Query, Zustand, Zod 3, react-hook-form, `next-themes`, `sonner` (toasts),
`vaul` (drawers), `@supabase/ssr`. PWA : `manifest.ts`, `public/sw.js`,
`service-worker-register`, `install-button`. Providers déjà câblés (`src/providers/`).

---

## 2. Navigation — inventaire des écrans

Groupes racine (`app/_layout.tsx`, Stack) : `(auth)`, `(onboarding)`,
`profile-completion`, `(tabs)`, `discover-filters` (modal), `discover-like-limit`
(transparentModal), `profile`, `edit-profile` (modal), `chat`, `matches`
(transparentModal), `matches-search` (modal), `notifications`, `search` (modal),
`premium` (modal), `kyc`, `settings`, `reports` (modal), `legal/[key]` (modal),
`blocked-users`, `system`.

Deep-link scheme : **`afrolove://`**. Callbacks auth (magic link, reset,
OAuth) résolus via `useAuthDeepLink` + écran `(auth)/resolving`.

### 2.1 Auth — `app/(auth)/` (public, redirige si déjà connecté)

| Écran | Route | Params | Protection | Notes |
| --- | --- | --- | --- | --- |
| Welcome | `/welcome` | — | public | hero + slides |
| Login | `/login` | — | public | email+password, Google OAuth |
| Register | `/register` | — | public | + consentement légal |
| Forgot password | `/forgot-password` | — | public | envoi email reset |
| Reset password | `/reset-password` | token (deep link) | via lien | nouveau mot de passe |
| Verify email | `/verify-email` | — | semi | attente confirmation |
| Resolving | `/resolving` | url params | transitoire | résout deep link auth |
| Success | `/success` | — | transitoire | confirmation |

### 2.2 Onboarding — `app/(onboarding)/` (authentifié, onboarding non terminé)

Ordre (assistant multi-étapes, store `onboardingStore`) : `name` → `birthday`
→ `gender` → `looking-for` → `interests` → `lifestyle` → `bio` →
`location-permission` → `notification-permission` → `upload-photos` →
`carousel` → `finish`. Chacun : route `/(onboarding)/<step>`, protégé par
`RequireAuthForOnboarding`.

### 2.3 Tabs — `app/(tabs)/` (authentifié + onboarding terminé)

| Onglet | Route | Écran source |
| --- | --- | --- |
| Discover | `/(tabs)/discover` | `SwipeScreen` (deck de swipe) |
| Matches | `/(tabs)/matches` | `MatchListScreen` |
| Messages | `/(tabs)/messages` | `ConversationListScreen` |
| Profile | `/(tabs)/profile` | `MyProfileScreen` |

Layout tabs monte 4 hooks globaux : `useLocationSync`, `usePushSync`,
`useNotificationsRealtime`, `usePresenceSync` + `VerificationPromptModal`.

### 2.4 Discovery annexes

| Écran | Route | Présentation |
| --- | --- | --- |
| Filtres discover | `/discover-filters` | modal |
| Limite de likes | `/discover-like-limit` | transparent modal |

### 2.5 Profil (soi & autrui)

| Écran | Route | Params |
| --- | --- | --- |
| Profil public | `/profile/[id]` | `id` |
| Galerie plein écran | `/profile/[id]/gallery` | `id` |
| Complétion profil | `/profile-completion` | — |

### 2.6 Édition de profil — `app/edit-profile/` (modal)

Hub `/edit-profile` + sous-écrans : `basic-info`, `bio`, `photos`, `interests`,
`languages`, `lifestyle`, `education`, `job`, `height`, `religion`,
`preferences`, `completion`, `preview`.

### 2.7 Recherche avancée — `app/search/` (modal)

Hub `/search` + filtres : `age`, `city`, `country`, `distance`, `education`,
`height`, `languages`, `lifestyle`, `profession`, `religion`, `verified`.

### 2.8 Matches

| Écran | Route | Présentation |
| --- | --- | --- |
| Célébration match | `/matches/celebration` | transparent modal |
| Recherche matches | `/matches-search` | modal |

### 2.9 Chat — `app/chat/`

| Écran | Route | Params |
| --- | --- | --- |
| Conversation | `/chat/[id]` | `id` (= match_id) |
| Emoji picker | `/chat/[id]/emoji-picker` | `id` |

### 2.10 Premium — `app/premium/` (modal)

`/premium` (landing), `pricing`, `features`, `checkout`, `callback`, `success`,
`failed`, `locked`.

### 2.11 KYC / vérification — `app/kyc/`

`upload-id`, `selfie`, `recap`, `pending`, `approved`, `rejected`.

### 2.12 Réglages — `app/settings/`

Hub `/settings` + `account`, `security`, `privacy`, `notifications`,
`change-email`, `change-password`, `delete-account`, `logout`, `logs`.

### 2.13 Notifications / Blocked / Reports / Legal / System

| Écran | Route |
| --- | --- |
| Notifications | `/notifications` |
| Utilisateurs bloqués | `/blocked-users` |
| Signaler un profil | `/reports/[id]` |
| Confirmation signalement | `/reports/confirmation` |
| Document légal | `/legal/[key]` (`key` = slug) |
| System states | `/system/{loading,empty,offline,no-internet,server-error,maintenance,account-status}` |
| Not found | `/+not-found` |

**Total : ~150 destinations distinctes.**

---

## 3. Authentification

Module `src/modules/auth/`. Store : `authStore` (Zustand). Service : `authService`.

- **Login** : email + password (`useLogin`) via `supabase.auth.signInWithPassword`.
- **Inscription** : `useRegister` → `signUp` + consentement légal (`legalConsentStore`).
- **OTP / email** : confirmation e-mail (`useVerifyEmail`), templates HTML custom
  (`supabase/templates/confirm-signup.html`, `change-email.html`, `reset-password.html`).
- **Téléphone** : ❌ non utilisé (email uniquement).
- **OAuth** : Google (`useGoogleAuth`, `expo-auth-session` + `expo-web-browser`),
  activé si `EXPO_PUBLIC_GOOGLE_OAUTH_WEB_CLIENT_ID` présent.
- **Sessions / JWT / refresh** : gérés par supabase-js ; persistance via
  `secureStoreAdapter` (SecureStore chiffré). Web = cookies httpOnly (`@supabase/ssr`).
- **Deep links auth** : `useAuthDeepLink` (magic link, reset, oauth callback) →
  écran `resolving`.
- **Mot de passe oublié / reset** : `useForgotPassword`, `useResetPassword`.
- **Gardes** : `RequireAuthForOnboarding`, `RequireCompletedOnboarding`,
  `useInitialRoute` (routage initial selon état auth+onboarding),
  `useInitializeAuth` (bootstrap session au démarrage).
- **Logout** : `useLogout` + écran dédié.

Hooks : `useAuth`, `useInitializeAuth`, `useAuthDeepLink`, `useLogin`,
`useRegister`, `useLogout`, `useForgotPassword`, `useResetPassword`,
`useVerifyEmail`, `useGoogleAuth`, `useInitialRoute`. Composants : `OtpInput`,
`RequireAuthForOnboarding`, `RequireCompletedOnboarding`.

---

## 4. Profil

Module `src/modules/profile/`. Services : `profileService`, `photoService`,
`locationService`, `referenceDataService`.

- **Édition** : hub + 13 sous-écrans (§2.6). Update via `useUpdateProfile`.
- **Photos** : `usePhotoManagement`, `photoService`, upload via Edge Function
  `upload-photo` (S3), table `profile_photos`, bucket `profile-photos`.
  Réordonnancement, photo principale, suppression, modération (`admin_moderate_photo`).
- **Vidéos** : ❌ pas de vidéo de profil (photos uniquement).
- **Bio** : champ texte (`EditBioScreen`).
- **Préférences** : `EditPreferencesScreen` (genre recherché, tranche d'âge…).
- **Centres d'intérêt** : table `interests` + junction `profile_interests`,
  `ChoiceListEditor`.
- **Langues** : `languages` + `profile_languages`.
- **Badges** : vérifié (KYC), premium, en ligne — composant `Badges`.
- **Vérification** : voir §11 (KYC).
- **Stats** : `useProfileStats` (`get_my_profile_stats`), vues de profil
  (`record_profile_view`, `profile_views`).
- **Complétion** : `ProfileCompletionScreen`, trigger DB `recompute_profile_completed`.
- **Données de référence** : `useReferenceData` (interests, languages, religions,
  countries, cities, education_levels, occupations, lifestyle_options,
  relationship_goals) — toutes tables catalogues.

Hooks : `useProfileQuery`, `useOtherProfileQuery`, `useUpdateProfile`,
`usePhotoManagement`, `useProfileStats`, `useProfileDisplayData`,
`useReferenceData`, `useLocationSync`. Composants : `EditScreenLayout`,
`InfoRow`, `ProfileDetailView`.

---

## 5. Matching & Découverte

Modules `discovery`, `matches`, `favorites`.

- **Algorithme** : RPC `search_profiles` (SQL) — filtre âge, vérifié,
  nouveaux/en-ligne, intérêts, scope (monde / pays / **diaspora**), calcule
  `compatibility` et `distance_km`, exclut les profils déjà swipés côté serveur.
  `count_search_profiles` alimente le compteur « Voir N profils ».
  `get_discovery_countries` = pays réellement peuplés.
- **Deck** : `DECK_SIZE = 25`, `deckStore`, `SwipeCard` (Reanimated + Gesture),
  `ActionButtons`.
- **Filtres** : `filtersStore` (scope, country, ageMin/Max, verifiedOnly,
  interestIds, mode). Câblés dans la query key → refetch immédiat.
- **Likes / Passes / Super likes** : table `swipes` (`action ∈ like|pass|superlike`),
  upsert `onConflict swiper_id,target_id`. Le **match est créé par trigger DB**
  `after_swipe_sync_match` (le client ne peut pas forger un match).
- **Match** : détecté après swipe (lecture table `matches`, clé ordonnée
  `profile_a < profile_b`), écran `MatchCelebrationScreen`.
- **Favoris** : `favoritesService` (`add_favorite`, `remove_favorite`,
  `get_my_favorites`, `get_my_favorite_ids`, `get_saved_favorites`),
  `useSavedFavorites`. Free-tier limité.
- **Qui m'a liké** (likers) : `get_my_likers` — **réservé premium** (`useLikers`).
- **Limites quotidiennes** : `DailyLikeLimitScreen`, entitlements
  (`get_my_entitlements`), écran `discover-like-limit`.
- **Recherche texte libre** : `searchByText` (nom/ville/pays).

---

## 6. Messagerie

Module `src/modules/messaging/`. Service `messagingService`, store `chatComposerStore`.

- **Conversations** : `get_my_conversations` (RPC agrégée : partenaire, dernier
  message, non-lus, dernière activité). `ConversationListScreen`.
- **Temps réel** : Supabase Realtime `postgres_changes` INSERT sur `messages`
  filtré `match_id` (topic **unique** par abonnement pour éviter la réutilisation
  d'instance). `subscribeToMessages` / `unsubscribe`.
- **Envoi** : `sendMessage` (insert table `messages`).
- **Lecture** : `mark_messages_read` (RPC), `read_at`, compteur non-lus.
- **Présence** : canal Realtime partagé `online-members` (`presenceStore`,
  `useIsOnline`, `usePresenceSync`).
- **Pièces jointes / audio / images / vidéos / réactions** : ❌ **non présents**
  (messagerie **texte uniquement** dans la source de vérité — ne pas inventer).
- **Emoji** : écran `emoji-picker` dédié.
- **Actions conversation** : `ConversationActionSheet` (bloquer, signaler…).
- **Notifications** : nouveau message → notification (voir §7).

Composants : `ConversationActionSheet`. Hook : `useMessaging`. Util : `time.ts`.

---

## 7. Notifications

Module `src/modules/notifications/`. Services `notificationsService`, `pushService`.

- **Push** : `expo-notifications`, table `push_tokens`, `usePush` /
  `usePushSync` (enregistre le token), `usePushNavigation` (deep link au tap).
- **In-app / temps réel** : `useNotificationsRealtime` (Realtime sur table
  `notifications`), `NotificationsScreen`, `useNotifications`.
- **Email** : via Supabase Auth (templates HTML) + broadcasts admin
  (`admin_send_notification`, `admin_broadcasts`).
- **Badge** : compteur non-lus (notifications + messages), affiché sur la nav.
- **Types** : match, message, like, admin/broadcast, système.

Web : à réimplémenter en **Web Push API + Service Worker** (déjà `public/sw.js`).

---

## 8. Paiements

Module `src/modules/premium/` (+ `payments/`).

- **Fournisseur** : **CamerPay** (Mobile Money — Cameroun / diaspora). Pas de Stripe,
  pas d'achats intégrés stores dans la logique métier.
- **Plans** : table `premium_plans` (clés `discovery_1d`, `week_7d`, `month_1m`,
  `quarter_3m`, `year_1y`). Styles de carte dans `constants/plans.ts` (charte
  lavande), badge « Meilleur » = `year_1y`.
- **Flux** : `paymentService` + `camerpayProvider` + `mobileMoney` →
  Edge Functions `payment-initiate` / `payment-return` / `payment-status` /
  `payment-webhook`. RPC `settle_camerpay_payment`, `fail_camerpay_payment`,
  `purchase_subscription_dev` (dev), `grant_subscription`.
- **Entitlements** : `get_my_entitlements`, `has_active_premium` — déverrouille
  likers, limites, filtres avancés.
- **Écrans** : landing, pricing, features, checkout, callback, success, failed,
  locked. Composant `PricingCard`. Hook `usePremium` (`usePremiumPlans`,
  `useEntitlements`, `usePurchasePlan`, `useFavorites`, `useLikers`).
- **Tables** : `premium_plans`, `subscriptions`, `payment_transactions`, `coupons`.

Web : le flux CamerPay repose sur des Edge Functions **déjà présentes** — il faut
reproduire les écrans + le hook + les pages de retour (`callback`/`success`/`failed`).

---

## 9. Localisation

Module `profile` (`locationService`, `useLocationSync`) + module `search`.

- **GPS** : `expo-location` → `useLocationSync` met à jour la position du profil
  (lat/lng) périodiquement. Écran `location-permission` (onboarding).
- **Distance** : calculée côté serveur (`distance_km` dans `search_profiles`),
  filtre `DistanceFilterScreen`.
- **Recherche géo** : scope monde / pays / diaspora, filtres city/country/distance.
- **Cartes** : ❌ pas de carte interactive (pas de MapView) — distance uniquement.

Web : `navigator.geolocation` (avec permission), sinon fallback ville/pays.

---

## 10. Temps réel

- **Messages** : Realtime `postgres_changes` (publication `supabase_realtime`).
- **Présence** : canal Realtime `online-members` (track/sync).
- **Notifications** : Realtime sur `notifications`.
- **Synchronisation** : invalidations TanStack Query après swipe / message /
  achat (`entitlements`, `favorites`, `matches`, `conversations`).
- **Réseau** : `networkStore` + `OfflineOverlay` (NetInfo) → bannière hors-ligne.

Web : `@supabase/supabase-js` Realtime fonctionne à l'identique côté navigateur.

---

## 11. KYC / Vérification

Module `src/modules/kyc/`. Store `kycStore`, service `kycService`.

- **Flux** : `upload-id` (pièce d'identité) → `selfie` → `recap` → soumission
  → `pending` → `approved` / `rejected`.
- **Upload** : Edge Function `upload-kyc` (S3, sécurisé), table `kyc_submissions`.
- **Revue** : côté admin (`admin_review_kyc`, `admin_list_kyc`).
- **Badge vérifié** : `admin_set_profile_verified`, `is_verified` sur `profiles`.
- **Relance** : `VerificationPromptModal` (rappel périodique dans les tabs),
  `KycHeader`. Hook `useKyc`.

---

## 12. Base de données (Supabase — partagée)

**Tables (~40)** : `profiles`, `profile_photos`, `profile_interests`,
`profile_languages`, `profile_favorites`, `profile_views`, `interests`,
`languages`, `religions`, `countries`, `cities`, `education_levels`,
`occupations`, `lifestyle_options`, `relationship_goals`, `swipes`, `matches`,
`messages`, `notifications`, `push_tokens`, `blocks`, `reports`,
`kyc_submissions`, `premium_plans`, `subscriptions`, `payment_transactions`,
`coupons`, `legal_documents`, `app_settings`, `client_logs`, `support_tickets`,
`support_messages`, `message_templates`, `admin_audit_log`, `admin_broadcasts`,
`admin_invites`, `admin_warnings`, `admin_roles`, `system_settings`…

**RPC (~90)** — groupes : découverte (`search_profiles`, `count_search_profiles`,
`get_discovery_countries`, `record_profile_view`), favoris (`add_favorite`,
`remove_favorite`, `get_my_favorites`, `get_saved_favorites`, `get_my_favorite_ids`),
matching/likers (`get_my_likers`), messagerie (`get_my_conversations`,
`mark_messages_read`), premium (`get_my_entitlements`, `has_active_premium`,
`grant_subscription`, `settle_camerpay_payment`, `fail_camerpay_payment`,
`purchase_subscription_dev`), profil (`get_public_profile`, `get_my_profile_stats`),
modération (`is_blocked_between`, `get_my_blocked_profiles`), sécurité
(`is_admin`, `get_app_secret`, `privacy_pref`), et **surface admin** (~55 RPC
`admin_*` : users, kyc, reports, photos, subscriptions, coupons, plans,
templates, broadcasts, analytics, dashboard, audit, tickets, roles/RBAC).

**RLS** : activé sur toutes les tables sensibles. Storage : buckets
`profile-photos`, `kyc` (privé), `branding`. Fonctions SQL `SECURITY DEFINER`
durcies (search_path épinglé, grants révoqués au public).

**Edge Functions (6)** : `upload-photo`, `upload-kyc`, `payment-initiate`,
`payment-return`, `payment-status`, `payment-webhook`.

> ✅ Le schéma est **déjà répliqué** dans `afrilove-world-wpa/supabase/`
> (57 migrations, mêmes fonctions). Aucune migration métier à recréer — sauf
> maintenance. Types générés à maintenir : `src/types/database.ts` (web).

---

## 13. Hooks personnalisés (30)

`useAuth`, `useInitializeAuth`, `useAuthDeepLink`, `useLogin`, `useRegister`,
`useLogout`, `useForgotPassword`, `useResetPassword`, `useVerifyEmail`,
`useGoogleAuth`, `useInitialRoute`, `useCompleteOnboarding`, `useDiscovery(Feed/
Count/Countries)`, `useSwipe`, `useKyc`, `useMessaging`, `useNotifications`,
`usePush`/`usePushSync`/`usePushNavigation`, `usePremium` (+ `usePremiumPlans`,
`useEntitlements`, `usePurchasePlan`, `useFavorites`, `useLikers`),
`useSavedFavorites`, `useModeration`, `useProfileQuery`, `useOtherProfileQuery`,
`useUpdateProfile`, `usePhotoManagement`, `useProfileStats`,
`useProfileDisplayData`, `useReferenceData`, `useLocationSync`, `usePresenceSync`,
`useIsOnline` + shared : `useAppError`, `useAppFonts`, `useIsAdmin`.

---

## 14. Providers / Contexts

Mobile (via `app/_layout.tsx`) : `GestureHandlerRootView`, `SafeAreaProvider`,
`QueryClientProvider`, `ErrorBoundary`, `ThemeProvider` (custom, `themeStore`),
`AppBootstrap` (auth+deeplink+push). Web équivalents déjà présents :
`query-provider`, `theme-provider`, `auth-provider`, `supabase-provider`,
`settings-provider`, `toast-provider`, `modal-provider`, `bottom-sheet-provider`,
`motion-provider`.

---

## 15. Services (18)

`authService`, `discoveryService`, `profileService`, `photoService`,
`locationService`, `referenceDataService`, `messagingService`,
`notificationsService`, `pushService`, `premiumService`, `paymentService`
(+`camerpayProvider`, `mobileMoney`), `kycService`, `onboardingService`,
`moderationService`, `favoritesService`, `legalService`, `accountService`,
shared : `logService`, `monitoring`, `queryClient`, `supabase/client`,
`supabase/secureStoreAdapter`.

**Intégrations externes** : Supabase (Auth/DB/Realtime/Storage/Edge), CamerPay
(Mobile Money), Sentry (optionnel). **Pas de Cloudinary, pas de Resend, pas de
Stripe** — Storage = Supabase S3, e-mails = templates Supabase Auth.

---

## 16. Composants — classification

- **UI (`shared/components/ui/`)** : `Avatar`, `Badges`, `BrandLogo`, `Chip`,
  `ChoiceListEditor`, `GhostButton`, `GlassCard`, `GlassInput`, `GlassSurface`,
  `GradientButton`, `IconButton`, `PhotoPlaceholder`, `ProgressSteps`,
  `RangeSlider`, `SettingsRow`, `ToggleSwitch`, `Typography`.
- **Layout (`shared/components/layout/`)** : `BottomNavBar`, `GlowOrb`,
  `ScreenBackground`, `ScreenHeader`.
- **Feedback (`shared/components/feedback/`)** : `EmptyState`, `ErrorState`,
  `LoadingSpinner`, `OfflineOverlay`, `Skeleton`.
- **Transverses** : `ErrorBoundary`.
- **Spécifiques modules** : `SwipeCard`, `ActionButtons` (discovery),
  `OtpInput` (auth), `OnboardingHeader/Layout/OptionCard/PermissionScreen`
  (onboarding), `PricingCard` (premium), `KycHeader/VerificationPromptModal`
  (kyc), `ConversationActionSheet` (messaging), `RangeStepper/SearchFieldLayout`
  (search), `EditScreenLayout/InfoRow/ProfileDetailView` (profile),
  `SystemStateScreen` (system).

Charte **« glassmorphism lavande »** (thème `shared/constants/theme.ts`,
`#9B7EDE` / crème / violets). À reproduire fidèlement en CSS/Tailwind.

---

## 17. Animations

- **Reanimated 4** + **Gesture Handler** : swipe cards (drag, rotation,
  seuils like/pass), transitions d'écran (`slide_from_right`, `fade`).
- **Lottie** : `hearts-loader`, `success-burst`, `empty-hearts` (loaders/états).
- **Blur / LinearGradient** : effets glass, dégradés de fond (`GlowOrb`).
- **Haptics** : retour tactile sur actions clés.
- **Bottom sheets** : `@gorhom/bottom-sheet` (filtres, action sheets).

Web : `framer-motion` (transitions, gestes de swipe via `drag`), `vaul` (sheets),
Lottie web, `backdrop-filter: blur()` (glass), Vibration API (haptics).

---

## 18. Permissions

| Permission | Usage | Écran |
| --- | --- | --- |
| Localisation (fine+coarse) | matching par distance | `location-permission` |
| Notifications | push | `notification-permission` |
| Caméra | photos profil + selfie KYC | image-picker |
| Photothèque | photos profil | image-picker |
| Micro (`RECORD_AUDIO`) | déclaré (Android) mais **non utilisé** en UI | — |

Web : Geolocation API, Notification/Push API, `<input capture>` / getUserMedia
(selfie KYC), file input.

---

## 19. Fonctionnalités « cachées » / non-évidentes

1. **Diaspora country matching** (migration dédiée) : scope de découverte spécial
   qui matche par pays d'origine de la diaspora — logique métier centrale à ne
   pas oublier.
2. **Match créé par trigger DB** (`after_swipe_sync_match`) — le client observe
   seulement ; à respecter côté web.
3. **Anti-abus / rate limits** (migration `anti_abuse_rate_limits`) : quotas
   serveur sur likes/actions.
4. **Free-tier limits** (vues, favoris, likes) appliqués via entitlements + RLS.
5. **Upload via Edge Function S3** plutôt que Storage REST (contournement d'un
   bug RLS intermittent) — reproduire côté web (ne pas repasser par storage.upload).
6. **Presence** exige un topic **partagé** (purge des instances traînantes) ;
   messages/notifications exigent un topic **unique** (bug de réabonnement).
7. **Vault des secrets** (`get_app_secret`, `app_secrets_vault_accessor`) :
   secrets serveur (CamerPay, S3) jamais exposés au client.
8. **Consentement légal** obligatoire à l'inscription (`legalConsentStore`,
   `legal_documents`, écran `legal/[key]`).
9. **Logs client** (`client_logs`, `logService`, écran `settings/logs`) :
   journal d'activité consultable + remonté en base.
10. **RBAC admin complet en base** (55+ RPC `admin_*`) — **pas d'UI admin dans le
    mobile**. Décision produit à prendre : la PWA doit-elle inclure le back-office
    admin (probable, car c'est le point d'entrée naturel d'un admin sur desktop) ?
    → **à clarifier** (voir plan, Jalon 12).
11. **`useIsAdmin`** présent côté mobile (masque probablement des entrées) —
    surface admin latente.
12. **System states** dédiés (maintenance, offline, server-error, account-status)
    pilotés par `app_settings` / statut de compte.
13. **Verification prompt** périodique (nudge KYC).
14. **Typed routes** expo-router → parité de typage des routes à viser côté Next.

---

## 20. MATRICE COMPLÈTE (checklist maîtresse)

Légende **État** : ✅ fait · 🟡 partiel/placeholder · ❌ absent · ➖ N/A web · ⏳ à décider.

| Fonction | Existe Expo | Existe Next | État |
| --- | --- | --- | --- |
| **Architecture feature-sliced** | ✅ | 🟡 (auth/onboarding) | 🟡 |
| **Design system glass lavande** | ✅ | 🟡 (UI primitives) | 🟡 |
| Navigation / gardes de routes | ✅ | 🟡 (proxy + layout) | 🟡 |
| Deep linking (`afrolove://`) | ✅ | ➖ (URL web) | 🟡 |
| Login email/password | ✅ | ✅ | ✅ |
| Register + consentement légal | ✅ | 🟡 (register sans consentement) | 🟡 |
| Google OAuth | ✅ | ❌ | ❌ |
| Forgot / reset password | ✅ | ✅ | ✅ |
| Verify email / templates | ✅ | 🟡 | 🟡 |
| Session/JWT/refresh | ✅ | ✅ (@supabase/ssr) | ✅ |
| Onboarding (12 étapes) | ✅ | 🟡 (wizard générique) | 🟡 |
| Permission GPS (onboarding) | ✅ | ❌ | ❌ |
| Permission notifications (onboarding) | ✅ | ❌ | ❌ |
| Upload photos onboarding | ✅ | 🟡 | 🟡 |
| Discover deck / swipe | ✅ | ❌ (placeholder) | ❌ |
| Filtres discover + compteur | ✅ | ❌ | ❌ |
| Likes / passes / superlikes | ✅ | ❌ | ❌ |
| Limite likes quotidienne | ✅ | ❌ | ❌ |
| Recherche texte libre | ✅ | ❌ | ❌ |
| Recherche avancée (11 filtres) | ✅ | ❌ | ❌ |
| Matches (liste + célébration) | ✅ | ❌ | ❌ |
| Favoris / likers (premium) | ✅ | ❌ | ❌ |
| Messagerie liste conversations | ✅ | ❌ | ❌ |
| Chat temps réel | ✅ | ❌ | ❌ |
| Lecture / non-lus / présence | ✅ | ❌ | ❌ |
| Emoji picker | ✅ | ❌ | ❌ |
| Profil public + galerie | ✅ | ❌ | ❌ |
| Mon profil | ✅ | 🟡 (lecture) | 🟡 |
| Édition profil (13 écrans) | ✅ | ❌ | ❌ |
| Gestion photos (réordre/principale) | ✅ | ❌ | ❌ |
| Stats profil / vues | ✅ | ❌ | ❌ |
| Complétion profil | ✅ | ❌ | ❌ |
| Données de référence (catalogues) | ✅ | 🟡 (interests/countries) | 🟡 |
| KYC (upload id/selfie/statuts) | ✅ | ❌ | ❌ |
| Badge vérifié | ✅ | ❌ | ❌ |
| Premium landing/pricing/features | ✅ | ❌ | ❌ |
| Checkout CamerPay + retours | ✅ | ❌ | ❌ |
| Entitlements / has_active_premium | ✅ | ❌ | ❌ |
| Notifications in-app + realtime | ✅ | ❌ | ❌ |
| Push notifications | ✅ (expo) | ❌ (web push) | ❌ |
| Badge compteur | ✅ | ❌ | ❌ |
| Localisation / sync position | ✅ | ❌ | ❌ |
| Distance matching | ✅ | ❌ | ❌ |
| Diaspora country matching | ✅ | ❌ | ❌ |
| Réglages (hub + 8 écrans) | ✅ | ❌ | ❌ |
| Change email / password | ✅ | ❌ | ❌ |
| Delete account | ✅ | ❌ | ❌ |
| Privacy / notifications settings | ✅ | ❌ | ❌ |
| Activity logs (client_logs) | ✅ | ❌ | ❌ |
| Signalement (reports) | ✅ | ❌ | ❌ |
| Blocage / utilisateurs bloqués | ✅ | ❌ | ❌ |
| Documents légaux (`legal/[key]`) | ✅ | ❌ | ❌ |
| System states (7 écrans) | ✅ | 🟡 (offline) | 🟡 |
| Offline / NetInfo overlay | ✅ | 🟡 (banner) | 🟡 |
| Error boundary / monitoring | ✅ | 🟡 | 🟡 |
| Haptics | ✅ | 🟡 (hook) | 🟡 |
| Animations swipe / transitions | ✅ | ❌ | ❌ |
| Lottie (loaders/états) | ✅ | ❌ | ❌ |
| **Back-office admin (UI)** | ➖ (DB only) | ❌ | ⏳ à décider |
| PWA (manifest/SW/install) | ➖ | ✅ | ✅ (bonus web) |
| SEO (métadonnées) | ➖ | 🟡 | 🟡 (bonus web) |

**Avancement global initial estimé : ~8 %** (auth + onboarding partiels ;
socle providers/UI/PWA en place ; tout le cœur métier reste à migrer).

---

*Fin de la Phase 1. Le plan de migration détaillé (jalons) est dans
`PHASE2_MIGRATION_PLAN.md`. Le suivi vivant est dans `MIGRATION_PROGRESS.md`
à la racine du repo web.*
