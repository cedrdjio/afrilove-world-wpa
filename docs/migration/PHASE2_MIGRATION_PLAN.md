# PHASE 2 — PLAN DE MIGRATION (par jalons)

> Cible : `afrilove-world-wpa` (Next.js 16). Source de vérité : `afrolove-world-mob`.
> Règle d'or : **un jalon = terminé + vérifié + `MIGRATION_PROGRESS.md` mis à jour**
> avant de passer au suivant. Chaque jalon est indépendant et livrable.

## Principes transverses (appliqués à chaque jalon)

- **TypeScript strict, zéro `any`.** Types dérivés de `src/types/database.ts`.
- **Parité de comportement** : comparer l'écran Expo avant de coder, lister les
  écarts, puis implémenter. Réutiliser la logique métier (services/RPC), ne jamais
  simplifier.
- **Architecture** : routes `app/**/page.tsx` minces → logique dans
  `src/features/<module>/` (miroir des `src/modules/<module>/` du mobile).
- **State** : TanStack Query (serveur) + Zustand (UI/local) + Context (rare).
  Reproduire les query keys et invalidations du mobile pour un comportement identique.
- **Formulaires** : react-hook-form + Zod (schémas repris du mobile).
- **UI** : Tailwind v4 + shadcn/ui + Radix + framer-motion + lucide-react.
  Reproduire la charte glass lavande.
- **Realtime** : `@supabase/supabase-js` navigateur (mêmes canaux/topics).
- **Sécurité** : RLS (déjà en base), validation serveur, headers, sanitization,
  rate-limit (déjà en base), pas de secret client.
- **A11y** : WCAG AA, clavier, ARIA. **SEO** sur les pages publiques.
- **Qualité** : ESLint + Prettier passent ; `pnpm typecheck` vert ; build OK.
- Chaque jalon produit : fichiers modifiés, fichiers créés, tests réalisés,
  régressions éventuelles, fonctionnalités migrées, % d'avancement global.

---

## Jalon 0 — Cadrage & décisions (préalable)

**But** : lever les ambiguïtés avant de coder.
- **Décision admin** : la PWA inclut-elle le back-office admin (55+ RPC `admin_*`) ?
  (le mobile n'a pas d'UI admin). → si oui, devient Jalon 12.
- **Web Push** : VAPID keys + stratégie Service Worker (déjà `public/sw.js`).
- **CamerPay web** : URLs de retour (`/premium/callback`) et webhooks (Edge déjà là).
- Confirmer la génération/synchro des types DB (`database.ts`).
- **Livrable** : ce plan validé + `MIGRATION_PROGRESS.md` initialisé.

## Jalon 1 — Architecture & fondations

- Arborescence `src/features/*` alignée sur les modules mobiles.
- Conventions : services (accès Supabase/RPC), hooks (TanStack), stores (Zustand),
  schémas Zod, types.
- Client Supabase navigateur + serveur (`@supabase/ssr`) — ✅ déjà présent, à durcir.
- `queryClient` config identique au mobile (staleTime, retry).
- Gardes de route serveur (`proxy.ts` / middleware) + gardes de layout.
- **Fichiers** : `src/features/README`, conventions, `lib/`, `services/supabase/*`.

## Jalon 2 — Design System (charte glass lavande)

- Tokens Tailwind (couleurs `#9B7EDE`, crème, violets, dégradés), fonts
  (Barlow, Montserrat, Nunito, Plus Jakarta Sans) via `next/font`.
- Portage des primitives UI mobiles → web : `GradientButton`, `GhostButton`,
  `GlassCard/Surface/Input`, `Chip`, `Avatar`, `Badges`, `BrandLogo`,
  `IconButton`, `ProgressSteps`, `RangeSlider`, `SettingsRow`, `ToggleSwitch`,
  `Typography`, `PhotoPlaceholder`, `ChoiceListEditor`.
- Layout : `ScreenBackground`, `GlowOrb`, `ScreenHeader`, `BottomNavBar`.
- Feedback : `EmptyState`, `ErrorState`, `LoadingSpinner`, `Skeleton`,
  `OfflineOverlay`. Lottie web (`hearts-loader`, `success-burst`, `empty-hearts`).
- Motion presets (transitions slide/fade équivalentes).

## Jalon 3 — Navigation & Shell

- App shell authentifié + `BottomNavBar` (4 onglets) + header.
- Groupes de routes : `(auth)`, `(onboarding)`, `(app)` avec gardes.
- États système (`/system/*`), `not-found`, offline.
- Badges de navigation (compteurs non-lus) câblés plus tard.

## Jalon 4 — Authentification (compléter)

- Register + **consentement légal** (écran `legal/[key]`, `legalConsentStore`).
- **Google OAuth** (callback route déjà `auth/callback`).
- Verify-email + templates, resolving deep-link, success.
- Parité gardes : `RequireAuth`, `RequireCompletedOnboarding`, routage initial.

## Jalon 5 — Onboarding (parité 12 étapes)

- Étapes exactes : name, birthday, gender, looking-for, interests, lifestyle,
  bio, location-permission, notification-permission, upload-photos, carousel, finish.
- Store, progress, validation Zod par étape, upload photos (Edge `upload-photo`).
- Complétion → `profile_completed` trigger.

## Jalon 6 — Profil (mon profil + édition + public)

- Mon profil (`MyProfileScreen`), profil public `/profile/[id]` + galerie.
- Édition : hub + 13 écrans (basic-info, bio, photos, interests, languages,
  lifestyle, education, job, height, religion, preferences, completion, preview).
- Gestion photos (réordonnancement, principale, suppression), stats, vues
  (`record_profile_view`), données de référence (catalogues).

## Jalon 7 — Recherche avancée

- Hub `/search` + 11 filtres (age, city, country, distance, education, height,
  languages, lifestyle, profession, religion, verified), store `searchFiltersStore`,
  `RangeStepper`, `SearchFieldLayout`.

## Jalon 8 — Découverte & Matching

- Deck de swipe (`search_profiles`, deckStore, filtersStore), `SwipeCard`
  (framer-motion drag), `ActionButtons`, compteur « Voir N ».
- Likes/passes/superlikes (table `swipes`), match par trigger + célébration.
- Favoris / likers (premium), limite quotidienne, recherche texte libre.
- **Localisation** : `navigator.geolocation` → `useLocationSync`, distance,
  **diaspora country matching**.

## Jalon 9 — Messagerie (temps réel)

- Liste conversations (`get_my_conversations`), chat `/chat/[id]` temps réel
  (Realtime `postgres_changes`), envoi, lecture (`mark_messages_read`), non-lus.
- Présence (canal `online-members`), emoji picker, action sheet (bloquer/signaler).
- Texte uniquement (pas de pièces jointes — parité stricte).

## Jalon 10 — Notifications

- In-app + Realtime (`notifications`), `NotificationsScreen`, badge compteur.
- **Web Push** (VAPID + Service Worker, `push_tokens`), navigation au clic.

## Jalon 11 — Paiements (Premium / CamerPay)

- Landing, pricing, features, checkout, locked, callback/success/failed.
- `usePremium`, entitlements, achat CamerPay (Edge Functions déjà là),
  déverrouillage likers/limites/filtres.

## Jalon 12 — Modération, comptes & légal (+ Admin si décidé)

- Reports (`/reports/[id]` + confirmation), blocage (`blocked-users`).
- Réglages : hub + account, security, privacy, notifications, change-email/password,
  delete-account, logout, activity logs (`client_logs`).
- KYC complet (upload-id, selfie, recap, pending/approved/rejected).
- Documents légaux (`legal/[key]`).
- **Admin (optionnel, si Jalon 0 le décide)** : back-office desktop sur la surface
  RPC `admin_*` (users, kyc, reports, photos, subscriptions, plans, coupons,
  templates, broadcasts, analytics, dashboard, audit, tickets, RBAC).

## Jalon 13 — Optimisations (perf + PWA + SEO)

- Code splitting, dynamic imports, lazy, memoization, virtualisation des listes
  (conversations, deck), optimisation images (`next/image`, Supabase transform),
  préchargement des routes, cache intelligent (React Query persistence).
- PWA : offline, background sync, install, notifications (finalisation).
- SEO : métadonnées par page publique, sitemap/robots (déjà présents).

## Jalon 14 — QA & non-régression

- Parcours complet contre la matrice §20 de l'audit ; tests unitaires ciblés
  (schémas Zod, mapping services, utilitaires), a11y (clavier/ARIA), Lighthouse.
- Vérification écran par écran vs mobile ; correction des écarts détectés.

## Jalon 15 — Production

- Headers de sécurité (`next.config`), CSRF, rate-limit (déjà DB), env de prod,
  monitoring (Sentry optionnel), build & déploiement (Vercel), checklist store.

---

## Ordonnancement & dépendances

```
J1 Archi ─▶ J2 Design ─▶ J3 Shell ─┬▶ J4 Auth ─▶ J5 Onboarding ─▶ J6 Profil
                                    ├▶ J7 Search ─┐
                                    │             ├▶ J8 Discovery/Matching ─▶ J9 Chat
                                    │             │
                                    └▶ (référentiels catalogues, partagés)
J9 ─▶ J10 Notifications ─▶ J11 Premium ─▶ J12 Modération/Admin ─▶ J13 Perf/PWA/SEO ─▶ J14 QA ─▶ J15 Prod
```

Chaque jalon suit **Phase 3** : (1) analyser l'écran Expo, (2) comparer au web,
(3) lister les écarts, (4) coder, (5) vérifier la parité, (6) mettre à jour
`MIGRATION_PROGRESS.md` et le % global.
