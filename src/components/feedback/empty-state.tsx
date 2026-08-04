"use client";

import { type ReactNode } from "react";
import { m } from "framer-motion";
import { Heart } from "lucide-react";

import { GradientButton } from "@/components/ui/gradient-button";

interface EmptyStateProps {
  /** Icône personnalisée ; à défaut, un cœur flottant anime l'état vide. */
  icon?: ReactNode;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

/** État vide illustré — port de `EmptyState` (mobile). */
export function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <div
      className="flex flex-1 flex-col items-center justify-center px-8 text-center"
      style={{ minHeight: 300 }}
    >
      {icon ? (
        <div className="bg-primary/10 mb-6 flex size-20 items-center justify-center rounded-full">
          {icon}
        </div>
      ) : (
        <m.div
          className="mb-4"
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
        >
          <Heart
            className="text-primary size-16 fill-current opacity-90"
            aria-hidden
          />
        </m.div>
      )}
      <h2 className="text-foreground font-display mb-2 text-[26px] font-bold">
        {title}
      </h2>
      {description ? (
        <p className="text-muted-foreground mb-8 max-w-sm font-sans text-[13px] leading-5">
          {description}
        </p>
      ) : null}
      {actionLabel ? (
        <GradientButton label={actionLabel} onClick={onAction} />
      ) : null}
    </div>
  );
}
