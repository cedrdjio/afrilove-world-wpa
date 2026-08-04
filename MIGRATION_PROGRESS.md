# MIGRATION_PROGRESS — afrilove-world-mob ➜ afrilove-world-wpa

> Document **vivant**, mis à jour à la fin de chaque jalon.
> Source de vérité : `afrolove-world-mob` (Expo). Cible : ce repo (Next.js).
> Détails : `docs/migration/PHASE1_AUDIT.md` · `docs/migration/PHASE2_MIGRATION_PLAN.md`.

**Avancement global : ~45 %**
_(fondations + design system + navigation/shell + authentification + onboarding + profil + recherche avancée complets ; cœur métier — découverte, messagerie — à migrer)_

Dernière mise à jour : 2026-08-04 — Jalon 7 (Recherche avancée) livré.

### Décisions du Jalon 0 (validées)
- **Admin** : reporté — décision tranchée avant le Jalon 12 (hors périmètre pour l'instant).
- **Notifications web** : **Web Push complet** (VAPID + Service Worker) au Jalon 10.
- **CamerPay web** : URLs de retour `/premium/callback` + webhooks (Edge Functions déjà présentes).

## Statut des jalons

| Jalon | Domaine | Statut |
| --- | --- | --- |
| 0 | Cadrage & décisions (admin, web push, CamerPay web) | ✅ validé |
| 1 | Architecture & fondations | ✅ terminé |
| 2 | Design System (glass lavande) | ✅ terminé |
| 3 | Navigation & Shell | ✅ terminé |
| 4 | Authentification | ✅ terminé |
| 5 | Onboarding (carousel → finish) | ✅ terminé |
| 6 | Profil (mon profil / édition / public) | ✅ terminé |
| 7 | Recherche avancée | ✅ terminé |
| 8 | Découverte & Matching | ❌ à faire |
| 9 | Messagerie temps réel | ❌ à faire |
| 10 | Notifications | ❌ à faire |
| 11 | Paiements (Premium / CamerPay) | ❌ à faire |
| 12 | Modération / comptes / légal (+ Admin ?) | ❌ à faire |
| 13 | Optimisations (perf / PWA / SEO) | ❌ à faire |
| 14 | QA & non-régression | ❌ à faire |
| 15 | Production | ❌ à faire |

Légende : ✅ terminé & vérifié · 🟡 partiel · ❌ à faire · ⏳ décision requise.

## Checklist fonctionnelle (miroir de la MATRICE §20 de l'audit)

### Authentification
- [x] Login email/password
- [ ] Register + consentement légal (partiel : register sans consentement)
- [ ] Google OAuth
- [x] Forgot / reset password
- [ ] Verify email + templates
- [x] Session / JWT / refresh (@supabase/ssr)
- [ ] Deep-link resolving / success

### Onboarding
- [x] Parité des étapes (carousel → name → gender → birthday → looking-for →
  interests → bio → photos → lifestyle → permissions → finish)
- [x] Étape identité (prénom + nom / KYC), réconciliation register→onboarding
- [x] Permission GPS (géoloc navigateur → coordonnées de proximité)
- [x] Permission notifications (invite navigateur ; abonnement Web Push → J10)
- [x] Upload photos (Edge `upload-photo`, min 2 / max 6)
- [x] Lifestyle depuis `lifestyle_options` (DB) + repli local
- [x] Carousel intro + écran de fin + persistance du brouillon → resolving

### Profil
- [x] Mon profil (héros, complétion, vérif, bio, intérêts, stats, aperçu)
- [x] Profil public `/profile/[id]` + galerie plein écran (lecture seule)
- [x] Édition — hub + 11 éditeurs (base, photos, bio, intérêts, mode de vie,
  langues, religion, éducation, profession, taille, préférences)
- [x] Gestion photos (ajout / remplacement / suppression / principale / réordre)
- [x] Stats & vues de profil (`get_my_profile_stats`, `record_profile_view`)
- [x] Complétion profil (anneau + checklist)
- [x] Données de référence (intérêts, langues, religions, éducation, objectifs,
  lifestyle)

### Découverte & Matching
- [ ] Deck de swipe (`search_profiles`)
- [ ] Filtres discover + compteur
- [ ] Likes / passes / superlikes
- [ ] Match (trigger DB) + célébration
- [ ] Favoris / likers (premium)
- [ ] Limite likes quotidienne
- [ ] Recherche texte libre
- [ ] Localisation / distance / diaspora matching

### Recherche avancée
- [x] Hub + 11 filtres (age, city, country, distance, education, height, languages, lifestyle, profession, religion, verified)
- [x] Store en mémoire `useSearchFiltersStore` (port de `searchFiltersStore`)
- [x] Chrome commun `SearchFieldLayout` (retour + « Appliquer ») + `RangeStepper`
- [x] Garde session + profil complété ; « Rechercher » ouvre la découverte (application effective des filtres → J8)

### Messagerie
- [ ] Liste conversations
- [ ] Chat temps réel (Realtime)
- [ ] Envoi / lecture / non-lus
- [ ] Présence (online-members)
- [ ] Emoji picker
- [ ] Action sheet (bloquer / signaler)

### Notifications
- [ ] In-app + Realtime
- [ ] Web Push (VAPID + SW)
- [ ] Badge compteur

### Premium / Paiements
- [ ] Landing / pricing / features / locked
- [ ] Checkout CamerPay + callback/success/failed
- [ ] Entitlements / has_active_premium

### KYC / Vérification
- [ ] Upload id / selfie / recap
- [ ] Statuts pending / approved / rejected
- [ ] Badge vérifié

### Réglages / Comptes
- [ ] Hub réglages
- [ ] Account / security / privacy / notifications
- [ ] Change email / password
- [ ] Delete account
- [ ] Activity logs (client_logs)

### Modération & Légal
- [ ] Reports (`/reports/[id]` + confirmation)
- [ ] Blocage / utilisateurs bloqués
- [ ] Documents légaux (`legal/[key]`)

### Système & transverse
- [ ] System states (7 écrans) — partiel (offline)
- [ ] Offline / NetInfo overlay — partiel (banner)
- [ ] Error boundary / monitoring — partiel
- [ ] Haptics — partiel (hook)
- [ ] Animations swipe / transitions
- [ ] Lottie (loaders / états)

### Admin (décision requise — Jalon 0)
- [ ] ⏳ Back-office admin (55+ RPC `admin_*`) — non présent dans le mobile

### Web bonus (non applicable au mobile)
- [x] PWA (manifest / SW / install)
- [ ] SEO (métadonnées par page publique) — partiel

## Journal des jalons

### 2026-08-04 — Phase 1 & 2
- Audit complet du mobile produit (`docs/migration/PHASE1_AUDIT.md`).
- Plan de migration en 15 jalons (`docs/migration/PHASE2_MIGRATION_PLAN.md`).
- Ce tracker initialisé.

### 2026-08-04 — Jalon 1 : Architecture & fondations ✅
**Analyse d'écart** : les fondations web (`@supabase/ssr`, proxy, providers)
étaient saines mais divergeaient du mobile sur : config du QueryClient (cache,
retry, gestion session expirée), absence de normalisation d'erreurs partagée,
absence de journal client, clés de cache éparses, carte de routes incomplète
(~10 vs ~150 destinations).

**Fichiers créés**
- `src/lib/errors.ts` — port fidèle de `errorMapping` mobile (`AppError`,
  `mapToAppError`, `logAppErrorDetails`).
- `src/lib/query-keys.ts` — clés TanStack Query centralisées (miroir du mobile)
  + racines pour invalidations croisées identiques.
- `src/services/log-service.ts` — port de `logService` (`logEvent` → `client_logs`,
  fire-and-forget).

**Fichiers modifiés**
- `src/providers/query-provider.tsx` — parité mobile (staleTime 2 min, gcTime
  15 min, retry 1) + déconnexion auto sur `session_expired` (QueryCache +
  MutationCache) + `onlineManager` câblé sur `online/offline` du navigateur.
- `src/constants/routes.ts` — carte de routes complète (auth, onboarding,
  discover, matches, messages, profile, edit-profile, search, premium, kyc,
  notifications, settings, blocked-users, reports) + fabriques dynamiques
  (`profile(id)`, `chat(id)`, `legal(key)`…) + `PROTECTED_PREFIXES` étendus.
- `src/features/README.md` — conventions alignées sur les 15 modules mobiles
  (structure `components/hooks/services/stores/schema/types/index`).

**Tests réalisés** : `pnpm typecheck` ✅ · `pnpm lint` ✅ (0 erreur) · `pnpm build` ✅.
**Régressions** : aucune (changements additifs ; routes existantes préservées,
`/likes` conservé le temps de la réconciliation nav au Jalon 3).

**Note de suivi** : réconcilier `/likes` (web) ↔ `/matches` (mobile) au Jalon 3
lors de la refonte du `BottomNav`. → ✅ **fait au Jalon 3** (alias `/likes` supprimé).

### 2026-08-04 — Jalon 2 : Design System (glass lavande) ✅
**Analyse d'écart** : les tokens (couleurs `#9B7EDE`/violets, fonts Jakarta+Nunito,
utilitaire `.glass`, dégradés, radii) étaient **déjà alignés** dans `globals.css`.
L'écart réel : les primitives UI (le mobile en a ~18, le web ~9 génériques). Port
fidèle des composants manquants, charte respectée à l'identique.

**Fichiers créés — primitives UI** (`src/components/ui/`)
- `photo-placeholder.tsx` (+ `photoSeedFromString`, hash identique au mobile pour
  une teinte stable), `avatar.tsx`, `badges.tsx` (Verified/Match/Count),
  `chip.tsx` (dégradé si sélectionné, tap + haptique), `gradient-button.tsx`,
  `ghost-button.tsx`, `icon-button.tsx` (verre + pastille), `glass-card.tsx`
  (reflet Fluent), `glass-input.tsx` (label/icônes/erreur, forwardRef),
  `settings-row.tsx`, `progress-steps.tsx`, `range-slider.tsx` (`Slider` +
  `DualSlider`, pointer events), `typography.tsx`.

**Fichiers créés — layout** (`src/components/layout/`)
- `glow-orb.tsx` (halo radial flottant, framer-motion), `screen-background.tsx`
  (dégradé lavande + nuit auto en `.dark` + halos), `screen-header.tsx`
  (retour verre + titre).

**Fichiers créés — feedback** (`src/components/feedback/`)
- `empty-state.tsx` (cœur flottant + CTA), `error-state.tsx` (mappe `AppError`
  → icône + titre + message + « Réessayer »), `skeleton.tsx` (+ `SkeletonCircle`),
  `index.ts`.

**Tests réalisés** : `pnpm typecheck` ✅ · `pnpm lint` ✅ (0 erreur) · `pnpm build` ✅.
**Régressions** : aucune (composants nouveaux, non encore montés dans les pages).

**Notes de parité (à finaliser à la consommation)**
- **Lottie** : les loaders Lottie mobiles (`hearts-loader`, `success-burst`,
  `empty-hearts`) sont remplacés par une animation cœur framer-motion. Passer à
  `lottie-react` + copie des JSON si la parité stricte est exigée (Jalon 13).
- **ToggleSwitch** : le `Switch` Radix existant (`components/ui/switch.tsx`) est
  conservé plutôt qu'un doublon — restyle si nécessaire au Jalon 12.
- **BrandLogo** : couvert par `components/brand/logo.tsx` existant.

### 2026-08-04 — Jalon 3 : Navigation & Shell ✅
**Analyse d'écart (Expo vs Next)** :

| Élément | Expo | Next (avant) | Action J3 |
| --- | --- | --- | --- |
| Groupes de routes | `(auth)`/`(onboarding)`/`(tabs)` avec layouts-gardes | routes plates, garde seulement dans le proxy serveur | groupe `(app)` + layouts-gardes client |
| Barre d'onglets | `BottomNavBar` verre flottant, 4 tabs animés | scaffolding sur `/likes` | port fidèle réconcilié `/matches` |
| Garde app | `RequireCompletedOnboarding` | logique dupliquée dans chaque page | centralisée dans le shell |
| Garde onboarding | `RequireAuthForOnboarding` | absente | portée (layout onboarding) |
| Route initiale | `useInitialRoute` (recovery/statut/onboarding/profil/discover) | proxy partiel | ordre repris dans la garde shell |
| États système | 7 écrans `/system/*` | seul `/offline` | `SystemStateScreen` + `/system/[state]` + `/system/account-status` |
| not-found | `+not-found` → `/` | absent | `not-found.tsx` → `/` |
| Chargement plein écran | `FullScreenLoader` (Lottie) | absent | port framer-motion |

**Fichiers créés**
- `components/layout/bottom-nav.tsx` — **refondu** : port de `BottomNavBar`
  (4 onglets Découvrir/Matchs/Messages/Profil, cœur rempli sur Matchs, icône
  qui se soulève + pastille active, haptique), réconcilié sur `/matches`.
- `components/guards/require-completed-onboarding.tsx` — port du garde `(tabs)` :
  session → statut compte → onboarding → profil (ordre du mobile).
- `components/guards/require-auth-for-onboarding.tsx` — port du garde `(onboarding)`.
- `components/feedback/full-screen-loader.tsx` — chargement de marque (loader + logo).
- `components/feedback/system-state-screen.tsx` — port de `SystemStateScreen`.
- `app/(app)/layout.tsx` — shell authentifié (garde + `BottomNav` + espace bas).
- `app/(app)/discover/page.tsx`, `app/(app)/profile/page.tsx` — **déplacés** dans
  le groupe (URLs `/discover` `/profile` inchangées), allégés (garde centralisée).
- `app/(app)/matches/page.tsx`, `app/(app)/messages/page.tsx` — onglets placeholder
  (grille/chat au J8/J9).
- `app/profile-completion/page.tsx` — cible de la garde (finalisation au J6).
- `app/system/[state]/page.tsx` — états empty/loading/maintenance/no-internet/offline/server-error.
- `app/system/account-status/page.tsx` — port de `AccountStatusScreen` (banni vs
  désactivé, réactivation `account_status='active'`, déconnexion).
- `app/onboarding/layout.tsx` — layout-garde onboarding.
- `app/not-found.tsx` — filet de sécurité → `/`.

**Fichiers modifiés**
- `constants/routes.ts` — **réconciliation `/likes` → `/matches`** (alias supprimé,
  retiré des `PROTECTED_PREFIXES`) ; ajout des 7 routes `system*`.
- `components/feedback/index.ts` — exports `FullScreenLoader`, `SystemStateScreen`.

**Répartition des gardes** : le proxy (serveur) protège les routes contre les
visiteurs anonymes ; les layouts-gardes (client) couvrent ce que seul le client
sait après lecture du profil (onboarding/profil complets, statut du compte) — pas
de doublon, division nette.

**Tests réalisés** : `pnpm typecheck` ✅ · `pnpm lint` ✅ (0 erreur) ·
`pnpm build` ✅ (22 routes, dont `/discover` `/matches` `/messages` `/profile`
`/profile-completion` `/system/[state]` `/system/account-status` `/_not-found`).
**Régressions** : aucune. Les pages `/discover` `/profile` conservent leurs URLs ;
la logique de redirection dupliquée est centralisée dans le shell (comportement
identique). L'alias `/likes` est retiré partout.

**Notes de parité**
- **VerificationPromptModal** (rappel « faites-vous vérifier » monté dans `(tabs)`)
  et les hooks de sync montés dans le layout mobile (`useLocationSync`,
  `usePushSync`, `useNotificationsRealtime`, `usePresenceSync`) sont **différés**
  à leurs jalons respectifs (KYC J12, localisation J6, notifications/présence
  J9/J10) — le point de montage est le shell `(app)`, prêt à les recevoir.
- **`/offline`** existant (repli Service Worker) conservé en plus de `/system/offline`.
- **account-status/reactivate** : le mobile passe par `accountService` ; ici l'update
  `profiles` est inline (le module Settings complet arrive au J12).

### 2026-08-04 — Jalon 4 : Authentification ✅
**Analyse d'écart** : le web avait déjà un flux auth fonctionnel (login/register/
forgot/reset/callback). J4 a comblé les écarts de **fidélité comportementale**
avec le mobile, en réutilisant les formulaires web existants (RHF + `Field`).

| # | Fonction | Expo | Next (avant) | Action J4 |
| --- | --- | --- | --- | --- |
| A | Mot de passe | 8+ **lettre + chiffre** | 8–72 seul | schéma aligné |
| B | OTP inscription | écran code + renvoi + cooldown | lien seul | `/auth/verify-email` |
| C | OTP récupération | code recovery in-app (2 temps) | lien seul | forgot-password 2 temps |
| D | « déjà inscrit » | détection identités vides | non détecté | détection ajoutée |
| E | Écran succès | `success` (vérifié/mdp changé) | absent | `/auth/success` |
| F | Résolution post-login | `resolving` → `useInitialRoute` | redirection directe | `/auth/resolving` + hook |
| G | Erreur de lien | inline sur login | `?error` jamais affiché | surfacée inline |
| H | Champ OTP | `OtpInput` mono-champ | absent | porté |
| I | Verrou récupération | `pendingAction=recovery` | absent | store de flux |
| J | Google | `useGoogleAuth` (gated) | absent | porté (gated env, off) |

**Fichiers créés**
- `features/auth/store.ts` — `useAuthFlowStore` (verrou `pendingRecovery`, port
  de `pendingAction`).
- `hooks/use-initial-route.ts` — port de `useInitialRoute` (recovery → statut →
  onboarding → profil → découverte).
- `components/ui/otp-input.tsx` — port d'`OtpInput` (mono-champ, collable).
- `app/auth/verify-email/page.tsx` — OTP inscription + renvoi cooldown 60s.
- `app/auth/success/page.tsx` — port d'`AuthSuccessScreen` (contexte vérif/reset).
- `app/auth/resolving/page.tsx` — port d'`AuthResolvingScreen` (sas de résolution
  + filet de sécurité profil).

**Fichiers modifiés**
- `features/auth/schema.ts` — mot de passe lettre+chiffre ; `otpSchema`.
- `features/auth/service.ts` — `verifySignupOtp`, `verifyRecoveryOtp`,
  `resendSignupEmail`, `signInWithGoogle` ; détection « déjà inscrit » ;
  `redirectTo` callback→resolving ; lien recovery porte `recovery=1` ; message
  d'erreur OTP.
- `lib/env.ts` — `NEXT_PUBLIC_GOOGLE_OAUTH_ENABLED` (défaut `false`).
- `components/feedback/error-state.tsx` — variante `inline` (parité `variant="inline"`).
- `app/auth/login/page.tsx` — erreurs inline (dont lien expiré), passage par
  `resolving` (avec `next`), bouton Google gated.
- `app/auth/register/page.tsx` — route vers `/auth/verify-email` (au lieu d'un
  bloc « vérifiez vos e-mails » inline).
- `app/auth/forgot-password/page.tsx` — phase OTP recovery (code + renvoi
  cooldown) ; arme le verrou avant de router vers reset.
- `app/auth/reset-password/page.tsx` — arme/lève `pendingRecovery` (lien
  `recovery=1` ou chemin OTP) ; succès → `/auth/success?context=reset`.
- `app/auth/callback/route.ts` — destination par défaut → `resolving`.

**Décisions de périmètre**
- **Prénom à l'inscription** : le mobile ne le collecte pas (fait à l'onboarding).
  Réconciliation **différée au J5** pour éviter un état cassé — le prénom reste
  au register pour l'instant.
- **Google** masqué tant que `NEXT_PUBLIC_GOOGLE_OAUTH_ENABLED!=="true"` (parité :
  le mobile masque si le provider n'est pas configuré).

**Tests réalisés** : `pnpm typecheck` ✅ · `pnpm lint` ✅ (0 erreur) ·
`pnpm build` ✅ (25 routes, dont `/auth/resolving` `/auth/success`
`/auth/verify-email`).
**Régressions** : aucune. Les flux existants restent valides ; ajout de l'OTP,
du sas de résolution, du verrou de récupération et de l'affichage d'erreur inline.

---

## Journal — Jalon 5 : Onboarding

**Objectif** : parité stricte du parcours d'onboarding mobile (source de vérité).
Le web avait un wizard mono-page partiel (9 étapes) ; on l'a amené à la parité
complète avec les **13 écrans** mobiles, dans le **même ordre UX** : `carousel →
name(1/8) → gender(2/8) → birthday(3/8) → looking-for(4/8) → interests(5/8) →
bio(6/8) → upload-photos(7/8) → lifestyle(8/8) → location-permission →
notification-permission → finish → resolving`.

**Analyse d'écarts (mobile = vérité → action)**

| # | Domaine | Mobile | Web (avant) | Comblé |
| --- | --- | --- | --- | --- |
| 1 | Identité | prénom **+ nom** (KYC), ≥2 | non collecté (prénom au register) | étape `NameStep` + réconciliation |
| 2 | Genre | +**non-binaire** | femme/homme | ajouté |
| 3 | Naissance | âge≥18 | âge≥18 | ✓ (input date web) |
| 4 | Recherche | +descriptions | présent | descriptions alignées |
| 5 | Localisation | permission géoloc (lat/lng), **skippable** | country/city **bloquant** | écran permission géoloc + saisie manuelle facultative, non bloquant |
| 6 | Intérêts | DB, min 3 | DB, min 3 | ✓ |
| 7 | Bio | min **20** / max **300** | min 1 / max 500 | bornes corrigées |
| 8 | Lifestyle | 5 cat. **DB** + repli | statiques | `fetchLifestyleOptions` + repli |
| 9 | Photos | min **2** / max 6 | optionnel | min 2 bloquant + persistance brouillon |
| 10 | Permissions | localisation + **notifications** | aucune | 2 écrans (push réel → J10) |
| 11 | Carousel | 3 slides | aucun | slides intro (visuels adaptés charte) |
| 12 | Finish | écrit prénom+nom+coords → **resolving** | persist sans nom → discover | enrichi + route → resolving |

**Fichiers créés**
- `features/onboarding/components/name-step.tsx` — identité (prénom+nom),
  préremplissage via `user_metadata`, note KYC (port `NameScreen`).
- `features/onboarding/components/permission-step.tsx` — écran de permission
  réutilisable (port `PermissionScreen`).
- `features/onboarding/components/location-step.tsx` — permission géoloc
  navigateur (coordonnées de proximité) + saisie pays/ville facultative.
- `features/onboarding/components/notification-step.tsx` — invite de
  notification navigateur (abonnement Web Push déféré au J10).
- `features/onboarding/components/carousel-step.tsx` — carousel d'intro.
- `features/onboarding/components/finish-step.tsx` — écran de fin (célébration,
  erreur inline + réessai).
- `features/onboarding/hooks/use-lifestyle-categories.ts` — fusion
  `lifestyle_options` (DB) + repli local.

**Fichiers modifiés**
- `features/onboarding/types.ts` — `firstName`/`lastName`, `latitude`/`longitude`,
  `photos` ; genre +`non-binaire` ; constantes de validation (MIN_NAME/MIN_AGE/
  MIN_BIO=20/MAX_BIO=300/MIN_PHOTOS=2/MAX_PHOTOS=6).
- `features/onboarding/config.ts` — genre non-binaire + descriptions ;
  `LIFESTYLE_CATEGORIES` (mapping `dbCategory`).
- `features/onboarding/service.ts` — `fetchLifestyleOptions` ; `persistOnboarding`
  écrit prénom/nom + coordonnées (`location_updated_at`).
- `features/onboarding/store.ts` — clé de persistance `…-v2` (nouveau format
  de brouillon).
- `features/onboarding/components/steps.tsx` — bio 20/300 ; lifestyle piloté DB ;
  retrait de Review/Location (remplacés).
- `features/onboarding/components/photos-step.tsx` — photos dans le brouillon
  persisté (condition min-2 fiable, survie au refresh), badge « Principal ».
- `features/onboarding/components/onboarding-wizard.tsx` — registre d'étapes
  fidèle (carousel/contenu/permission/finish), progression sur les 8 étapes de
  contenu, fin → `persistOnboarding` → `/auth/resolving`.
- `features/auth/schema.ts`, `app/auth/register/page.tsx`, `features/auth/service.ts`
  — **réconciliation** : le prénom n'est plus collecté à l'inscription (parité
  mobile), il l'est à l'onboarding (`NameStep`).

**Décisions de périmètre**
- **Architecture wizard** : on conserve le wizard mono-page (déjà choisi côté web,
  motif PWA adapté à un parcours séquentiel) plutôt que route-par-étape ; tous les
  écrans/validations/données/animations mobiles sont préservés.
- **Reverse-geocoding** : le mobile déduit ville/pays des coordonnées ; côté web
  on capture les coordonnées (proximité) via l'API Geolocation et on laisse la
  saisie manuelle facultative du lieu (plus fiable, pas de dépendance externe /
  risque CSP). Ville/pays éditables au profil (J6).
- **Notifications** : l'écran sollicite la permission navigateur ; l'abonnement
  Web Push (VAPID + SW) est bien du ressort du **Jalon 10** (décision J0).
- **Carousel** : les visuels plein écran natifs (photos) sont remplacés par des
  cartes au dégradé signature ; titres/descriptions identiques.

**Tests réalisés** : `pnpm typecheck` ✅ · `pnpm lint` ✅ (0 erreur) ·
`pnpm build` ✅ (25 routes).
**Régressions** : aucune. L'onboarding partiel devient complet ; l'inscription
perd son champ prénom (déplacé, pas supprimé) sans casser le flux auth (J4).

---

## Journal — Jalon 6 : Profil

**Objectif** : migrer tout le module profil mobile (le plus vaste) — mon profil,
hub d'édition + 11 éditeurs, complétion, aperçu, fiche publique, galerie —
fidèlement, en déférant proprement les liens transverses.

**Couche data créée** (`src/features/profile/`)
- `types.ts` — `Profile` normalisé (camelCase, relations agrégées),
  `computeProfileCompletion`, `calculateAge`, constantes.
- `service.ts` — `fetchOwnProfile` (relations), `fetchPublicProfile`
  (RPC `get_public_profile`), `updateProfile`, `setInterests`/`setLanguages`,
  photos (add/replace/delete/reorder via Edge `upload-photo`),
  `fetchProfileStats` (`get_my_profile_stats`), `recordProfileView`.
- `hooks/` — `useProfileQuery`/`useOtherProfileQuery`, `useUpdateProfile`/
  `Interests`/`Languages`, `usePhotoManagement`, `useProfileStats`,
  `useProfileDisplayData`, données de référence (langues/religions/éducation/
  objectifs ; intérêts et lifestyle réutilisés de l'onboarding).

**Écrans**
- `(app)/profile` — Mon profil : héros photo + identité, carte de complétion
  animée, bandeau de vérification, bio, puces d'intérêts, stats (likes/matches/
  taux), aperçu public, encart Premium.
- `(app)/profile/preview` — aperçu de son propre profil (composant partagé).
- `(app)/profile/[id]` — fiche publique **lecture seule** (RPC + `recordProfileView`).
- `(app)/profile/[id]/gallery` — galerie plein écran (swipe, flèches, compteur,
  zoom au clic).
- `edit-profile` — hub + 11 éditeurs (`basic-info`, `photos`, `bio`,
  `interests`, `lifestyle`, `languages`, `religion`, `education`, `job`,
  `height`, `preferences`), gardés par `RequireOnboarded`.
- `profile-completion` — écran réel (anneau SVG + checklist), remplace le
  placeholder du J3.
- Composants partagés : `ProfileDetailView`, `EditScreenLayout`, `InfoRow`,
  `ChoiceList` ; garde `RequireOnboarded`.

**Décisions de périmètre / fidélité**
- **Vue publique lecture seule** : la barre d'actions Découverte (J'aime /
  passer / favori) relève du Jalon 8, signaler/bloquer du Jalon 12. Le composant
  `ProfileDetailView` expose déjà les variantes ; les actions seront ajoutées.
- **Liens transverses** (Premium → J11, KYC/vérif & Paramètres → J12) : affichés
  fidèlement mais neutralisés par un toast « Bientôt disponible » plutôt que des
  404, en attendant leurs jalons.
- **Préférences** : maquette locale non persistée, comme sur mobile ; les vraies
  préférences de recherche relèvent du Jalon 7.
- **Réorganisation photos** : glisser-déposer HTML5 (équivalent web du drag par
  appui long) ; la progression fine d'upload du mobile n'est pas exposée par
  l'invocation Edge (état `isPending`). Galerie : zoom au clic (vs pincer natif).
- **Init des éditeurs** : dérivée en rendu (pattern React recommandé) plutôt que
  dans un effet, pour respecter `react-hooks/set-state-in-effect`.

**Tests réalisés** : `pnpm typecheck` ✅ · `pnpm lint` ✅ (0 erreur) ·
`pnpm build` ✅ (38 routes, dont 11 éditeurs + `/profile/[id]` + galerie + aperçu).
**Régressions** : aucune. La page profil passe de lecture seule à complète ; la
complétion devient réelle.

➡️ **Jalon 7 livré** (voir ci-dessous).

## Journal — Jalon 7 : Recherche avancée

**Analyse (source de vérité : `afrolove-world-mob`)** : le module `search`
mobile est un **constructeur de filtres purement UI**. Le hub
(`SearchFiltersHubScreen`) liste 11 filtres, chacun ouvrant un écran dédié qui
écrit dans `searchFiltersStore` (Zustand en mémoire, libellés d'options fixes).
Le bouton « Rechercher des profils » **ouvre simplement la découverte** — il
n'exécute aucune requête. L'application effective de ces critères (RPC
`search_profiles`, `filtersStore` de la découverte) est distincte et relève du
**Jalon 8** ; les deux stores mobiles ne doivent pas être confondus.

**Livré (parité 1:1 avec les 15 fichiers mobiles)** :
- `features/search/store.ts` — `useSearchFiltersStore` (port exact de
  `searchFiltersStore` : distance / âge / pays / ville / religion / langues[] /
  mode de vie[] / éducation / profession / taille / vérifié + setters/togglers).
- `features/search/components/search-field-layout.tsx` — chrome commun (fond
  crème + halo, retour, titre, « Appliquer » → `router.back()`).
- `features/search/components/range-stepper.tsx` — double compteur borné
  (min/max), réutilisé par âge et taille.
- `features/search/components/string-choice-list.tsx` — adaptateur `ChoiceList`
  (profil) pour des libellés bruts (pays/ville/religion/éducation).
- `app/search/page.tsx` — hub (11 lignes icône/libellé/valeur + « Rechercher »
  → découverte).
- `app/search/{distance,age,country,city,religion,languages,lifestyle,education,`
  `profession,height,verified}/page.tsx` — 11 écrans de filtre.
- `app/search/layout.tsx` — garde `RequireCompletedOnboarding`.

**Écarts assumés (fidèles au mobile)** : chips multi-sélection (langues/mode de
vie) via `Chip` signature ; `Switch` Radix pour « vérifié » ; `GlassInput` pour
profession ; halo/typographies de la charte. Aucune persistance (état en
mémoire, comme sur mobile). L'exécution de la recherche est déléguée à J8.

**Tests réalisés** : `pnpm typecheck` ✅ · `pnpm lint` ✅ (0 erreur) ·
`pnpm build` ✅ (12 routes `/search` prérendues). **Régressions** : aucune.

➡️ **Prochaine étape : Jalon 8 — Découverte & Matching** (deck de swipe,
`search_profiles` + `filtersStore`, likes/passes/superlikes, match & célébration,
limite quotidienne, application effective des filtres du Jalon 7). En attente de
feu vert.
