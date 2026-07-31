# Restaurer / cloner « afrolove-world » sur un nouveau Supabase

Ce dépôt est un **export complet** du projet Supabase source
`afrolove-world` (ref `xhpwmondzarbnzciruis`, région eu-west-3, Postgres 17).
Il permet de recréer le projet à l'identique sur n'importe quelle nouvelle base
Supabase.

## Contenu de l'export

| Chemin | Ce que c'est |
|---|---|
| `supabase/migrations/` | **49 migrations** = toute la structure (tables, RLS, triggers, fonctions/RPC, index, buckets). SQL exact rejoué par `supabase db push`. |
| `supabase/functions/` | **6 Edge Functions** (upload-photo, upload-kyc, payment-initiate/-webhook/-return/-status). |
| `supabase/config.toml` | Config CLI + réglages `verify_jwt` par fonction. |
| `export/data/seed.sql` | **Toutes les données** des 38 tables `public` (INSERT idempotents). |
| `export/auth/auth_data.sql` | **134 comptes** `auth.users` + `auth.identities` (mots de passe conservés → les connexions marchent). |
| `export/storage/01_buckets.sql` | Recrée les 3 buckets (branding, kyc-documents, profile-photos). |
| `export/storage/objects_manifest.json` | Liste des **89 fichiers** de stockage à recopier. |
| `export/secrets/vault-secrets.real.sql` | Secrets Vault **réels** (gitignoré — non versionné). |
| `export/secrets/vault-secrets.template.sql` | Modèle sans valeurs (versionné). |
| `export/config/README_CONFIG.md` | Ce qui n'est **pas** exportable par SQL (secrets Edge Functions, providers auth…). |
| `scripts/migrate-storage-files.mjs` | Copie les fichiers binaires source → cible. |

> ⚠️ **Données sensibles.** `export/auth/auth_data.sql` et `export/data/seed.sql`
> contiennent des données personnelles réelles (e-mails, hash de mots de passe,
> KYC, messages). Gardez ce dépôt privé. Les secrets tiers (CamerPay) ne sont
> **pas** dans Git (gitignorés).

---

## Procédure de restauration

### 0. Prérequis
- [Supabase CLI](https://supabase.com/docs/guides/local-development) installée.
- Node.js (pour le script de stockage) + `npm i @supabase/supabase-js`.

### 1. Créer le projet cible et lier
```bash
# Créez un nouveau projet dans le dashboard Supabase (notez son <REF> et le mot de passe DB).
supabase link --project-ref <REF>
```

### 2. Recréer la structure (les 49 migrations)
```bash
supabase db push
```
Cela crée tables, RLS, triggers, fonctions, index, buckets, et re-seed les
catalogues de référence.

### 3. Déployer les Edge Functions
```bash
supabase functions deploy upload-photo upload-kyc payment-initiate \
  payment-webhook payment-return payment-status
```
Les réglages `verify_jwt` sont dans `supabase/config.toml`
(**payment-webhook** et **payment-return** doivent rester `verify_jwt = false`).

### 4. Définir les secrets des Edge Functions
Voir `export/config/README_CONFIG.md`. Par ex :
```bash
supabase secrets set S3_ACCESS_KEY_ID=... S3_SECRET_ACCESS_KEY=... \
  CAMERPAY_API_TOKEN=... CAMERPAY_WEBHOOK_SECRET=...
```

### 5. Restaurer les secrets Vault
Dans l'éditeur SQL du projet cible, exécutez le contenu de
`export/secrets/vault-secrets.real.sql` (ou remplissez le template).

### 6. Charger les données (auth + public)
Les triggers doivent être désactivés pendant le chargement (sinon le trigger
`on_auth_user_created` crée des profils partiels qui bloquent l'import des vrais
profils). Utilisez `session_replication_role = replica`.

Via **psql** (recommandé — remplacez l'hôte/mot de passe cible) :
```bash
PGOPTIONS="-c session_replication_role=replica" \
  psql "postgresql://postgres:<DB_PASSWORD>@db.<REF>.supabase.co:5432/postgres" \
  -v ON_ERROR_STOP=1 \
  -f export/auth/auth_data.sql \
  -f export/data/seed.sql
```
Ou via l'**éditeur SQL** du dashboard : ouvrez une requête, exécutez
`set session_replication_role = replica;` puis collez le contenu de
`auth_data.sql`, puis de `seed.sql`, puis `set session_replication_role = origin;`.

### 7. Copier les fichiers de stockage (89 objets)
```bash
SRC_SUPABASE_URL=https://xhpwmondzarbnzciruis.supabase.co \
SRC_SERVICE_KEY=<service_role de la SOURCE> \
DST_SUPABASE_URL=https://<REF>.supabase.co \
DST_SERVICE_KEY=<service_role de la CIBLE> \
node scripts/migrate-storage-files.mjs
```

### 8. Réécrire les URLs de stockage stockées en base
`profiles.avatar_url` et `profile_photos.url` contiennent l'URL publique avec le
**ref de la source**. Mettez-les à jour vers la cible (éditeur SQL cible) :
```sql
update public.profile_photos
  set url = replace(url, 'xhpwmondzarbnzciruis', '<REF>');
update public.profiles
  set avatar_url = replace(avatar_url, 'xhpwmondzarbnzciruis', '<REF>')
  where avatar_url is not null;
```

### 9. Reconfigurer l'authentification
Dashboard → Authentication : Site URL, Redirect URLs
(inclure `afrolove://premium/callback`), providers OAuth, templates d'e-mails.
Détails dans `export/config/README_CONFIG.md`.

### 10. Vérifier
```sql
select count(*) from auth.users;        -- attendu : 134
select count(*) from public.profiles;   -- attendu : 134
select count(*) from public.swipes;     -- attendu : 164
```
Testez une connexion, l'écran Découvrir, l'upload de photo, un paiement sandbox.

---

## Notes de fidélité
- L'export a été réalisé via les outils MCP (sans mot de passe DB). La structure
  provient du SQL **exact** des migrations stockées côté serveur ; les données
  via `json_agg`/`json_populate_recordset` (types préservés, colonnes générées
  comme `profiles.location` exclues et recalculées automatiquement).
- Rôles/droits personnalisés au niveau cluster ne sont pas couverts (aucun
  au-delà des grants inclus dans les migrations).
- Les sessions/refresh tokens ne sont pas migrés (les utilisateurs se
  reconnectent) — c'est volontaire et sans impact.
