"use client";

import { Check } from "lucide-react";

import { cn } from "@/lib/utils";
import type { IconType } from "@/features/onboarding/config";

type ChoiceVariant = "card" | "tile" | "pill";

interface ChoiceProps {
  selected: boolean;
  onSelect: () => void;
  label: string;
  description?: string;
  icon?: IconType;
  /**
   * `card` : carte pleine largeur (choix d'identité, religion, éducation…).
   * `tile` : tuile verticale icône + libellé (style de vie).
   * `pill` : puce compacte (langues, intérêts, objectifs).
   */
  variant?: ChoiceVariant;
}

/** Bouton de sélection réutilisable — 100 % vectoriel, aucun emoji. */
export function Choice({
  selected,
  onSelect,
  label,
  description,
  icon: Icon,
  variant = "card",
}: ChoiceProps) {
  if (variant === "pill") {
    return (
      <button
        type="button"
        onClick={onSelect}
        aria-pressed={selected}
        className={cn(
          "inline-flex items-center gap-2 rounded-[var(--radius-pill)] border px-3.5 py-2 text-sm font-semibold transition-all active:scale-[0.97]",
          selected
            ? "border-primary bg-primary text-primary-foreground shadow-soft"
            : "border-border bg-card text-foreground hover:border-primary/40 hover:bg-muted/40",
        )}
      >
        {Icon ? <Icon className="size-4 shrink-0" aria-hidden /> : null}
        {label}
      </button>
    );
  }

  if (variant === "tile") {
    return (
      <button
        type="button"
        onClick={onSelect}
        aria-pressed={selected}
        className={cn(
          "group relative flex flex-col items-center justify-center gap-2 rounded-[var(--radius-lg)] border px-2 py-4 transition-all active:scale-[0.97]",
          selected
            ? "border-primary bg-primary/[0.06] shadow-soft"
            : "border-border bg-card hover:border-primary/40 hover:bg-muted/40",
        )}
      >
        {Icon ? (
          <span
            className={cn(
              "grid size-11 place-items-center rounded-[var(--radius-md)] transition-colors",
              selected
                ? "gradient-signature text-white"
                : "bg-muted text-muted-foreground group-hover:text-foreground",
            )}
            aria-hidden
          >
            <Icon className="size-5" strokeWidth={2} />
          </span>
        ) : null}
        <span
          className={cn(
            "text-center text-[0.8rem] leading-tight font-semibold",
            selected ? "text-primary" : "text-foreground",
          )}
        >
          {label}
        </span>
      </button>
    );
  }

  // variant "card"
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={cn(
        "group relative flex w-full items-center gap-3.5 rounded-[var(--radius-lg)] border px-4 py-4 text-left transition-all active:scale-[0.99]",
        selected
          ? "border-primary bg-primary/[0.06] shadow-soft"
          : "border-border bg-card hover:border-primary/40 hover:bg-muted/40",
      )}
    >
      {Icon ? (
        <span
          className={cn(
            "grid size-11 shrink-0 place-items-center rounded-[var(--radius-md)] transition-colors",
            selected
              ? "gradient-signature text-white"
              : "bg-muted text-muted-foreground group-hover:text-foreground",
          )}
          aria-hidden
        >
          <Icon className="size-5" strokeWidth={2} />
        </span>
      ) : null}
      <span className="min-w-0 flex-1">
        <span
          className={cn(
            "block text-[1rem] font-semibold",
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
      <span
        className={cn(
          "grid size-6 shrink-0 place-items-center rounded-full border transition-colors",
          selected
            ? "gradient-signature border-transparent text-white"
            : "border-input text-transparent",
        )}
        aria-hidden
      >
        <Check className="size-3.5" strokeWidth={3} />
      </span>
    </button>
  );
}
