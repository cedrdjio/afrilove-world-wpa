import { createClient } from "./client";

/**
 * Singleton client Supabase navigateur, créé paresseusement au premier appel
 * (jamais à l'import : sûr pour le rendu serveur). Toutes les couches d'accès
 * (services, hooks TanStack Query, abonnements Realtime) passent par ici afin
 * de partager UNE seule instance — donc une seule socket Realtime.
 */
type BrowserClient = ReturnType<typeof createClient>;

let client: BrowserClient | null = null;

export function db(): BrowserClient {
  return (client ??= createClient());
}
