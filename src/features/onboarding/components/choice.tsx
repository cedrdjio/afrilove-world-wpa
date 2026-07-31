"use client";

import { type ReactNode } from "react";
import { Check } from "lucide-react";

import { cn } from "@/lib/utils";

interface ChoiceProps {
  selected: boolean;
  onSelect: () => void;
  label: string;
  description?: string;
  icon?: ReactNode;
  /** Puce compacte (intérêts) vs carte pleine largeur (choix uniques). */
  compact?: boolean;
}

/** Bouton de sélection réutilisable (choix unique ou multiple). */
export function Choice({
  selected,
  onSelect,
  label,
  description,
  icon,
  compact,
}: ChoiceProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={cn(
        "group relative flex items-center gap-3 rounded-[var(--radius-lg)] border text-left transition-all active:scale-[0.98]",
        compact ? "px-4 py-2.5" : "w-full px-4 py-4",
        selected
          ? "border-primary bg-primary/5 shadow-soft"
          : "border-border bg-card hover:border-primary/40 hover:bg-muted/40",
      )}
    >
      {icon ? (
        <span
          className="grid size-9 shrink-0 place-items-center text-xl"
          aria-hidden
        >
          {icon}
        </span>
      ) : null}
      <span className="min-w-0 flex-1">
        <span
          className={cn(
            "block font-semibold",
            compact ? "text-sm" : "text-[0.98rem]",
            selected ? "text-primary" : "text-foreground",
          )}
        >
          {label}
        </span>
        {description ? (
          <span className="text-muted-foreground mt-0.5 block text-xs leading-snug">
            {description}
          </span>
        ) : null}
      </span>
      {!compact ? (
        <span
          className={cn(
            "grid size-6 shrink-0 place-items-center rounded-full border transition-colors",
            selected
              ? "gradient-signature border-transparent text-white"
              : "border-border text-transparent",
          )}
          aria-hidden
        >
          <Check className="size-4" />
        </span>
      ) : selected ? (
        <Check className="text-primary size-4 shrink-0" aria-hidden />
      ) : null}
    </button>
  );
}
