import { type HTMLAttributes } from "react";

import { cn } from "@/lib/utils";

interface GlassCardProps extends HTMLAttributes<HTMLDivElement> {
  /** Padding interne en rem via classe utilitaire ; `false` pour composer soi-même. */
  padded?: boolean;
  /** Reflet supérieur Fluent (léger voile blanc en haut de carte). */
  reflection?: boolean;
}

/**
 * Carte de verre Fluent — port de `GlassCard` (mobile). S'appuie sur
 * l'utilitaire `.glass` (backdrop-blur + bordure + ombre) déjà défini dans
 * globals.css, avec un reflet supérieur optionnel.
 */
export function GlassCard({
  padded = true,
  reflection = true,
  className,
  children,
  ...props
}: GlassCardProps) {
  return (
    <div
      className={cn(
        "glass relative overflow-hidden rounded-[var(--radius-xl)]",
        padded && "p-[18px]",
        className,
      )}
      {...props}
    >
      {reflection ? (
        <span
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/50 to-transparent dark:from-white/[0.04]"
        />
      ) : null}
      <div className="relative">{children}</div>
    </div>
  );
}
