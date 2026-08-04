"use client";

import { useCallback, useEffect } from "react";
import Image from "next/image";
import { animate, m, useMotionValue, useTransform } from "framer-motion";
import { Heart, BadgeCheck, ShieldQuestion } from "lucide-react";

import {
  PhotoPlaceholder,
  photoSeedFromString,
} from "@/components/ui/photo-placeholder";
import { formatLastSeen } from "@/lib/presence";
import type { DiscoveryProfile } from "@/features/discovery/types";

export type SwipeDirection = "left" | "right";

const DIRECTION_TO_MULTIPLIER: Record<SwipeDirection, number> = {
  left: -1,
  right: 1,
};

interface SwipeCardProps {
  profile: DiscoveryProfile;
  onSwiped: (direction: SwipeDirection) => void;
  onTap: () => void;
  isTop: boolean;
  stackIndex: number;
  /** Renseigné quand un bouton d'action déclenche le swipe : la carte joue son
   *  animation de sortie avant de notifier `onSwiped`. */
  commandedDirection?: SwipeDirection | null;
  /** Présence Realtime / heartbeat — affiche la pastille « En ligne ». */
  isOnline?: boolean;
}

/**
 * Carte du deck — port de `SwipeCard` (mobile). Contrairement au mobile
 * (tap-only), le web autorise le glisser-déposer (framer-motion) : on tire la
 * carte à droite (like) ou à gauche (pass), avec rotation et voiles LIKE/NOPE.
 * Les boutons d'action commandent la même animation de sortie via
 * `commandedDirection`. Un clic (sans glissement) ouvre la fiche.
 */
export function SwipeCard({
  profile,
  onSwiped,
  onTap,
  isTop,
  stackIndex,
  commandedDirection = null,
  isOnline = false,
}: SwipeCardProps) {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-260, 0, 260], [-11, 0, 11]);
  const likeOpacity = useTransform(x, [24, 130], [0, 1]);
  const nopeOpacity = useTransform(x, [-24, -130], [0, 1]);

  const animateOut = useCallback(
    (direction: SwipeDirection) => {
      const target =
        DIRECTION_TO_MULTIPLIER[direction] *
        (typeof window !== "undefined" ? window.innerWidth * 1.4 : 700);
      animate(x, target, {
        type: "tween",
        duration: 0.28,
        ease: "easeIn",
        onComplete: () => onSwiped(direction),
      });
    },
    [onSwiped, x],
  );

  // Boutons Pass / Like → même sortie qu'un glissement.
  useEffect(() => {
    if (isTop && commandedDirection) animateOut(commandedDirection);
  }, [isTop, commandedDirection, animateOut]);

  const locationLine = [
    [profile.city, profile.country].filter(Boolean).join(", "),
    profile.distanceKm != null ? `${profile.distanceKm} km` : null,
  ]
    .filter(Boolean)
    .join(" · ");

  const lastSeenLabel = isOnline ? null : formatLastSeen(profile.lastActiveAt);

  // Décalage d'empilement (les cartes du dessous plus petites et translatées).
  const stackScale = 1 - stackIndex * 0.04;
  const stackTranslateY = stackIndex * 10;

  return (
    <m.div
      className="absolute inset-0 touch-none"
      style={{ zIndex: 10 - stackIndex }}
      initial={false}
      animate={{ scale: stackScale, y: stackTranslateY }}
      transition={{ type: "spring", damping: 18, stiffness: 160 }}
    >
      <m.div
        className="absolute inset-0 cursor-grab overflow-hidden rounded-[30px] shadow-[0_14px_30px_rgba(61,53,82,0.28)] active:cursor-grabbing"
        style={isTop ? { x, rotate } : undefined}
        drag={isTop ? "x" : false}
        dragSnapToOrigin
        dragElastic={0.6}
        onDragEnd={(_, info) => {
          if (!isTop) return;
          const commit = 130;
          if (info.offset.x > commit || info.velocity.x > 800) {
            animateOut("right");
          } else if (info.offset.x < -commit || info.velocity.x < -800) {
            animateOut("left");
          }
        }}
        onClick={() => {
          // Un vrai clic (pas la fin d'un glissement) ouvre la fiche.
          if (isTop && Math.abs(x.get()) < 6) onTap();
        }}
      >
        {profile.avatarUrl ? (
          <Image
            src={profile.avatarUrl}
            alt={profile.firstName}
            fill
            sizes="(max-width: 448px) 100vw, 448px"
            className="object-cover"
            priority={isTop}
            draggable={false}
          />
        ) : (
          <PhotoPlaceholder
            seed={photoSeedFromString(profile.id)}
            showIcon
            iconSize={40}
            className="absolute inset-0 h-full w-full"
          />
        )}

        {/* Dégradé lisibilité bas de carte. */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to bottom, transparent 38%, rgba(24,15,42,0.92) 100%)",
          }}
        />

        {/* Voiles LIKE / NOPE pilotés par le glissement (carte du dessus). */}
        {isTop ? (
          <>
            <m.div
              className="pointer-events-none absolute top-8 left-6 -rotate-12 rounded-xl border-[3px] border-[#3ECf8E] px-3 py-1"
              style={{ opacity: likeOpacity }}
            >
              <span className="font-display text-[26px] font-black tracking-wide text-[#3ECf8E]">
                LIKE
              </span>
            </m.div>
            <m.div
              className="pointer-events-none absolute top-8 right-6 rotate-12 rounded-xl border-[3px] border-[#F04A6E] px-3 py-1"
              style={{ opacity: nopeOpacity }}
            >
              <span className="font-display text-[26px] font-black tracking-wide text-[#F04A6E]">
                NOPE
              </span>
            </m.div>
          </>
        ) : null}

        {/* Compatibilité (haut gauche). */}
        <div className="border-border/95 bg-card/90 absolute top-3.5 left-3.5 flex items-center gap-1.5 rounded-full border px-3 py-1.5">
          <Heart className="text-brand-500 size-3 fill-current" aria-hidden />
          <span className="font-display text-foreground text-[11px] font-semibold">
            {profile.compatibility}% Match
          </span>
        </div>

        {/* Statut de vérification (haut droite) — toujours visible. */}
        {profile.isVerified ? (
          <div className="border-border/95 bg-card/90 absolute top-3.5 right-3.5 flex items-center gap-1 rounded-full border px-2.5 py-1.5">
            <BadgeCheck
              className="size-2.5 text-[#D99B2B]"
              strokeWidth={2.8}
              aria-hidden
            />
            <span className="text-foreground font-display text-[10px] font-semibold">
              Vérifié
            </span>
          </div>
        ) : (
          <div className="absolute top-3.5 right-3.5 flex items-center gap-1 rounded-full border border-white/25 bg-black/40 px-2.5 py-1.5">
            <ShieldQuestion
              className="size-2.5 text-white/85"
              strokeWidth={2.4}
              aria-hidden
            />
            <span className="font-display text-[10px] font-semibold text-white/85">
              Non vérifié
            </span>
          </div>
        )}

        {/* Informations bas de carte. */}
        <div className="absolute inset-x-0 bottom-0 px-5 pb-[22px]">
          <div className="mb-1.5 flex items-baseline gap-2">
            <span className="font-display text-[32px] text-white">
              {profile.firstName},
            </span>
            <span className="font-display text-[26px] font-semibold text-white/80">
              {profile.age}
            </span>
          </div>
          {isOnline ? (
            <div className="mb-1.5 flex items-center gap-1.5">
              <span className="bg-success size-2 rounded-full" />
              <span className="font-display text-[11px] font-semibold text-white/90">
                En ligne
              </span>
            </div>
          ) : lastSeenLabel ? (
            <div className="mb-1.5 flex items-center gap-1.5">
              <span className="size-2 rounded-full bg-white/35" />
              <span className="text-[11px] font-medium text-white/60">
                {lastSeenLabel}
              </span>
            </div>
          ) : null}
          {locationLine ? (
            <p className="mb-3 text-[12.5px] font-medium text-white/75">
              {locationLine}
            </p>
          ) : null}
          <div className="flex flex-wrap gap-1.5">
            {profile.interestNames.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="font-display rounded-full border border-white/25 bg-white/15 px-3 py-1.5 text-[11px] font-semibold text-white"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </m.div>
    </m.div>
  );
}
