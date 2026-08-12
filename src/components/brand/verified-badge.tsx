import { BadgeCheck } from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * Badge « profil vérifié » (sceau lavande à coche blanche des maquettes).
 */
export function VerifiedBadge({
  className,
  size = 20,
}: {
  className?: string;
  size?: number;
}) {
  return (
    <BadgeCheck
      aria-label="Profil vérifié"
      className={cn("fill-accent stroke-white", className)}
      style={{ width: size, height: size }}
    />
  );
}
