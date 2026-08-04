# MIGRATION_PROGRESS — afrilove-world-mob ➜ afrilove-world-wpa

> Document **vivant**, mis à jour à la fin de chaque jalon.
> Source de vérité : `afrolove-world-mob` (Expo). Cible : ce repo (Next.js).
> Détails : `docs/migration/PHASE1_AUDIT.md` · `docs/migration/PHASE2_MIGRATION_PLAN.md`.

**Avancement global : ~8 %**
_(auth + onboarding partiels, socle providers/UI/PWA en place ; cœur métier à migrer)_

Dernière mise à jour : 2026-08-04 — Phase 1 (audit) & Phase 2 (plan) livrées.

## Statut des jalons

| Jalon | Domaine | Statut |
| --- | --- | --- |
| 0 | Cadrage & décisions (admin, web push, CamerPay web) | ⏳ à valider |
| 1 | Architecture & fondations | 🟡 partiel |
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
- Ce tracker initialisé. **En attente de validation du plan et des décisions
  du Jalon 0 (admin, web push, CamerPay web) avant de démarrer le code du Jalon 1.**
