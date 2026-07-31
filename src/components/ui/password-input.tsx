"use client";

import { forwardRef, useState, type InputHTMLAttributes } from "react";
import { Eye, EyeOff } from "lucide-react";

import { cn } from "@/lib/utils";

export type PasswordInputProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "type"
> & { invalid?: boolean };

/** Mot de passe avec bascule afficher/masquer (icône lucide). */
export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ className, invalid, ...props }, ref) => {
    const [visible, setVisible] = useState(false);
    return (
      <div className="relative">
        <input
          ref={ref}
          type={visible ? "text" : "password"}
          aria-invalid={invalid || undefined}
          className={cn(
            "border-border bg-muted/40 text-foreground placeholder:text-muted-foreground/70 h-12 w-full rounded-[var(--radius-md)] border pr-12 pl-4 text-[0.95rem] transition-colors",
            "focus-visible:border-primary focus-visible:ring-ring/40 focus-visible:bg-background focus-visible:ring-2 focus-visible:outline-none",
            "disabled:cursor-not-allowed disabled:opacity-60",
            "aria-[invalid=true]:border-danger aria-[invalid=true]:focus-visible:ring-danger/30",
            className,
          )}
          {...props}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={
            visible ? "Masquer le mot de passe" : "Afficher le mot de passe"
          }
          className="text-muted-foreground hover:text-foreground focus-visible:ring-ring absolute top-1/2 right-3 -translate-y-1/2 rounded-full p-1 transition-colors focus-visible:ring-2 focus-visible:outline-none"
          tabIndex={-1}
        >
          {visible ? (
            <EyeOff className="size-5" aria-hidden />
          ) : (
            <Eye className="size-5" aria-hidden />
          )}
        </button>
      </div>
    );
  },
);
PasswordInput.displayName = "PasswordInput";
