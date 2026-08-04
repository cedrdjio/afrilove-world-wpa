import { z } from "zod";

/**
 * Validation typée des variables d'environnement (fail-fast).
 * - Les variables `NEXT_PUBLIC_*` sont inlinées par Next au build : on doit
 *   donc les référencer explicitement (pas d'accès dynamique).
 * - Les secrets serveur ne sont jamais exposés au client.
 */

/**
 * Valeurs publiques par défaut du projet cible (Supabase).
 * L'URL et la clé `anon` sont PUBLIQUES par conception (protégées par la RLS ;
 * de toute façon inlinées dans le bundle client par toute variable NEXT_PUBLIC_*).
 * Elles servent de repli pour que le build/déploiement fonctionne même sans
 * variables d'environnement configurées ; définir les vraies variables dans
 * l'hébergeur (Vercel) les remplace automatiquement.
 */
const PUBLIC_SUPABASE_URL = "https://gfescsfdrwplsakazcpf.supabase.co";
const PUBLIC_SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdmZXNjc2ZkcndwbHNha2F6Y3BmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU0NTE2OTAsImV4cCI6MjEwMTAyNzY5MH0.oL7sWSZ4rvwoV_G628KntMrb0SRg5EbfLdi4i7Ek_ko";

const clientSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  NEXT_PUBLIC_APP_URL: z.string().url().default("http://localhost:3000"),
  // Active le bouton « Continuer avec Google » (provider OAuth à configurer côté
  // Supabase). Masqué par défaut, à l'image du gating par client-id du mobile.
  NEXT_PUBLIC_GOOGLE_OAUTH_ENABLED: z.enum(["true", "false"]).default("false"),
  // Clé publique VAPID pour l'abonnement Web Push (service worker). Optionnelle :
  // absente, l'enregistrement push no-op (comme le mobile sans `projectId` EAS).
  NEXT_PUBLIC_VAPID_PUBLIC_KEY: z.string().default(""),
});

const serverSchema = z.object({
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1).optional(),
});

const clientParsed = clientSchema.safeParse({
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  NEXT_PUBLIC_GOOGLE_OAUTH_ENABLED:
    process.env.NEXT_PUBLIC_GOOGLE_OAUTH_ENABLED,
  NEXT_PUBLIC_VAPID_PUBLIC_KEY: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
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
    clientParsed.data?.NEXT_PUBLIC_SUPABASE_URL ||
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY:
    clientParsed.data?.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    PUBLIC_SUPABASE_ANON_KEY,
  NEXT_PUBLIC_APP_URL:
    clientParsed.data?.NEXT_PUBLIC_APP_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    (process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : "http://localhost:3000"),
  NEXT_PUBLIC_GOOGLE_OAUTH_ENABLED:
    clientParsed.data?.NEXT_PUBLIC_GOOGLE_OAUTH_ENABLED ??
    (process.env.NEXT_PUBLIC_GOOGLE_OAUTH_ENABLED === "true"
      ? "true"
      : "false"),
  NEXT_PUBLIC_VAPID_PUBLIC_KEY:
    clientParsed.data?.NEXT_PUBLIC_VAPID_PUBLIC_KEY ||
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ||
    "",
} as const;

/** Env serveur uniquement (ne jamais importer dans un composant client). */
export const serverEnv = {
  SUPABASE_SERVICE_ROLE_KEY: serverParsed.data?.SUPABASE_SERVICE_ROLE_KEY ?? "",
} as const;
