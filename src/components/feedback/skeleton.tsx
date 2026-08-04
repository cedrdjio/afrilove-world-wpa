import { cn } from "@/lib/utils";

interface SkeletonProps {
  className?: string;
  width?: number | string;
  height?: number | string;
  radius?: number | string;
}

/**
 * Bloc placeholder scintillant — port de `Skeleton` (mobile). Pour tout
 * contenu asynchrone (cartes de profil, listes, images) non encore résolu.
 */
export function Skeleton({ className, width, height, radius }: SkeletonProps) {
  return (
    <span
      aria-hidden
      className={cn("bg-foreground/[0.08] block animate-pulse", className)}
      style={{
        width,
        height: height ?? 16,
        borderRadius: radius ?? 8,
      }}
    />
  );
}

export function SkeletonCircle({ size = 48 }: { size?: number }) {
  return <Skeleton width={size} height={size} radius={size / 2} />;
}
