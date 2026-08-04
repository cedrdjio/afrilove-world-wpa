import { type ReactNode } from "react";

import { cn } from "@/lib/utils";

/** Ligne d'information (icône + label + valeur) — port de `InfoRow`. */
export function InfoRow({
  icon,
  label,
  value,
  isLast = false,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  isLast?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-3.5 py-3.5",
        isLast ? "" : "border-foreground/[0.06] border-b",
      )}
    >
      <span className="bg-primary/[0.08] grid size-9 shrink-0 place-items-center rounded-full">
        {icon}
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-muted-foreground mb-0.5 text-[11px] font-semibold">
          {label}
        </p>
        <p className="text-foreground text-[14px] font-semibold">{value}</p>
      </div>
    </div>
  );
}
