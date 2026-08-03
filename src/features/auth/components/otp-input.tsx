"use client";

import { cn } from "@/lib/utils";

/**
 * Saisie du code reçu par e-mail. Un champ unique plutôt qu'une grille de cases
 * fixes : la longueur du code OTP Supabase dépend de la configuration du projet
 * (6 par défaut), et coder « 6 cases » en dur tronquerait un code plus long.
 * Le champ accepte le collage direct depuis l'e-mail.
 */
export function OtpInput({
  value,
  onChange,
  invalid,
  autoFocus,
}: {
  value: string;
  onChange: (code: string) => void;
  invalid?: boolean;
  autoFocus?: boolean;
}) {
  return (
    <input
      value={value}
      onChange={(e) => onChange(e.target.value.replace(/[^0-9]/g, ""))}
      inputMode="numeric"
      autoComplete="one-time-code"
      autoFocus={autoFocus}
      maxLength={8}
      placeholder="••••••"
      aria-label="Code de vérification"
      aria-invalid={invalid || undefined}
      className={cn(
        "border-border bg-muted/40 text-foreground placeholder:text-muted-foreground/50 font-display h-16 w-full rounded-[var(--radius-lg)] border text-center text-[1.6rem] font-bold tracking-[0.5em] transition-colors",
        "focus-visible:border-primary focus-visible:ring-ring/40 focus-visible:bg-background focus-visible:ring-2 focus-visible:outline-none",
        "aria-[invalid=true]:border-danger aria-[invalid=true]:focus-visible:ring-danger/30",
      )}
    />
  );
}
