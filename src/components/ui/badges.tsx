import { BadgeCheck, Heart } from "lucide-react";

import { cn } from "@/lib/utils";

/** Badge « Vérifiée » — port de `VerifiedBadge` (mobile). */
export function VerifiedBadge({
  tone = "onLight",
}: {
  tone?: "onLight" | "onDark" | "chip";
}) {
  if (tone === "chip") {
    return (
      <span className="bg-accent/10 inline-flex items-center gap-1.5 self-start rounded-full px-2.5 py-1.5">
        <BadgeCheck
          className="text-accent size-3"
          strokeWidth={2.5}
          aria-hidden
        />
        <span className="text-accent font-display text-[10px] font-bold">
          Vérifiée
        </span>
      </span>
    );
  }
  return (
    <span className="border-border/95 bg-card/90 text-foreground inline-flex items-center gap-1 self-start rounded-full border px-2.5 py-1.5">
      <BadgeCheck
        className="text-accent size-2.5"
        strokeWidth={2.8}
        aria-hidden
      />
      <span className="font-display text-[10px] font-semibold">Vérifiée</span>
    </span>
  );
}

/** Badge « N% Match » — port de `MatchBadge` (mobile). */
export function MatchBadge({ percent }: { percent: number }) {
  return (
    <span className="border-border/95 bg-card/90 text-foreground inline-flex items-center gap-1.5 self-start rounded-full border px-3 py-1.5">
      <Heart className="text-primary size-3 fill-current" aria-hidden />
      <span className="font-display text-[11px] font-bold">
        {percent}% Match
      </span>
    </span>
  );
}

/** Pastille de compteur (non-lus) — port de `CountBadge` (mobile). */
export function CountBadge({
  count,
  size = 22,
  className,
}: {
  count: number;
  size?: number;
  className?: string;
}) {
  if (count <= 0) return null;
  return (
    <span
      className={cn(
        "bg-primary text-primary-foreground font-display inline-flex items-center justify-center rounded-full text-[10px] font-bold",
        className,
      )}
      style={{ width: size, height: size }}
      aria-label={`${count} non lus`}
    >
      {count > 99 ? "99+" : count}
    </span>
  );
}
