import { User } from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * Placeholder dégradé lavande affiché partout où une photo de membre finira par
 * se charger depuis Supabase Storage — port de `PhotoPlaceholder` (mobile).
 * Toute la gamme reste dans la charte (lavande → aubergine), aucun ton chaud.
 */
const PALETTES: readonly [string, string][] = [
  ["#C3B1E1", "#7C5CBF"],
  ["#9B7EDE", "#5B3E9E"],
  ["#8B69D6", "#4A2C7F"],
  ["#A98FD8", "#6A4FC0"],
  ["#7C5CBF", "#3A2B4F"],
];

interface PhotoPlaceholderProps {
  seed?: number;
  className?: string;
  showIcon?: boolean;
  iconSize?: number;
}

export function PhotoPlaceholder({
  seed = 0,
  className,
  showIcon = false,
  iconSize = 22,
}: PhotoPlaceholderProps) {
  const [start, end] = PALETTES[Math.abs(seed) % PALETTES.length] ?? [
    "#9B7EDE",
    "#5B3E9E",
  ];

  return (
    <div
      className={cn(
        "flex items-center justify-center overflow-hidden",
        className,
      )}
      style={{
        backgroundImage: `linear-gradient(135deg, ${start} 0%, ${end} 100%)`,
      }}
    >
      {showIcon ? (
        <User
          size={iconSize}
          color="rgba(255,255,255,0.55)"
          strokeWidth={1.6}
          aria-hidden
        />
      ) : null}
    </div>
  );
}

/** Hash déterministe stable — même graine que le mobile pour une teinte identique. */
export function photoSeedFromString(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash * 31 + value.charCodeAt(i)) | 0;
  }
  return hash;
}
