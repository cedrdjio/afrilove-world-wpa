# afrolove-world — export Supabase complet

Export intégral et **rejouable** du projet Supabase `afrolove-world`
(application de rencontres AfriLove World), destiné à cloner le projet à
l'identique sur une autre base Supabase.

## 👉 Pour restaurer / cloner : voir [`RESTORE.md`](./RESTORE.md)

## Aperçu

- **Structure** : 49 migrations (`supabase/migrations/`) — tables, RLS,
  triggers, fonctions/RPC, index, buckets.
- **Edge Functions** : 6 (`supabase/functions/`) — upload photo/KYC + paiements CamerPay.
- **Données** : 38 tables `public` (`export/data/seed.sql`), 134 comptes auth
  (`export/auth/auth_data.sql`).
- **Stockage** : 3 buckets + manifeste de 89 fichiers (`export/storage/`) +
  script de copie (`scripts/migrate-storage-files.mjs`).
- **Secrets / config** : Vault (gitignoré) + `export/config/README_CONFIG.md`
  pour tout ce qui se re-saisit à la main.

## Source

| | |
|---|---|
| Projet | `afrolove-world` |
| Ref | `xhpwmondzarbnzciruis` |
| Région | eu-west-3 |
| Postgres | 17 |

> Dépôt à garder **privé** : contient des données personnelles réelles.
> Les scripts `scripts/_*.py` ont servi à générer l'export.
