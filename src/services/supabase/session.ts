import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import { env } from "@/lib/env";
import { PROTECTED_PREFIXES, ROUTES } from "@/constants/routes";

/** Écrans d'auth d'où l'on éloigne un membre déjà connecté (pas callback/reset). */
const AUTH_ENTRY_PATHS: string[] = [
  ROUTES.auth,
  ROUTES.login,
  ROUTES.register,
  ROUTES.forgotPassword,
];

function hasPrefix(pathname: string, prefixes: readonly string[]): boolean {
  return prefixes.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

/**
 * Rafraîchit la session Supabase à chaque requête ET applique la protection
 * des routes (Sprint 01) :
 *  - visiteur anonyme sur une route protégée → /auth/login?next=…
 *  - membre connecté sur un écran d'auth d'entrée → /discover
 * Les cookies rafraîchis sont propagés sur la réponse de redirection.
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
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  // Anonyme sur une route protégée → connexion (en mémorisant la destination).
  if (!user && hasPrefix(pathname, PROTECTED_PREFIXES)) {
    const url = request.nextUrl.clone();
    url.pathname = ROUTES.login;
    url.search = `?next=${encodeURIComponent(pathname)}`;
    return redirectWithCookies(url, response);
  }

  // Connecté sur un écran d'auth d'entrée → app.
  if (user && AUTH_ENTRY_PATHS.includes(pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = ROUTES.discover;
    url.search = "";
    return redirectWithCookies(url, response);
  }

  // Les autres routes /auth (callback, reset-password) restent accessibles :
  // la garde ci-dessus est volontairement ciblée sur les écrans d'entrée.
  return response;
}

/** Redirige en conservant les cookies de session posés sur `from`. */
function redirectWithCookies(url: URL, from: NextResponse): NextResponse {
  const redirect = NextResponse.redirect(url);
  from.cookies.getAll().forEach((cookie) => redirect.cookies.set(cookie));
  return redirect;
}
