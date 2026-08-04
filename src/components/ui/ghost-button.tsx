"use client";

import { m, type HTMLMotionProps } from "framer-motion";

import { cn } from "@/lib/utils";
import { useHaptics } from "@/hooks/use-haptics";

interface GhostButtonProps extends Omit<
  HTMLMotionProps<"button">,
  "className" | "ref"
> {
  label: string;
  /** onDark : sur fonds nuit (verre blanc) · onLight : sur surfaces claires. */
  tone?: "onDark" | "onLight";
  block?: boolean;
  className?: string;
}

/** Bouton secondaire « verre » — port de `GhostButton` (mobile). */
export function GhostButton({
  label,
  tone = "onDark",
  block = true,
  onClick,
  className,
  ...props
}: GhostButtonProps) {
  const haptic = useHaptics();

  return (
    <m.button
      type="button"
      whileTap={{ scale: 0.97 }}
      onClick={(e) => {
        haptic("light");
        onClick?.(e);
      }}
      className={cn(
        "font-display focus-visible:ring-ring focus-visible:ring-offset-background inline-flex items-center justify-center rounded-[18px] border-[1.5px] py-4 text-[14px] font-bold tracking-wide transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none",
        block ? "w-full" : "px-8",
        tone === "onDark"
          ? "border-white/[0.28] bg-white/[0.14] text-white hover:bg-white/20"
          : "border-border/70 bg-card/50 text-foreground hover:bg-card/70",
        className,
      )}
      {...props}
    >
      {label}
    </m.button>
  );
}
