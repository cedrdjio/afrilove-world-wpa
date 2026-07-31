import Image from "next/image";

import { cn } from "@/lib/utils";

/**
 * Logo AfroLove World.
 * Réutilise la silhouette de la charte (asset `logo-white.png`) posée sur le
 * dégradé signature — lisible sur fond clair comme sombre — avec le logotype
 * « AfroLove World » (Plus Jakarta Sans).
 */
export function Logo({
  className,
  showWordmark = true,
  size = "md",
}: {
  className?: string;
  showWordmark?: boolean;
  size?: "sm" | "md" | "lg";
}) {
  const mark = {
    sm: "size-8",
    md: "size-10",
    lg: "size-14",
  }[size];

  const text = {
    sm: "text-base",
    md: "text-lg",
    lg: "text-2xl",
  }[size];

  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <span
        className={cn(
          "gradient-signature shadow-brand grid place-items-center rounded-[30%]",
          mark,
        )}
      >
        <Image
          src="/brand/logo-white.png"
          alt=""
          width={56}
          height={56}
          className="size-[62%] object-contain"
          priority
        />
      </span>
      {showWordmark && (
        <span
          className={cn(
            "font-display leading-none font-extrabold tracking-tight",
            text,
          )}
        >
          <span className="text-foreground">AfroLove</span>{" "}
          <span className="text-gradient">World</span>
        </span>
      )}
    </span>
  );
}
