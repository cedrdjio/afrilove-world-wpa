import Image from "next/image";
import { ChevronDown, MapPin, Star } from "lucide-react";

import { VerifiedBadge } from "@/components/brand/verified-badge";
import { initials } from "@/utils/format";
import { cn } from "@/lib/utils";

import type { DeckCardModel } from "../card";

/**
 * Carte profil (« 04 Découverte ») — présentation pure façon maquette premium :
 * photo plein cadre sur fond nuit, dégradés de lisibilité fins, identité posée
 * directement sur le voile bas (sans boîte de verre), pastille de compatibilité
 * discrète et chevron d'ouverture. Le comportement de swipe / le lien vers le
 * détail sont pilotés par le parent (`SwipeDeck`).
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
        "bg-brand-950 relative size-full overflow-hidden rounded-[28px] shadow-[0_30px_70px_-24px_rgba(0,0,0,0.75)] ring-1 ring-white/10",
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

      {/* Voiles de lisibilité : léger en haut (contrôles), dense en bas (texte). */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-black/40 to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-3/5 bg-gradient-to-t from-black/85 via-black/40 via-45% to-transparent" />

      {/* Compatibilité — pastille sobre en verre sombre. */}
      <div className="absolute top-3.5 right-3.5">
        <span className="inline-flex items-center gap-1.5 rounded-[var(--radius-pill)] border border-white/20 bg-black/35 px-3 py-1.5 text-xs font-bold text-white backdrop-blur-md">
          <Star className="text-accent size-3.5 fill-current" aria-hidden />
          {card.compatibility}%
        </span>
      </div>

      {/* Identité posée sur le voile — pas de boîte, look éditorial. */}
      <div className="absolute inset-x-5 bottom-5 flex items-end justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h2 className="font-display truncate text-[1.75rem] leading-tight font-extrabold text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.5)]">
              {card.firstName}, {card.age}
            </h2>
            {card.verified && <VerifiedBadge size={22} />}
          </div>
          {hasLocation && (
            <p className="mt-1.5 flex items-center gap-1.5 text-sm font-medium text-white/85">
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

        {/* Affordance « ouvrir le profil » — décorative (le lien enveloppe la carte). */}
        <span
          aria-hidden
          className="grid size-11 shrink-0 place-items-center rounded-full border border-white/25 bg-white/15 text-white backdrop-blur-md"
        >
          <ChevronDown className="size-5" />
        </span>
      </div>
    </div>
  );
}
