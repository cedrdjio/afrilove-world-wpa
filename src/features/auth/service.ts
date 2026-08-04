import { AuthApiError, type AuthError } from "@supabase/supabase-js";

import { type createClient } from "@/services/supabase/client";
import { env } from "@/lib/env";
import { ROUTES } from "@/constants/routes";

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
  if (
    msg.includes("token has expired") ||
    msg.includes("invalid token") ||
    msg.includes("otp")
  )
    return "Code incorrect ou expiré. Renvoyez un nouveau code.";
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
  input: { email: string; password: string },
) {
  const result = await client.auth.signUp({
    email: input.email.trim().toLowerCase(),
    password: input.password,
    options: {
      // Parité mobile : aucune donnée de profil à l'inscription. Le prénom et
      // le nom sont recueillis à l'onboarding (étape identité / KYC).
      emailRedirectTo: redirectTo(
        `/auth/callback?next=${ROUTES.authResolving}`,
      ),
    },
  });

  // Confirmation d'e-mail activée : par anti-énumération, GoTrue renvoie un
  // faux utilisateur (sans identités) au lieu d'une erreur quand l'adresse est
  // déjà inscrite. Sans ce garde-fou, on enverrait l'utilisateur attendre un
  // code qui n'arrivera jamais — on remonte la même erreur « déjà inscrit »
  // que l'API utilise ailleurs (port de `signUpWithEmail` mobile).
  const { data } = result;
  if (data.user && !data.session && (data.user.identities?.length ?? 0) === 0) {
    return {
      data,
      error: new AuthApiError(
        "User already registered",
        400,
        "user_already_exists",
      ),
    };
  }
  return result;
}

export async function sendPasswordReset(
  client: SupabaseBrowserClient,
  emailAddress: string,
) {
  // Le lien porte `recovery=1` : la page de réinitialisation n'arme le verrou
  // de récupération que dans ce contexte, jamais pour un membre déjà connecté
  // qui visiterait l'URL par curiosité.
  const next = encodeURIComponent(`${ROUTES.resetPassword}?recovery=1`);
  return client.auth.resetPasswordForEmail(emailAddress.trim().toLowerCase(), {
    redirectTo: redirectTo(`/auth/callback?next=${next}`),
  });
}

/**
 * Vérifie le code reçu par e-mail (type signup) directement dans l'app —
 * chemin indépendant du retour du lien navigateur (port de `verifySignupOtp`).
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

/** Vérifie le code de récupération (type recovery) — port de `verifyRecoveryOtp`. */
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

/** Renvoie l'e-mail de confirmation d'inscription — port de `resendSignupEmail`. */
export async function resendSignupEmail(
  client: SupabaseBrowserClient,
  emailAddress: string,
) {
  return client.auth.resend({
    type: "signup",
    email: emailAddress.trim().toLowerCase(),
    options: {
      emailRedirectTo: redirectTo(
        `/auth/callback?next=${ROUTES.authResolving}`,
      ),
    },
  });
}

/**
 * Connexion Google via OAuth (redirection). Le retour repasse par
 * `/auth/callback` qui échange le code puis route vers la résolution.
 * Équivalent web de `useGoogleAuth` (mobile) — masqué tant que le provider
 * n'est pas activé (voir `NEXT_PUBLIC_GOOGLE_OAUTH_ENABLED`).
 */
export async function signInWithGoogle(client: SupabaseBrowserClient) {
  return client.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: redirectTo(`/auth/callback?next=${ROUTES.authResolving}`),
    },
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
