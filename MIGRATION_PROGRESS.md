# MIGRATION_PROGRESS — afrilove-world-mob ➜ afrilove-world-wpa

> Document **vivant**, mis à jour à la fin de chaque jalon.
> Source de vérité : `afrolove-world-mob` (Expo). Cible : ce repo (Next.js).
> Détails : `docs/migration/PHASE1_AUDIT.md` · `docs/migration/PHASE2_MIGRATION_PLAN.md`.

**Avancement global : ~11 %**
_(fondations Jalon 1 posées ; auth + onboarding partiels ; cœur métier à migrer)_

Dernière mise à jour : 2026-08-04 — Jalon 1 (Architecture & fondations) livré.

### Décisions du Jalon 0 (validées)
- **Admin** : reporté — décision tranchée avant le Jalon 12 (hors périmètre pour l'instant).
- **Notifications web** : **Web Push complet** (VAPID + Service Worker) au Jalon 10.
- **CamerPay web** : URLs de retour `/premium/callback` + webhooks (Edge Functions déjà présentes).

## Statut des jalons

| Jalon | Domaine | Statut |
| --- | --- | --- |
| 0 | Cadrage & décisions (admin, web push, CamerPay web) | ✅ validé |
| 1 | Architecture & fondations | ✅ terminé |
| 2 | Design System (glass lavande) | 🟡 partiel |
| 3 | Navigation & Shell | 🟡 partiel |
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
lors de la refonte du `BottomNav`.

➡️ **Prochaine étape : Jalon 2 — Design System (charte glass lavande).**
En attente de feu vert avant de démarrer le code du Jalon 2.
