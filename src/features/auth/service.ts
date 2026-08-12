import { AuthApiError, type AuthError } from "@supabase/supabase-js";

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
  if (
    msg.includes("otp_expired") ||
    msg.includes("token has expired") ||
    msg.includes("invalid token") ||
    (msg.includes("token") && msg.includes("expired")) ||
    (msg.includes("otp") && msg.includes("invalid"))
  )
    return "Code invalide ou expiré. Demandez-en un nouveau.";
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
  const result = await client.auth.signUp({
    email: input.email.trim().toLowerCase(),
    password: input.password,
    options: {
      data: { first_name: input.firstName.trim() },
      emailRedirectTo: redirectTo("/auth/callback"),
    },
  });
  // Confirmation e-mail activée : GoTrue renvoie (anti-énumération) un faux
  // utilisateur sans identités au lieu d'une erreur quand l'adresse est déjà
  // prise. Sans ce garde-fou, on enverrait la personne saisir un code qui
  // n'arrivera jamais — on le remonte comme l'erreur « déjà inscrit ».
  const { data, error } = result;
  if (
    !error &&
    data.user &&
    !data.session &&
    (data.user.identities?.length ?? 0) === 0
  ) {
    return {
      data: { user: null, session: null },
      error: new AuthApiError(
        "User already registered",
        400,
        "user_already_exists",
      ),
    };
  }
  return result;
}

/**
 * Vérifie le code à 6 chiffres reçu par e-mail après l'inscription (type
 * `signup`). C'est le chemin « par code » : il ne dépend pas d'un aller-retour
 * navigateur → app comme le ferait le lien magique. Le succès ouvre la session.
 */
export async function verifySignupOtp(
  client: SupabaseBrowserClient,
  input: { email: string; token: string },
) {
  return client.auth.verifyOtp({
    email: input.email.trim().toLowerCase(),
    token: input.token.trim(),
    type: "signup",
  });
}

/**
 * Vérifie le code de récupération (type `recovery`) saisi dans l'app. Une fois
 * validé, une session de récupération est ouverte ; l'écran « Nouveau mot de
 * passe » prend le relais.
 */
export async function verifyRecoveryOtp(
  client: SupabaseBrowserClient,
  input: { email: string; token: string },
) {
  return client.auth.verifyOtp({
    email: input.email.trim().toLowerCase(),
    token: input.token.trim(),
    type: "recovery",
  });
}

/** Renvoie un nouveau code d'inscription (invalide le précédent). */
export async function resendSignupOtp(
  client: SupabaseBrowserClient,
  emailAddress: string,
) {
  return client.auth.resend({
    type: "signup",
    email: emailAddress.trim().toLowerCase(),
    options: { emailRedirectTo: redirectTo("/auth/callback") },
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

/**
 * Connexion via Google (OAuth PKCE). Le retour passe par `/auth/callback`, qui
 * échange le code contre une session puis route vers `next` (les gardes des
 * pages arbitrent onboarding vs découverte). Inscription et connexion partagent
 * ce flux — Google crée le compte au premier passage.
 */
export async function signInWithGoogle(
  client: SupabaseBrowserClient,
  next = "/discover",
) {
  const nextPath = next.startsWith("/") ? next : "/discover";
  return client.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: redirectTo(
        `/auth/callback?next=${encodeURIComponent(nextPath)}`,
      ),
    },
  });
}

export async function signOut(client: SupabaseBrowserClient) {
  return client.auth.signOut();
}
