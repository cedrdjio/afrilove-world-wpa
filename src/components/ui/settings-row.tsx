"use client";

import { type ReactNode } from "react";
import { ChevronRight } from "lucide-react";

import { cn } from "@/lib/utils";
import { useHaptics } from "@/hooks/use-haptics";

interface SettingsRowProps {
  icon: ReactNode;
  label: string;
  onClick?: () => void;
  isLast?: boolean;
  /** Contenu à droite (toggle, valeur…) ; remplace le chevron par défaut. */
  right?: ReactNode;
}

/** Ligne de réglage cliquable — port de `SettingsRow` (mobile). */
export function SettingsRow({
  icon,
  label,
  onClick,
  isLast = false,
  right,
}: SettingsRowProps) {
  const haptic = useHaptics();

  return (
    <button
      type="button"
      onClick={
        onClick
          ? () => {
              haptic("light");
              onClick();
            }
          : undefined
      }
      className={cn(
        "hover:bg-foreground/[0.03] flex w-full items-center justify-between px-[18px] py-3.5 text-left transition-colors",
        isLast ? "" : "border-border/60 border-b",
      )}
    >
      <span className="flex items-center gap-3">
        <span className="bg-primary/10 flex size-[34px] items-center justify-center rounded-[var(--radius-md)]">
          {icon}
        </span>
        <span className="text-foreground font-display text-[14px] font-semibold">
          {label}
        </span>
      </span>
      {right ?? (
        <ChevronRight className="text-foreground/20 size-[17px]" aria-hidden />
      )}
    </button>
  );
}
