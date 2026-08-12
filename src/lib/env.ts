import { z } from "zod";

/**
 * Validation typée des variables d'environnement (fail-fast).
 * - Les variables `NEXT_PUBLIC_*` sont inlinées par Next au build : on doit
 *   donc les référencer explicitement (pas d'accès dynamique).
 * - Les secrets serveur ne sont jamais exposés au client.
 */

/**
 * Configuration Supabase PUBLIQUE et FIGÉE du projet cible unique
 * (« afrolove-world », ref `xhpwmondzarbnzciruis`).
 *
 * L'URL et la clé `anon` sont publiques par conception (protégées par la RLS et
 * de toute façon inlinées dans le bundle client). L'app n'a qu'UN seul backend :
 * on épingle donc ces valeurs ici plutôt que de les lire depuis l'environnement.
 *
 * ⚠️ POURQUOI ON N'UTILISE PLUS `process.env.NEXT_PUBLIC_SUPABASE_*` :
 * une variable d'environnement définie sur l'hébergeur (Vercel) l'emporte
 * TOUJOURS sur le code au build. Une variable obsolète — laissée pointant vers
 * un ANCIEN projet Supabase désormais supprimé (`gfescsfdrwplsakazcpf`) —
 * écrasait silencieusement cette config : le navigateur tentait de joindre un
 * backend mort, `fetch` échouait avant tout appel réseau, et la connexion
 * affichait « Vérifiez votre réseau. ». En figeant la valeur ici, aucune
 * variable d'hébergeur périmée ne peut plus casser l'authentification.
 *
 * Pour changer de backend : modifier ces deux constantes (et rien d'autre).
 */
const SUPABASE_URL = "https://xhpwmondzarbnzciruis.supabase.co";
const SUPABASE_ANON_KEY =
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

// Seule `NEXT_PUBLIC_APP_URL` reste pilotable par l'environnement (origine des
// liens e-mail / OAuth). L'URL et la clé Supabase sont figées ci-dessus et ne
// sont volontairement PAS lues depuis l'env (cf. avertissement plus haut).
const appUrlSchema = z
  .string()
  .url()
  .catch("")
  .transform((v) => v || "");

const rawAppUrl = cleanEnv(process.env.NEXT_PUBLIC_APP_URL);
const parsedAppUrl = appUrlSchema.parse(rawAppUrl ?? "");

const serverSchema = z.object({
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1).optional(),
});

const serverParsed = serverSchema.safeParse({
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
});

/** Env client (sûr à utiliser côté navigateur). */
export const env = {
  // Figées : jamais surchargées par une variable d'hébergeur (voir plus haut).
  NEXT_PUBLIC_SUPABASE_URL: SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: SUPABASE_ANON_KEY,
  NEXT_PUBLIC_APP_URL:
    parsedAppUrl ||
    (process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : "http://localhost:3000"),
} as const;

/** Env serveur uniquement (ne jamais importer dans un composant client). */
export const serverEnv = {
  SUPABASE_SERVICE_ROLE_KEY: serverParsed.data?.SUPABASE_SERVICE_ROLE_KEY ?? "",
} as const;
