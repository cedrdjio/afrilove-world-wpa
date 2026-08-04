"use client";

import {
  AlertTriangle,
  Clock,
  KeyRound,
  Lock,
  MailWarning,
  ServerCrash,
  ShieldAlert,
  WifiOff,
  type LucideIcon,
} from "lucide-react";

import { type AppError, type AppErrorKind } from "@/lib/errors";
import { GradientButton } from "@/components/ui/gradient-button";
import { GhostButton } from "@/components/ui/ghost-button";

const ICONS: Record<AppErrorKind, LucideIcon> = {
  no_internet: WifiOff,
  server_error: ServerCrash,
  invalid_credentials: Lock,
  email_exists: MailWarning,
  weak_password: ShieldAlert,
  invalid_email: MailWarning,
  invalid_otp: KeyRound,
  session_expired: Clock,
  timeout: Clock,
  unknown: AlertTriangle,
};

interface ErrorStateProps {
  error: AppError;
  /** Affiché quand l'erreur est retryable. */
  onRetry?: () => void;
  /** Action secondaire optionnelle (ex. « Retour à l'accueil »). */
  secondaryLabel?: string;
  onSecondary?: () => void;
  /** Bannière compacte au-dessus d'un formulaire — parité `variant="inline"`. */
  inline?: boolean;
}

/**
 * État d'erreur unifié — port de `ErrorState` (mobile). Rend la même icône +
 * titre + message + affordance « réessayer » pour un `AppErrorKind` donné.
 * En mode `inline`, se réduit à une bannière compacte (icône + textes + lien
 * « Réessayer ») posée au-dessus d'un formulaire.
 */
export function ErrorState({
  error,
  onRetry,
  secondaryLabel,
  onSecondary,
  inline = false,
}: ErrorStateProps) {
  const Icon = ICONS[error.kind];

  if (inline) {
    return (
      <div
        role="alert"
        className="border-danger/25 bg-danger/[0.06] flex items-start gap-3 rounded-[var(--radius-md)] border px-4 py-3"
      >
        <Icon
          className="text-danger mt-0.5 size-5 shrink-0"
          strokeWidth={1.8}
          aria-hidden
        />
        <div className="min-w-0 flex-1">
          <p className="text-foreground text-[13px] font-semibold">
            {error.title}
          </p>
          <p className="text-muted-foreground mt-0.5 text-[12.5px] leading-[18px]">
            {error.message}
          </p>
          {error.retryable && onRetry ? (
            <button
              type="button"
              onClick={onRetry}
              className="text-primary mt-1.5 text-[12.5px] font-semibold hover:underline"
            >
              Réessayer
            </button>
          ) : null}
        </div>
      </div>
    );
  }

  return (
    <div
      className="flex flex-1 flex-col items-center justify-center px-8 text-center"
      style={{ minHeight: 300 }}
    >
      <div className="bg-danger/10 mb-6 flex size-20 items-center justify-center rounded-full">
        <Icon className="text-danger size-9" strokeWidth={1.8} aria-hidden />
      </div>
      <h2 className="text-foreground font-display mb-2 text-[24px] font-bold">
        {error.title}
      </h2>
      <p className="text-muted-foreground mb-8 max-w-sm font-sans text-[13px] leading-5">
        {error.message}
      </p>
      <div className="flex w-full max-w-xs flex-col gap-3">
        {error.retryable && onRetry ? (
          <GradientButton label="Réessayer" onClick={onRetry} />
        ) : null}
        {secondaryLabel && onSecondary ? (
          <GhostButton
            tone="onLight"
            label={secondaryLabel}
            onClick={onSecondary}
          />
        ) : null}
      </div>
    </div>
  );
}
