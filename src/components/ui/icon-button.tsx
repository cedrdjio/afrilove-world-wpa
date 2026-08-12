"use client";

import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { forwardRef, type ButtonHTMLAttributes } from "react";

import { cn } from "@/lib/utils";

/**
 * Bouton-icône réutilisable (barres d'action, en-têtes). Les tons « glass » et
 * « glassDark » reprennent les surfaces translucides des maquettes claires et
 * sombres.
 */
const iconButtonVariants = cva(
  "inline-flex items-center justify-center transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background active:scale-95 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      tone: {
        glass: "glass text-primary hover:brightness-105",
        glassDark:
          "border border-white/20 bg-white/10 text-white backdrop-blur-lg hover:bg-white/15",
        soft: "bg-accent/15 text-primary hover:bg-accent/25",
        gradient: "gradient-signature text-white shadow-brand",
        ghost: "text-muted-foreground hover:bg-muted hover:text-foreground",
      },
      shape: { round: "rounded-full", square: "rounded-[var(--radius-md)]" },
      size: {
        sm: "size-9",
        md: "size-11",
        lg: "size-14",
      },
    },
    defaultVariants: { tone: "glass", shape: "square", size: "md" },
  },
);

export interface IconButtonProps
  extends
    ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof iconButtonVariants> {
  asChild?: boolean;
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ className, tone, shape, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        ref={ref}
        className={cn(iconButtonVariants({ tone, shape, size }), className)}
        {...props}
      />
    );
  },
);
IconButton.displayName = "IconButton";
