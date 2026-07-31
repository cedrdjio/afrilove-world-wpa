import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import { env } from "@/lib/env";

/**
 * Rafraîchit la session Supabase à chaque requête et propage les cookies.
 * Infrastructure de session (pas une fonctionnalité métier) : aucune
 * redirection d'auth n'est appliquée au Sprint 00 — les routes protégées
 * seront ajoutées au Sprint 01.
 */
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  // Sans configuration Supabase (build/preview), on ne casse pas la requête.
  if (!env.NEXT_PUBLIC_SUPABASE_URL || !env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return response;
  }

  const supabase = createServerClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(
          cookiesToSet: {
            name: string;
            value: string;
            options: CookieOptions;
          }[],
        ) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // IMPORTANT : ne rien insérer entre la création du client et getUser().
  await supabase.auth.getUser();

  return response;
}
