import { type AuthError } from "@supabase/supabase-js";

import { type createClient } from "@/services/supabase/client";
import { env } from "@/lib/env";

type SupabaseBrowserClient = ReturnType<typeof createClient>;

/** URL absolue vers laquelle Supabase renvoie après un lien e-mail. */
function redirectTo(path: string): string {
  const base =
    typeof window !== "undefined"
      ? window.location.origin
      : env.NEXT_PUBLIC_APP_URL;
  return `${base}${path}`;
}

/**
 * Traduit les erreurs GoTrue en messages FR clairs. On ne divulgue jamais si un
 * e-mail existe (anti-énumération) : « identifiants invalides » reste générique.
 */
export function authErrorMessage(error: AuthError | null): string | null {
  if (!error) return null;
  const msg = error.message.toLowerCase();
  if (msg.includes("invalid login credentials"))
    return "E-mail ou mot de passe incorrect.";
  if (msg.includes("email not confirmed"))
    return "Confirmez votre e-mail avant de vous connecter.";
  if (
    msg.includes("user already registered") ||
    msg.includes("already been registered")
  )
    return "Un compte existe déjà avec cette adresse.";
  if (msg.includes("rate limit") || msg.includes("too many"))
    return "Trop de tentatives. Réessayez dans quelques instants.";
  if (msg.includes("password"))
    return "Mot de passe invalide (8 caractères min).";
  if (msg.includes("network") || msg.includes("fetch"))
    return "Connexion impossible. Vérifiez votre réseau.";
  return "Une erreur est survenue. Réessayez.";
}

export async function signInWithPassword(
  client: SupabaseBrowserClient,
  input: { email: string; password: string },
) {
  return client.auth.signInWithPassword({
    email: input.email.trim().toLowerCase(),
    password: input.password,
  });
}

export async function signUpWithPassword(
  client: SupabaseBrowserClient,
  input: { email: string; password: string; firstName: string },
) {
  return client.auth.signUp({
    email: input.email.trim().toLowerCase(),
    password: input.password,
    options: {
      data: { first_name: input.firstName.trim() },
      emailRedirectTo: redirectTo("/auth/callback"),
    },
  });
}

export async function sendPasswordReset(
  client: SupabaseBrowserClient,
  emailAddress: string,
) {
  return client.auth.resetPasswordForEmail(emailAddress.trim().toLowerCase(), {
    redirectTo: redirectTo("/auth/callback?next=/auth/reset-password"),
  });
}

export async function updatePassword(
  client: SupabaseBrowserClient,
  newPassword: string,
) {
  return client.auth.updateUser({ password: newPassword });
}

export async function signOut(client: SupabaseBrowserClient) {
  return client.auth.signOut();
}
