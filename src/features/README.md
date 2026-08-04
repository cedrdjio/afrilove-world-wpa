# features/

Architecture **Feature-Sliced verticale**, miroir des `src/modules/<feature>/`
de l'app mobile (source de vérité). Chaque fonctionnalité métier vit dans son
propre dossier autonome, livré **jalon par jalon** (voir
`docs/migration/PHASE2_MIGRATION_PLAN.md`).

## Modules cibles (alignés sur le mobile)

```
features/
  auth/           # J4  — login, register, OAuth Google, reset, verify, gardes
  onboarding/     # J5  — assistant 12 étapes, upload photos, complétion
  profile/        # J6  — mon profil, profil public, édition (13 écrans), photos
  search/         # J7  — recherche avancée (11 filtres)
  discovery/      # J8  — deck de swipe, filtres, likes/pass/superlike, favoris
  matches/        # J8  — liste des matchs, célébration
  messaging/      # J9  — conversations, chat temps réel, présence, emoji
  notifications/  # J10 — in-app realtime, Web Push, badge
  premium/        # J11 — plans, checkout CamerPay, entitlements
  kyc/            # J12 — vérification (upload id, selfie, statuts)
  reports/        # J12 — signalement
  blocked-users/  # J12 — blocage
  settings/       # J12 — réglages, compte, sécurité, confidentialité, journal
  legal/          # J12 — documents légaux, consentement
  system/         # J3  — états système (offline, maintenance, erreurs…)
  favorites/      # J8  — favoris / « qui m'a liké » (premium)
```

## Convention interne d'une feature

```
<feature>/
  components/   # UI spécifique à la feature (client components)
  hooks/        # logique React (TanStack Query + état local), ex. use-discovery.ts
  services/     # accès données Supabase / RPC, mapping, règles métier
  stores/       # état local Zustand (filtres, brouillons, deck…)
  schema.ts     # validation Zod (repris/porté des schémas mobiles)
  types.ts      # types de la feature
  index.ts      # surface publique (ce que les autres features importent)
```

## Règles d'or (parité avec le mobile)

- **Aucune logique métier dans les composants UI partagés** (`src/components/`).
  Le partagé reste agnostique ; le métier vit dans `features/`.
- **Query keys** : toujours importer depuis `src/lib/query-keys.ts` — jamais de
  chaîne de clé en dur. Les invalidations croisées doivent reproduire celles du
  mobile (ex. un swipe invalide `entitlements` + `favorites`).
- **Erreurs** : normaliser via `mapToAppError` (`src/lib/errors.ts`) et rendre
  avec les composants feedback (`ErrorState`).
- **Services** : la logique d'accès aux données reproduit fidèlement le service
  mobile équivalent (mêmes RPC, mêmes mappings). Ne jamais simplifier.
- **Pages** (`src/app/**/page.tsx`) : minces adaptateurs qui montent un écran de
  feature — comme les fichiers `app/**` d'expo-router.
