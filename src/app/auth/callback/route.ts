import { NextResponse, type NextRequest } from "next/server";

import { createClient } from "@/services/supabase/server";
import { ROUTES } from "@/constants/routes";

/**
 * Point d'atterrissage des liens e-mail (confirmation d'inscription, lien de
 * réinitialisation). Échange le `code` PKCE contre une session (cookies posés
 * par le client serveur), puis redirige vers `next`.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const nextParam = searchParams.get("next");
  // Par défaut : passer par le sas de résolution (parité mobile) qui route
  // vers recovery/onboarding/profil/découverte selon l'état réel du compte.
  const next =
    nextParam && nextParam.startsWith("/") ? nextParam : ROUTES.authResolving;

  if (!code) {
    return NextResponse.redirect(
      `${origin}${ROUTES.login}?error=lien_invalide`,
    );
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return NextResponse.redirect(`${origin}${ROUTES.login}?error=lien_expire`);
  }

  return NextResponse.redirect(`${origin}${next}`);
}
