"use client";

import { type ReactNode } from "react";
import { m, type HTMLMotionProps } from "framer-motion";

import { cn } from "@/lib/utils";
import { useHaptics } from "@/hooks/use-haptics";

type IconButtonProps = Omit<HTMLMotionProps<"button">, "className" | "ref"> & {
  children: ReactNode;
  size?: number;
  /** Affiche une pastille de notification en haut à droite. */
  showDot?: boolean;
  "aria-label": string;
  className?: string;
};

/** Bouton icône « verre » carré-arrondi — port de `IconButton` (mobile). */
export function IconButton({
  children,
  size = 44,
  showDot = false,
  onClick,
  className,
  ...props
}: IconButtonProps) {
  const haptic = useHaptics();

  return (
    <m.button
      type="button"
      whileTap={{ scale: 0.92 }}
      onClick={(e) => {
        haptic("light");
        onClick?.(e);
      }}
      style={{ width: size, height: size }}
      className={cn(
        "glass text-foreground focus-visible:ring-ring focus-visible:ring-offset-background relative inline-flex items-center justify-center rounded-[15px] transition-[filter] hover:brightness-105 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none",
        className,
      )}
      {...props}
    >
      {children}
      {showDot ? (
        <span
          aria-hidden
          className="bg-primary border-background absolute top-2 right-2 size-[9px] rounded-full border-2"
        />
      ) : null}
    </m.button>
  );
}
