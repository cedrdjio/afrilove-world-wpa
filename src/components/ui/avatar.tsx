import Image from "next/image";

import { cn } from "@/lib/utils";
import { initials } from "@/utils/format";

/**
 * Avatar photo (rond ou arrondi) avec pastille de présence optionnelle et
 * anneau dégradé « nouveau match ». Utilise `next/image` pour l'optimisation.
 * Quand `src` est absent (photo non renseignée), affiche les initiales sur un
 * dégradé signature.
 */
export function Avatar({
  src,
  alt,
  size = 48,
  rounded = "full",
  ring = false,
  online,
  className,
}: {
  src: string | null | undefined;
  alt: string;
  size?: number;
  rounded?: "full" | "lg";
  ring?: boolean;
  online?: boolean;
  className?: string;
}) {
  const radius =
    rounded === "full" ? "rounded-full" : "rounded-[var(--radius-md)]";

  const img = src ? (
    <Image
      src={src}
      alt={alt}
      width={size}
      height={size}
      className={cn("size-full object-cover", radius)}
      style={{ objectPosition: "50% 20%" }}
    />
  ) : (
    <span
      className={cn(
        "gradient-signature grid size-full place-items-center font-bold text-white",
        radius,
      )}
      style={{ fontSize: Math.max(11, size * 0.36) }}
      aria-label={alt}
    >
      {initials(alt)}
    </span>
  );

  return (
    <span
      className={cn("relative inline-block shrink-0", className)}
      style={{ width: size, height: size }}
    >
      {ring ? (
        <span
          className={cn("gradient-signature block size-full p-[2.5px]", radius)}
        >
          <span
            className={cn(
              "bg-card block size-full overflow-hidden p-[2px]",
              radius,
            )}
          >
            {img}
          </span>
        </span>
      ) : (
        <span className={cn("block size-full overflow-hidden", radius)}>
          {img}
        </span>
      )}

      {online != null && (
        <span
          aria-label={online ? "En ligne" : "Hors ligne"}
          className={cn(
            "border-card absolute -right-0.5 -bottom-0.5 block rounded-full border-2",
            online ? "bg-success" : "bg-subtle-foreground",
          )}
          style={{ width: size * 0.28, height: size * 0.28 }}
        />
      )}
    </span>
  );
}
