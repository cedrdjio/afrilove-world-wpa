"use client";

import { forwardRef, type InputHTMLAttributes } from "react";

import { cn } from "@/lib/utils";

type OtpInputProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "onChange" | "type"
> & {
  onComplete?: (code: string) => void;
};

/**
 * Champ de saisie du code OTP — port de `OtpInput` (mobile). Un seul champ
 * plutôt qu'une grille fixe : la longueur du code e-mail Supabase n'est pas
 * garantie (config projet), donc figer un nombre de cases tronquerait
 * silencieusement un code plus long. On accepte n'importe quelle longueur et
 * on autorise le collage direct depuis l'e-mail (`autoComplete=one-time-code`).
 */
export const OtpInput = forwardRef<HTMLInputElement, OtpInputProps>(
  ({ className, onComplete, ...props }, ref) => {
    return (
      <input
        ref={ref}
        inputMode="numeric"
        autoComplete="one-time-code"
        placeholder="••••••"
        aria-label="Code de vérification"
        onChange={(e) => onComplete?.(e.target.value.trim())}
        className={cn(
          "glass text-foreground placeholder:text-muted-foreground/40 font-display h-14 w-full rounded-2xl text-center text-[22px] tracking-[0.4em] transition-colors",
          "focus-visible:border-primary focus-visible:ring-ring/40 focus-visible:ring-2 focus-visible:outline-none",
          className,
        )}
        {...props}
      />
    );
  },
);
OtpInput.displayName = "OtpInput";
