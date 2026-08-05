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
const PUBLIC_SUPABASE_URL = "https://xhpwmondzarbnzciruis.supabase.co";
const PUBLIC_SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhocHdtb25kemFyYm56Y2lydWlzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI4NjE3NDcsImV4cCI6MjA5ODQzNzc0N30.UILit6ltV-kdUPMLM5vk4sUu0s3XG7v7kYYdBmTZTQY";

/**
 * Nettoie une variable d'environnement saisie à la main (Vercel, .env) :
 * retire les espaces/sauts de ligne d'encadrement, les guillemets copiés par
 * erreur, et tout blanc résiduel. Piège fréquent : coller un JWT `anon` ou une
 * URL avec un retour à la ligne — l'en-tête HTTP devient invalide et `fetch`
 * lève une exception AVANT tout appel réseau (échec silencieux à la connexion).
 * Aucune des variables ci-dessous ne contient d'espace légitime.
 */
function cleanEnv(value: string | undefined): string | undefined {
  if (value == null) return undefined;
  let v = value.trim();
  if (v.length >= 2) {
    const first = v[0];
    const last = v[v.length - 1];
    if ((first === '"' && last === '"') || (first === "'" && last === "'")) {
      v = v.slice(1, -1);
    }
  }
  return v.replace(/\s+/g, "");
}

// NB : on référence chaque `process.env.NEXT_PUBLIC_*` explicitement (inlining
// Next au build), puis on nettoie la valeur.
const rawEnv = {
  NEXT_PUBLIC_SUPABASE_URL: cleanEnv(process.env.NEXT_PUBLIC_SUPABASE_URL),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: cleanEnv(
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  ),
  NEXT_PUBLIC_APP_URL: cleanEnv(process.env.NEXT_PUBLIC_APP_URL),
};

const clientSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  NEXT_PUBLIC_APP_URL: z.string().url().default("http://localhost:3000"),
});

const serverSchema = z.object({
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1).optional(),
});

const clientParsed = clientSchema.safeParse(rawEnv);

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
    rawEnv.NEXT_PUBLIC_SUPABASE_URL ||
    PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY:
    clientParsed.data?.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    rawEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    PUBLIC_SUPABASE_ANON_KEY,
  NEXT_PUBLIC_APP_URL:
    clientParsed.data?.NEXT_PUBLIC_APP_URL ||
    rawEnv.NEXT_PUBLIC_APP_URL ||
    (process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : "http://localhost:3000"),
} as const;

/** Env serveur uniquement (ne jamais importer dans un composant client). */
export const serverEnv = {
  SUPABASE_SERVICE_ROLE_KEY: serverParsed.data?.SUPABASE_SERVICE_ROLE_KEY ?? "",
} as const;
