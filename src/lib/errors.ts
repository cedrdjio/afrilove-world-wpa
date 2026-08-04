import {
  AuthApiError,
  AuthError,
  StorageApiError,
} from "@supabase/supabase-js";

/**
 * Normalisation d'erreurs — port fidèle de `shared/utils/errorMapping.ts`
 * (source de vérité mobile). Toute erreur Supabase / fetch / React Query est
 * ramenée à une forme `AppError` unique afin que chaque écran affiche le même
 * couple titre + message + option « réessayer » pour un type d'échec donné.
 *
 * Pur : aucun log ici (voir `logAppErrorDetails`). Le kind `session_expired`
 * est le seul qui doit déclencher une déconnexion (câblé dans le QueryProvider).
 */

export type AppErrorKind =
  | "no_internet"
  | "server_error"
  | "invalid_credentials"
  | "email_exists"
  | "weak_password"
  | "invalid_email"
  | "invalid_otp"
  | "session_expired"
  | "timeout"
  | "unknown";

export interface AppError {
  kind: AppErrorKind;
  title: string;
  message: string;
  retryable: boolean;
}

const APP_ERRORS: Record<AppErrorKind, Omit<AppError, "kind">> = {
  no_internet: {
    title: "Pas de connexion",
    message: "Vérifiez votre connexion internet et réessayez.",
    retryable: true,
  },
  server_error: {
    title: "Erreur serveur",
    message:
      "Un problème technique est survenu de notre côté. Réessayez dans quelques instants.",
    retryable: true,
  },
  invalid_credentials: {
    title: "Identifiants incorrects",
    message: "L'email ou le mot de passe est incorrect.",
    retryable: false,
  },
  email_exists: {
    title: "Email déjà utilisé",
    message:
      "Un compte existe déjà avec cette adresse email. Connectez-vous plutôt.",
    retryable: false,
  },
  weak_password: {
    title: "Mot de passe trop faible",
    message:
      "Choisissez un mot de passe plus robuste (au moins 8 caractères, lettres et chiffres).",
    retryable: false,
  },
  invalid_email: {
    title: "Email invalide",
    message: "Cette adresse email n'est pas valide.",
    retryable: false,
  },
  invalid_otp: {
    title: "Code incorrect",
    message:
      "Le code saisi n'est pas le bon ou a expiré. Vérifiez-le ou demandez un nouvel envoi.",
    retryable: true,
  },
  session_expired: {
    title: "Session expirée",
    message: "Votre session a expiré. Merci de vous reconnecter.",
    retryable: false,
  },
  timeout: {
    title: "Délai dépassé",
    message:
      "La requête a pris trop de temps. Vérifiez votre connexion et réessayez.",
    retryable: true,
  },
  unknown: {
    title: "Une erreur est survenue",
    message: "Quelque chose a mal tourné. Merci de réessayer.",
    retryable: true,
  },
};

function buildError(kind: AppErrorKind, overrideMessage?: string): AppError {
  return {
    kind,
    ...APP_ERRORS[kind],
    ...(overrideMessage ? { message: overrideMessage } : {}),
  };
}

function isAbortOrTimeout(error: Error): boolean {
  const message = error.message.toLowerCase();
  return (
    error.name === "AbortError" ||
    message.includes("abort") ||
    message.includes("timeout") ||
    message.includes("timed out")
  );
}

/**
 * Normalise toute erreur Supabase / fetch / React Query en `AppError`.
 * L'ordre des branches est signifiant : GoTrue enveloppe les AbortError dans
 * ses propres sous-classes, donc l'abandon/timeout doit être testé en premier.
 */
export function mapToAppError(error: unknown): AppError {
  if (error instanceof Error && isAbortOrTimeout(error)) {
    return buildError("timeout");
  }

  if (error instanceof StorageApiError) {
    const message = error.message.toLowerCase();
    // Un refus de policy Storage ne prouve pas que la session a expiré :
    // ne jamais forcer une déconnexion ici (boucle « session expirée »).
    if (
      message.includes("row-level security") ||
      message.includes("permission denied")
    ) {
      return buildError("server_error");
    }
    if (error.status >= 500) {
      return buildError("server_error");
    }
    return buildError("unknown");
  }

  if (error instanceof AuthApiError || error instanceof AuthError) {
    const code =
      "code" in error ? (error as { code?: string }).code : undefined;
    const status =
      "status" in error ? (error as { status?: number }).status : undefined;
    const message = error.message.toLowerCase();

    if (
      code === "invalid_credentials" ||
      message.includes("invalid login credentials")
    ) {
      return buildError("invalid_credentials");
    }
    if (
      code === "user_already_exists" ||
      code === "email_exists" ||
      message.includes("already registered")
    ) {
      return buildError("email_exists");
    }
    if (
      code === "weak_password" ||
      (message.includes("password") && message.includes("weak"))
    ) {
      return buildError("weak_password");
    }
    if (
      code === "validation_failed" ||
      code === "email_address_invalid" ||
      message.includes("invalid email")
    ) {
      return buildError("invalid_email");
    }
    // GoTrue renvoie le même code que l'OTP soit erroné ou expiré.
    if (
      code === "otp_expired" ||
      message.includes("token has expired or is invalid")
    ) {
      return buildError("invalid_otp");
    }
    if (
      code === "session_expired" ||
      code === "refresh_token_not_found" ||
      code === "session_not_found"
    ) {
      return buildError("session_expired");
    }
    if (status && status >= 500) {
      return buildError("server_error");
    }
    return buildError("unknown");
  }

  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    if (
      message.includes("network request failed") ||
      message.includes("fetch failed") ||
      message.includes("failed to fetch")
    ) {
      return buildError("no_internet");
    }
  }

  return buildError("unknown");
}

/**
 * Trace les détails techniques bruts (constructeur, name, message, code/status,
 * cause) à côté du kind résolu. Dev-only. À grepper dans la console navigateur
 * quand le message convivial à l'écran ne suffit pas à déboguer.
 */
export function logAppErrorDetails(error: unknown, resolved: AppError): void {
  if (process.env.NODE_ENV === "production") return;

  const details: Record<string, unknown> = {
    resolvedKind: resolved.kind,
    constructor: error?.constructor?.name,
  };

  if (error instanceof Error) {
    details.name = error.name;
    details.message = error.message;
    details.stack = error.stack;
    if ("code" in error) details.code = (error as { code?: unknown }).code;
    if ("status" in error)
      details.status = (error as { status?: unknown }).status;
    if ("cause" in error) details.cause = (error as { cause?: unknown }).cause;
  } else {
    details.raw = error;
  }

  console.error("[AppError]", details);
}
