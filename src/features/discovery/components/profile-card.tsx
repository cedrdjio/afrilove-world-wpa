import Image from "next/image";
import { ChevronDown, MapPin, Star } from "lucide-react";

import { VerifiedBadge } from "@/components/brand/verified-badge";
import { initials } from "@/utils/format";
import { cn } from "@/lib/utils";

import type { DeckCardModel } from "../card";

/**
 * Carte profil (« 04 Découverte ») — présentation pure façon maquette PURELY :
 * photo plein cadre aux coins arrondis, voile de lisibilité fin en bas, identité
 * posée directement dessus (nom + âge, chevron « ouvrir », distance) et pastille
 * de compatibilité claire en haut. Le swipe / le lien vers le détail sont pilotés
 * par le parent (`SwipeDeck`).
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
  const hasLocation = Boolean(card.city) || card.distanceKm != null;

  return (
    <div
      className={cn(
        "bg-muted relative size-full overflow-hidden rounded-[28px] shadow-[0_24px_60px_-20px_rgba(46,36,64,0.45)] ring-1 ring-black/5",
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
          className="object-cover object-[center_25%]"
          draggable={false}
        />
      ) : (
        <div className="gradient-signature grid size-full place-items-center">
          <span className="font-display text-7xl font-extrabold text-white/90">
            {initials(card.firstName)}
          </span>
        </div>
      )}

      {/* Voile de lisibilité — dense en bas pour asseoir le texte. */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/75 via-black/25 to-transparent" />

      {/* Compatibilité — pastille claire en haut à droite (façon « New Here »). */}
      <div className="absolute top-4 right-4">
        <span className="inline-flex items-center gap-1.5 rounded-[var(--radius-pill)] bg-white/90 px-3 py-1.5 text-xs font-extrabold text-[#2e2440] shadow-sm backdrop-blur-md">
          <Star className="text-primary size-3.5 fill-current" aria-hidden />
          {card.compatibility}%
        </span>
      </div>

      {/* Identité posée sur le voile — nom + chevron « ouvrir », puis distance. */}
      <div className="absolute inset-x-5 bottom-5">
        <div className="flex items-center gap-2">
          <h2 className="font-display truncate text-[1.9rem] leading-none font-extrabold text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.55)]">
            {card.firstName}, {card.age}
          </h2>
          {card.verified && <VerifiedBadge size={22} />}
          <ChevronDown
            className="size-6 shrink-0 text-white/80 drop-shadow"
            aria-hidden
          />
        </div>
        {hasLocation && (
          <p className="mt-2 flex items-center gap-1.5 text-sm font-semibold text-white/85">
            <MapPin className="size-4 shrink-0" aria-hidden />
            <span className="truncate">
              {card.city}
              {card.city && card.distanceKm != null ? " · " : ""}
              {card.distanceKm != null
                ? `à ${Math.round(card.distanceKm)} km`
                : ""}
            </span>
          </p>
        )}
      </div>
    </div>
  );
}
