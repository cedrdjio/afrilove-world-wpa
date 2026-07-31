"use client";

import { forwardRef, type InputHTMLAttributes } from "react";

import { cn } from "@/lib/utils";

export type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  invalid?: boolean;
};

/** Champ texte de base, aligné sur la charte (focus lavande, coins doux). */
export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, invalid, type = "text", ...props }, ref) => (
    <input
      ref={ref}
      type={type}
      aria-invalid={invalid || undefined}
      className={cn(
        "border-border bg-muted/40 text-foreground placeholder:text-muted-foreground/70 h-12 w-full rounded-[var(--radius-md)] border px-4 text-[0.95rem] transition-colors",
        "focus-visible:border-primary focus-visible:ring-ring/40 focus-visible:bg-background focus-visible:ring-2 focus-visible:outline-none",
        "disabled:cursor-not-allowed disabled:opacity-60",
        "aria-[invalid=true]:border-danger aria-[invalid=true]:focus-visible:ring-danger/30",
        className,
      )}
      {...props}
    />
  ),
);
Input.displayName = "Input";
