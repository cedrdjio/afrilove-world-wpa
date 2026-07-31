# Configuration non exportable par SQL (à re-saisir sur le clone)

Certains réglages ne vivent pas dans la base Postgres et ne peuvent donc pas
être capturés par l'export SQL. Voici la liste exhaustive de ce qu'il faut
reconfigurer **manuellement** sur le projet cible pour un clone fidèle.

## 1. Secrets des Edge Functions (variables d'environnement)

Définis via `supabase secrets set` ou Dashboard → Edge Functions → Secrets.
Ils ne sont **jamais** lisibles via SQL (par conception). Les fonctions les
attendent :

| Secret | Utilisé par | Notes |
|---|---|---|
| `S3_ACCESS_KEY_ID` | upload-photo, upload-kyc | Clé S3 du Storage Supabase (Dashboard → Storage → S3 access keys) |
| `S3_SECRET_ACCESS_KEY` | upload-photo, upload-kyc | idem |
| `CAMERPAY_API_TOKEN` | payment-initiate, payment-webhook, payment-status | aussi stocké dans le Vault (voir export/secrets/) |
| `CAMERPAY_WEBHOOK_SECRET` | payment-webhook | idem Vault |
| `CAMERPAY_BASE_URL` | paiements | optionnel, défaut `https://camerpay.biz` |
| `CAMERPAY_RETURN_URL` | payment-initiate | optionnel |
| `APP_RETURN_SCHEME` | payment-return | optionnel, défaut `afrolove://premium/callback` |

`SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` sont injectés
automatiquement par la plateforme — ne pas les définir à la main.

## 2. Auth — providers, URLs, templates

Dashboard → Authentication. À reconfigurer :

- **Site URL** et **Redirect URLs** (inclure `afrolove://premium/callback`).
- **Email/Password** activé ; confirmations d'e-mail (source : off).
- **Providers OAuth** éventuels (Google, Apple…) : re-saisir client_id/secret.
- **Templates d'e-mails** (les images pointent vers le bucket `branding`).
- La table `auth.oauth_clients` de la source contient 1 ligne — recréez le
  client OAuth correspondant côté cible si vous utilisez « Sign in with Supabase ».

## 3. Extensions Postgres installées (source)

Recréées par les migrations quand nécessaire (`postgis` l'est explicitement).
Liste installée sur la source, pour référence :

`pg_net`, `pg_stat_statements`, `pgcrypto`, `plpgsql`, `postgis`,
`supabase_vault`, `uuid-ossp`.

## 4. Realtime

La migration `messaging_account_status_legal` fait
`alter publication supabase_realtime add table public.messages`. Vérifiez que
Realtime est activé sur le projet cible (il l'est par défaut).

## 5. Divers

- `app_settings` (maintenance_mode, feature_flags…) : exporté dans les données.
- Aucune tâche `pg_cron` n'est installée sur la source.
