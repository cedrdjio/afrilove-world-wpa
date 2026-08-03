import Image from "next/image";
import { MapPin, Star } from "lucide-react";

import { VerifiedBadge } from "@/components/brand/verified-badge";
import { Chip } from "@/components/ui/chip";
import { initials } from "@/utils/format";
import { cn } from "@/lib/utils";

import type { DeckCardModel } from "../card";

/**
 * Carte profil (« 04 Découverte »). Présentation pure à partir du modèle
 * normalisé `DeckCardModel` : photo plein cadre (ou dégradé + initiales si
 * absente), badge de compatibilité, identité et centres d'intérêt en verre.
 * Le comportement de swipe est géré par le parent (`SwipeDeck`).
 */
export function ProfileCard({
  card,
  priority = false,
  className,
}: {
  card: DeckCardModel;
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
      {card.photo ? (
        <Image
          src={card.photo}
          alt={`Photo de ${card.firstName}`}
          fill
          sizes="(max-width: 448px) 100vw, 400px"
          priority={priority}
          className="object-cover object-[center_28%]"
          draggable={false}
        />
      ) : (
        <div className="gradient-signature grid size-full place-items-center">
          <span className="font-display text-7xl font-extrabold text-white/90">
            {initials(card.firstName)}
          </span>
        </div>
      )}
      <div className="from-brand-950/15 to-brand-950/85 absolute inset-0 bg-gradient-to-b via-transparent via-40%" />

      <div className="absolute top-4 right-4">
        <Chip tone="glass" className="bg-accent/70 border-white/35">
          <Star className="size-3.5 fill-current" aria-hidden />
          {card.compatibility}% compatibles
        </Chip>
      </div>

      <div className="glass absolute inset-x-4 bottom-4 rounded-[var(--radius-lg)] border-white/25 bg-white/15 p-4 text-white">
        <div className="flex items-center gap-2">
          <span className="font-display text-2xl font-extrabold">
            {card.firstName}, {card.age}
          </span>
          {card.verified && <VerifiedBadge size={22} />}
        </div>
        {(card.city || card.distanceKm != null) && (
          <p className="mt-1 flex items-center gap-1.5 text-sm text-white/85">
            <MapPin className="size-4" aria-hidden />
            {card.city}
            {card.city && card.distanceKm != null ? " · " : ""}
            {card.distanceKm != null
              ? `à ${Math.round(card.distanceKm)} km`
              : ""}
          </p>
        )}
        {card.interests.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {card.interests.slice(0, 4).map((interest) => (
              <Chip key={interest} tone="glass" size="sm">
                {interest}
              </Chip>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
