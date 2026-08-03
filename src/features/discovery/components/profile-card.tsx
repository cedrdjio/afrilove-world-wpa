import Image from "next/image";
import { MapPin, Star } from "lucide-react";

import { VerifiedBadge } from "@/components/brand/verified-badge";
import { Chip } from "@/components/ui/chip";
import type { Profile } from "@/features/profiles/types";
import { cn } from "@/lib/utils";

/**
 * Carte profil (« 04 Découverte »). Présentation pure : photo plein cadre,
 * dégradé lisible, badge de compatibilité, identité et centres d'intérêt en
 * verre. Le comportement de swipe est géré par le parent (`SwipeDeck`).
 */
export function ProfileCard({
  profile,
  priority = false,
  className,
}: {
  profile: Profile;
  priority?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "relative size-full overflow-hidden rounded-[var(--radius-xl)] shadow-2xl",
        className,
      )}
    >
      <Image
        src={profile.photos[0]}
        alt={`Photo de ${profile.firstName}`}
        fill
        sizes="(max-width: 448px) 100vw, 400px"
        priority={priority}
        className="object-cover"
        style={{ objectPosition: "50% 30%" }}
        draggable={false}
      />
      <div className="from-brand-950/15 to-brand-950/85 absolute inset-0 bg-gradient-to-b via-transparent via-40%" />

      <div className="absolute top-4 right-4">
        <Chip tone="glass" className="bg-accent/70 border-white/35">
          <Star className="size-3.5 fill-current" aria-hidden />
          {profile.compatibility}% compatibles
        </Chip>
      </div>

      <div className="glass absolute inset-x-4 bottom-4 rounded-[var(--radius-lg)] border-white/25 bg-white/15 p-4 text-white">
        <div className="flex items-center gap-2">
          <span className="font-display text-2xl font-extrabold">
            {profile.firstName}, {profile.age}
          </span>
          {profile.verified && <VerifiedBadge size={22} />}
        </div>
        <p className="mt-1 flex items-center gap-1.5 text-sm text-white/85">
          <MapPin className="size-4" aria-hidden />
          {profile.city} · à {profile.distanceKm} km
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {profile.interests.map((interest) => (
            <Chip key={interest} tone="glass" size="sm">
              {interest}
            </Chip>
          ))}
        </div>
      </div>
    </div>
  );
}
