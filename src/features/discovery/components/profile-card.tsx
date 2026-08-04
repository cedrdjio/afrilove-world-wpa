import Image from "next/image";
import { ChevronDown, Star } from "lucide-react";

import { VerifiedBadge } from "@/components/brand/verified-badge";
import { initials } from "@/utils/format";
import { cn } from "@/lib/utils";

import type { DeckCardModel } from "../card";

/**
 * Carte profil (« 04 Découverte ») — présentation pure façon maquette : photo
 * plein cadre aux coins arrondis, points d'aperçu photo (bas-gauche), identité
 * posée sur un voile fin (prénom + âge + chevron « ouvrir », distance) et
 * pastille de compatibilité claire (haut-droite). Les boutons d'action sont
 * superposés par le parent (`SwipeDeckView`), hors du lien de navigation.
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
  const photoCount = card.photos.length;

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

      {/* Compatibilité — pastille claire en haut à droite. */}
      <div className="absolute top-4 right-4">
        <span className="inline-flex items-center gap-1.5 rounded-[var(--radius-pill)] bg-white/90 px-3 py-1.5 text-xs font-extrabold text-[#2e2440] shadow-sm backdrop-blur-md">
          <Star className="text-primary size-3.5 fill-current" aria-hidden />
          {card.compatibility}%
        </span>
      </div>

      {/* Identité (bas-gauche) : points photo, prénom + chevron « ouvrir », distance.
          On garde le prénom seul (façon maquette) pour laisser respirer les
          boutons d'action à droite ; l'âge reste sur la fiche détaillée. */}
      <div className="absolute inset-x-5 bottom-6 max-w-[58%]">
        {photoCount > 1 && (
          <div
            className="mb-3 flex items-center gap-1.5"
            aria-label={`${photoCount} photos`}
          >
            {Array.from({ length: photoCount }).map((_, i) => (
              <span
                key={i}
                className={cn(
                  "h-1.5 rounded-full transition-all",
                  i === 0 ? "w-5 bg-white" : "w-1.5 bg-white/45",
                )}
              />
            ))}
          </div>
        )}

        <div className="flex items-center gap-2">
          <h2 className="font-display truncate text-[2rem] leading-none font-extrabold text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.55)]">
            {card.firstName}
          </h2>
          {card.verified && <VerifiedBadge size={20} />}
          <ChevronDown
            className="size-5 shrink-0 text-white/85 drop-shadow"
            aria-hidden
          />
        </div>
        <p className="mt-2 truncate text-sm font-semibold text-white/85">
          {card.age} ans
          {hasLocation ? " · " : ""}
          {card.distanceKm != null
            ? `à ${Math.round(card.distanceKm)} km`
            : (card.city ?? "")}
        </p>
      </div>
    </div>
  );
}
