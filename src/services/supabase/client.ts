import { createBrowserClient } from "@supabase/ssr";

import { env } from "@/lib/env";
import type { Database } from "@/types/database";

/**
 * Client Supabase côté navigateur (singleton implicite géré par @supabase/ssr).
 * À utiliser dans les composants client et les hooks.
 *
 * NOTE Sprint 00 : aucune logique d'authentification n'est branchée ici — on
 * ne fournit que le client. Les flux de session arriveront au Sprint 01.
 */
export function createClient() {
  return createBrowserClient<Database>(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}
