"use client";

import { type ReactNode } from "react";
import { m } from "framer-motion";

import { cn } from "@/lib/utils";
import { useHaptics } from "@/hooks/use-haptics";

interface ChipProps {
  label: string;
  selected?: boolean;
  onClick?: () => void;
  size?: "sm" | "md";
  icon?: ReactNode;
  /** Rôle sémantique : bouton (défaut) ou simple étiquette non cliquable. */
  as?: "button" | "span";
  className?: string;
}

/**
 * Pastille sélectionnable — port de `Chip` (mobile). Dégradé signature quand
 * sélectionnée, verre quand au repos. Utilisée pour les intérêts, filtres, tags.
 */
export function Chip({
  label,
  selected = false,
  onClick,
  size = "md",
  icon,
  as = "button",
  className,
}: ChipProps) {
  const haptic = useHaptics();
  const pad = size === "sm" ? "px-3.5 py-2" : "px-4 py-2.5";
  const Comp = as === "button" ? m.button : m.span;

  return (
    <Comp
      type={as === "button" ? "button" : undefined}
      whileTap={onClick ? { scale: 0.95 } : undefined}
      aria-pressed={as === "button" ? selected : undefined}
      onClick={
        onClick
          ? () => {
              haptic("light");
              onClick();
            }
          : undefined
      }
      className={cn(
        "font-display inline-flex items-center gap-1.5 rounded-full text-[11.5px] transition-colors",
        pad,
        selected
          ? "gradient-signature text-white shadow-[0_4px_10px_rgba(106,79,192,0.28)]"
          : "border-border/70 bg-card/45 text-foreground border-[1.5px] font-medium",
        className,
      )}
    >
      {icon}
      <span className={selected ? "font-bold" : "font-medium"}>{label}</span>
    </Comp>
  );
}
