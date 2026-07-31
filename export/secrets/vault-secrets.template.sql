-- Supabase Vault secrets — TEMPLATE (safe to commit; no real values).
--
-- The REAL values were exported to  export/secrets/vault-secrets.real.sql
-- which is gitignored (it contains live CamerPay credentials). Keep that file
-- out of version control. To restore the vault on the target project, run the
-- real file in the target's SQL editor, or fill in the values below and run this.
--
-- These are read at runtime by the payment Edge Functions through the
-- public.get_app_secret(name) RPC (service_role only) — see the
-- app_secrets_vault_accessor migration.

select vault.create_secret('<CAMERPAY_API_TOKEN value>',     'CAMERPAY_API_TOKEN',     'Token API CamerPay (live, dashboard /client/api)');
select vault.create_secret('<CAMERPAY_WEBHOOK_SECRET value>', 'CAMERPAY_WEBHOOK_SECRET', 'Secret HMAC webhook CamerPay');
