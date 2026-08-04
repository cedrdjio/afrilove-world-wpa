import Image from "next/image";

import { cn } from "@/lib/utils";
import {
  PhotoPlaceholder,
  photoSeedFromString,
} from "@/components/ui/photo-placeholder";

interface AvatarProps {
  src?: string | null;
  /** Graine du placeholder quand `src` est absent (id ou nom du membre). */
  seed?: string;
  size?: number;
  ringColor?: string;
  ringWidth?: number;
  alt?: string;
  className?: string;
}

/** Avatar circulaire — port de `Avatar` (mobile). Photo Supabase ou placeholder. */
export function Avatar({
  src,
  seed = "",
  size = 52,
  ringColor,
  ringWidth = 2.5,
  alt = "",
  className,
}: AvatarProps) {
  return (
    <div
      className={cn(
        "relative shrink-0 overflow-hidden rounded-full",
        className,
      )}
      style={{
        width: size,
        height: size,
        borderWidth: ringColor ? ringWidth : 0,
        borderStyle: ringColor ? "solid" : undefined,
        borderColor: ringColor,
      }}
    >
      {src ? (
        <Image
          src={src}
          alt={alt}
          fill
          sizes={`${size}px`}
          className="object-cover"
        />
      ) : (
        <PhotoPlaceholder
          seed={photoSeedFromString(seed)}
          showIcon
          iconSize={Math.round(size * 0.42)}
          className="h-full w-full"
        />
      )}
    </div>
  );
}
