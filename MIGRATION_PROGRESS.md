# MIGRATION_PROGRESS — afrilove-world-mob ➜ afrilove-world-wpa

> Document **vivant**, mis à jour à la fin de chaque jalon.
> Source de vérité : `afrolove-world-mob` (Expo). Cible : ce repo (Next.js).
> Détails : `docs/migration/PHASE1_AUDIT.md` · `docs/migration/PHASE2_MIGRATION_PLAN.md`.

**Avancement global : ~22 %**
_(fondations + design system + navigation/shell posés ; auth + onboarding partiels ; cœur métier à migrer)_

Dernière mise à jour : 2026-08-04 — Jalon 3 (Navigation & Shell) livré.

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
| 4 | Authentification | 🟡 partiel |
| 5 | Onboarding (12 étapes) | 🟡 partiel |
| 6 | Profil (mon profil / édition / public) | ❌ à faire |
| 7 | Recherche avancée | ❌ à faire |
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
- [ ] Parité 12 étapes (name→finish)
- [ ] Permission GPS
- [ ] Permission notifications
- [ ] Upload photos (Edge upload-photo)
- [ ] Carousel + finish + complétion

### Profil
- [ ] Mon profil (partiel : lecture seule)
- [ ] Profil public `/profile/[id]` + galerie
- [ ] Édition (13 écrans)
- [ ] Gestion photos (réordre / principale / suppression)
- [ ] Stats & vues de profil
- [ ] Complétion profil
- [ ] Données de référence (catalogues complets)

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
- [ ] Hub + 11 filtres (age, city, country, distance, education, height, languages, lifestyle, profession, religion, verified)

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

➡️ **Prochaine étape : Jalon 4 — Authentification** (welcome, login, register,
mot de passe oublié/reset, vérification e-mail, deep links de récupération,
`resolving`/`success`, mapping d'erreurs auth). En attente de feu vert.
