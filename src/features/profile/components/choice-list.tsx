"use client";

import { Check } from "lucide-react";

import { cn } from "@/lib/utils";

/** Liste de choix unique (radio stylé) — port de `ChoiceListEditor`. */
export function ChoiceList<T extends { id: string; label: string }>({
  options,
  selectedId,
  onSelect,
}: {
  options: T[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  return (
    <div className="flex flex-col gap-2.5">
      {options.map((option) => {
        const selected = option.id === selectedId;
        return (
          <button
            key={option.id}
            type="button"
            onClick={() => onSelect(option.id)}
            aria-pressed={selected}
            className={cn(
              "flex items-center justify-between rounded-[var(--radius-lg)] border px-4 py-3.5 text-left transition-colors",
              selected
                ? "border-primary bg-primary/5"
                : "border-border bg-card hover:border-primary/40 hover:bg-muted/40",
            )}
          >
            <span
              className={cn(
                "text-[0.95rem] font-semibold",
                selected ? "text-primary" : "text-foreground",
              )}
            >
              {option.label}
            </span>
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
          </button>
        );
      })}
    </div>
  );
}
