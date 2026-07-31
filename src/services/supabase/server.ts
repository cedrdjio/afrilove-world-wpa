import { cookies } from "next/headers";

import { createServerClient, type CookieOptions } from "@supabase/ssr";

import { env } from "@/lib/env";

/**
 * Client Supabase côté serveur (RSC, Route Handlers, Server Actions).
 * Lit/écrit les cookies de session via l'API `cookies()` de Next.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(
          cookiesToSet: {
            name: string;
            value: string;
            options: CookieOptions;
          }[],
        ) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch {
            // Appelé depuis un Server Component : ignorable, le middleware
            // rafraîchit déjà la session. (Pattern officiel @supabase/ssr.)
          }
        },
      },
    },
  );
}
