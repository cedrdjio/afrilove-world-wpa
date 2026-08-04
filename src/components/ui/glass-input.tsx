"use client";

import { forwardRef, type InputHTMLAttributes, type ReactNode } from "react";

import { cn } from "@/lib/utils";

interface GlassInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  icon?: ReactNode;
  rightIcon?: ReactNode;
  onRightIconClick?: () => void;
  error?: string;
  containerClassName?: string;
}

/**
 * Champ de saisie « verre » de la charte — port de `GlassInput` (mobile) :
 * label optionnel, icône gauche/droite, état d'erreur. Le focus éclaire la
 * bordure en lavande. Composable avec react-hook-form (forwardRef).
 */
export const GlassInput = forwardRef<HTMLInputElement, GlassInputProps>(
  (
    {
      label,
      icon,
      rightIcon,
      onRightIconClick,
      error,
      className,
      containerClassName,
      id,
      ...props
    },
    ref,
  ) => {
    const inputId = id ?? props.name;
    return (
      <div className={cn("mb-3", containerClassName)}>
        {label ? (
          <label
            htmlFor={inputId}
            className="text-subtle-foreground font-display mb-2 block text-[11.5px] font-semibold"
          >
            {label}
          </label>
        ) : null}
        <div
          className={cn(
            "bg-card/55 focus-within:border-brand-500/40 flex items-center gap-2.5 rounded-2xl border-[1.5px] px-[18px] py-3.5 transition-colors",
            error ? "border-danger/50" : "border-border/75",
          )}
        >
          {icon ? (
            <span className="text-subtle-foreground shrink-0" aria-hidden>
              {icon}
            </span>
          ) : null}
          <input
            ref={ref}
            id={inputId}
            aria-invalid={error ? true : undefined}
            className={cn(
              "text-foreground placeholder:text-subtle-foreground/70 min-w-0 flex-1 bg-transparent font-sans text-[14px] outline-none",
              className,
            )}
            {...props}
          />
          {rightIcon ? (
            <button
              type="button"
              onClick={onRightIconClick}
              tabIndex={onRightIconClick ? 0 : -1}
              className="text-subtle-foreground shrink-0"
              aria-hidden={!onRightIconClick}
            >
              {rightIcon}
            </button>
          ) : null}
        </div>
        {error ? (
          <p className="text-danger mt-1.5 font-sans text-[11px]">{error}</p>
        ) : null}
      </div>
    );
  },
);
GlassInput.displayName = "GlassInput";
