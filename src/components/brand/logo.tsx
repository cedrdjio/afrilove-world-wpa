import Image from "next/image";

import { cn } from "@/lib/utils";

/**
 * Logo AfriLove World — illustration officielle sur fond transparent
 * (`/brand/logo.png`) + logotype « AfriLove World » (Plus Jakarta Sans).
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
    sm: "size-9",
    md: "size-11",
    lg: "size-16",
  }[size];

  const text = {
    sm: "text-base",
    md: "text-lg",
    lg: "text-2xl",
  }[size];

  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <Image
        src="/brand/logo.png"
        alt="AfriLove World"
        width={96}
        height={96}
        className={cn("object-contain", mark)}
        priority
      />
      {showWordmark && (
        <span
          className={cn(
            "font-display leading-none font-extrabold tracking-tight",
            text,
          )}
        >
          <span className="text-foreground">AfriLove</span>{" "}
          <span className="text-gradient">World</span>
        </span>
      )}
    </span>
  );
}
