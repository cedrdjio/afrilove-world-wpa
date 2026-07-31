import { z } from "zod";

/**
 * Validation typée des variables d'environnement (fail-fast).
 * - Les variables `NEXT_PUBLIC_*` sont inlinées par Next au build : on doit
 *   donc les référencer explicitement (pas d'accès dynamique).
 * - Les secrets serveur ne sont jamais exposés au client.
 */

const clientSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  NEXT_PUBLIC_APP_URL: z.string().url().default("http://localhost:3000"),
});

const serverSchema = z.object({
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1).optional(),
});

const clientParsed = clientSchema.safeParse({
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
});

if (!clientParsed.success) {
  // En dev/prod on veut échouer tôt ; au build sans env on tolère (placeholders).
  const message = clientParsed.error.issues
    .map((i) => `  · ${i.path.join(".")}: ${i.message}`)
    .join("\n");
  if (process.env.NODE_ENV === "development") {
    console.warn(
      `[env] Variables d'environnement manquantes ou invalides :\n${message}\n` +
        `Copiez .env.example vers .env.local et renseignez vos clés Supabase.`,
    );
  }
}

const serverParsed = serverSchema.safeParse({
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
});

/** Env client (sûr à utiliser côté navigateur). */
export const env = {
  NEXT_PUBLIC_SUPABASE_URL:
    clientParsed.data?.NEXT_PUBLIC_SUPABASE_URL ??
    process.env.NEXT_PUBLIC_SUPABASE_URL ??
    "",
  NEXT_PUBLIC_SUPABASE_ANON_KEY:
    clientParsed.data?.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
    "",
  NEXT_PUBLIC_APP_URL:
    clientParsed.data?.NEXT_PUBLIC_APP_URL ??
    process.env.NEXT_PUBLIC_APP_URL ??
    "http://localhost:3000",
} as const;

/** Env serveur uniquement (ne jamais importer dans un composant client). */
export const serverEnv = {
  SUPABASE_SERVICE_ROLE_KEY: serverParsed.data?.SUPABASE_SERVICE_ROLE_KEY ?? "",
} as const;
