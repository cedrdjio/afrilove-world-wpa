# features/

Architecture **Feature First**. Chaque fonctionnalité métier vit dans son
propre dossier autonome, ajouté au fil des sprints, par ex. :

```
features/
  auth/          # Sprint 01 — connexion, OTP, session
  onboarding/    # Sprint 01 — splash, intro, préférences
  profile/       # Sprint 01 — création & édition de profil
  discovery/     # Sprint 02 — swipe, matching
  chat/          # Sprint 03 — messagerie temps réel
  premium/       # Sprint 04 — abonnement & paiements
```

Convention interne d'une feature :

```
<feature>/
  components/   # UI spécifique à la feature
  hooks/        # logique React (data + état local)
  services/     # accès données (Supabase) et règles métier
  schemas/      # validation Zod
  types.ts      # types de la feature
  index.ts      # surface publique (ce que les autres features importent)
```

Règle d'or : **aucune logique métier dans les composants UI partagés**
(`src/components/`). Le partagé reste agnostique ; le métier reste dans `features/`.
