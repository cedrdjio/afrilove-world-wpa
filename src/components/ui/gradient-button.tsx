"use client";

import { type ReactNode } from "react";
import { m, type HTMLMotionProps } from "framer-motion";

import { cn } from "@/lib/utils";
import { useHaptics } from "@/hooks/use-haptics";
import { Spinner } from "@/components/ui/spinner";

interface GradientButtonProps extends Omit<
  HTMLMotionProps<"button">,
  "className" | "ref"
> {
  label: string;
  icon?: ReactNode;
  iconPosition?: "left" | "right";
  loading?: boolean;
  size?: "md" | "lg";
  block?: boolean;
  className?: string;
}

/**
 * Bouton d'action principal au dégradé signature — port de `GradientButton`
 * (mobile) : léger scale au tap + retour haptique + état de chargement.
 */
export function GradientButton({
  label,
  icon,
  iconPosition = "right",
  loading = false,
  disabled = false,
  size = "lg",
  block = true,
  onClick,
  className,
  ...props
}: GradientButtonProps) {
  const haptic = useHaptics();
  const isDisabled = disabled || loading;

  return (
    <m.button
      type="button"
      whileTap={isDisabled ? undefined : { scale: 0.97 }}
      disabled={isDisabled}
      onClick={(e) => {
        if (isDisabled) return;
        haptic("light");
        onClick?.(e);
      }}
      className={cn(
        "gradient-signature font-display shadow-brand focus-visible:ring-ring focus-visible:ring-offset-background inline-flex items-center justify-center gap-2 rounded-full text-[14px] font-bold tracking-wide text-white transition-[filter] hover:brightness-110 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:opacity-50",
        size === "lg" ? "py-[17px]" : "py-[13px]",
        block ? "w-full px-8" : "px-8",
        className,
      )}
      {...props}
    >
      {loading ? (
        <Spinner className="border-white/40 border-t-white" />
      ) : (
        <>
          {icon && iconPosition === "left" ? icon : null}
          <span style={{ letterSpacing: 0.5 }}>{label}</span>
          {icon && iconPosition === "right" ? icon : null}
        </>
      )}
    </m.button>
  );
}
