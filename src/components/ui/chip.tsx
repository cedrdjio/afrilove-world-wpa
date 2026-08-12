import { cva, type VariantProps } from "class-variance-authority";
import { forwardRef, type HTMLAttributes } from "react";

import { cn } from "@/lib/utils";

/**
 * Puce (« chip ») pour les centres d'intérêt et tags. Trois tons reprenant les
 * maquettes : plein dégradé (sélectionné), doux (lavande translucide) et verre
 * (sur photo sombre).
 */
const chipVariants = cva(
  "inline-flex items-center gap-1.5 whitespace-nowrap rounded-[var(--radius-pill)] font-semibold transition-colors select-none",
  {
    variants: {
      tone: {
        solid: "gradient-signature text-white",
        soft: "bg-accent/15 text-primary",
        glass: "border border-white/25 bg-white/15 text-white backdrop-blur-md",
        outline: "border border-border text-muted-foreground",
      },
      size: {
        sm: "px-3 py-1 text-xs",
        md: "px-3.5 py-1.5 text-[0.8rem]",
      },
    },
    defaultVariants: { tone: "soft", size: "md" },
  },
);

export interface ChipProps
  extends HTMLAttributes<HTMLSpanElement>, VariantProps<typeof chipVariants> {}

export const Chip = forwardRef<HTMLSpanElement, ChipProps>(
  ({ className, tone, size, ...props }, ref) => (
    <span
      ref={ref}
      className={cn(chipVariants({ tone, size }), className)}
      {...props}
    />
  ),
);
Chip.displayName = "Chip";
