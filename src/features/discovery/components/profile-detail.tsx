"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { m } from "framer-motion";
import {
  Briefcase,
  ChevronDown,
  ChevronLeft,
  Flag,
  Heart,
  Lock,
  type LucideIcon,
  MapPin,
  MessageCircle,
  MoreHorizontal,
  ShieldX,
  X,
} from "lucide-react";

import { VerifiedBadge } from "@/components/brand/verified-badge";
import { IconButton } from "@/components/ui/icon-button";
import { interestIcon } from "@/lib/interest-icon";
import { initials } from "@/utils/format";
import { cn } from "@/lib/utils";

import type { ProfileInterest } from "../service";

/** Modèle d'affichage de la fiche (démo ou données réelles). */
export interface ProfileDetailView {
  id: string;
  firstName: string;
  age: number;
  /** Photos publiques ordonnées (la 1re est la principale). */
  photos: string[];
  verified: boolean;
  /** Présence temps réel (heartbeat récent). */
  online: boolean;
  locationLine: string;
  profession: string | null;
  bio: string | null;
  interests: ProfileInterest[];
  /** Nombre de médias privés (album 18+ verrouillé). 0 = pas de tuile. */
  privatePhotoCount: number;
}

const EASE = [0.23, 1, 0.32, 1] as const;

/**
 * Fiche profil détaillée (« 05 ») — présentation pure, inspirée de la
 * référence : héros photo plein cadre, galerie de vignettes + tuile « 18+ »,
 * section « À propos » dépliable, « Plus d'infos » en tags vectoriels, et
 * pied de page signaler / bloquer. Les actions sont fournies par le parent.
 */
export function ProfileDetail({
  view,
  onBack,
  onPass,
  onLike,
  onMessage,
  onOptions,
  onReport,
  onBlock,
  onUnlockPrivate,
  messageLabel = "Message",
}: {
  view: ProfileDetailView;
  onBack: () => void;
  onPass: () => void;
  onLike: () => void;
  onMessage: () => void;
  /** Feuille d'actions complète (favoris / bloquer / signaler). */
  onOptions?: () => void;
  onReport?: () => void;
  onBlock?: () => void;
  /** Déverrouillage de l'album privé (redirige vers Premium). */
  onUnlockPrivate?: () => void;
  messageLabel?: string;
}) {
  const [active, setActive] = useState(0);
  const detailsRef = useRef<HTMLDivElement>(null);
  const hero = view.photos[active] ?? view.photos[0] ?? null;
  const hasGallery = view.photos.length > 1 || view.privatePhotoCount > 0;

  const scrollToDetails = () =>
    detailsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });

  return (
    <div className="relative mx-auto min-h-dvh w-full max-w-md pb-28">
      {/* Héros photo */}
      <div className="relative h-[56vh] max-h-[560px] min-h-[380px] w-full overflow-hidden">
        {hero ? (
          <Image
            key={hero}
            src={hero}
            alt={`Photo de ${view.firstName}`}
            fill
            priority
            sizes="(max-width: 448px) 100vw, 400px"
            className="object-cover object-[center_28%]"
          />
        ) : (
          <div className="gradient-signature grid size-full place-items-center">
            <span className="font-display text-8xl font-extrabold text-white/90">
              {initials(view.firstName)}
            </span>
          </div>
        )}
        <div className="from-brand-950/70 absolute inset-0 bg-gradient-to-b via-transparent via-35% to-transparent" />
        <div className="from-brand-950/80 absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t to-transparent" />

        {/* En-tête flottant */}
        <div className="absolute inset-x-0 top-[max(1rem,env(safe-area-inset-top))] flex items-center justify-between px-5">
          <IconButton
            tone="glassDark"
            shape="round"
            aria-label="Retour"
            onClick={onBack}
          >
            <ChevronLeft className="size-5" aria-hidden />
          </IconButton>
          <IconButton
            tone="glassDark"
            shape="round"
            aria-label="Options"
            onClick={onOptions}
          >
            <MoreHorizontal className="size-5" aria-hidden />
          </IconButton>
        </div>

        {/* Pastilles de progression photo */}
        {view.photos.length > 1 && (
          <div className="absolute inset-x-0 top-[calc(max(1rem,env(safe-area-inset-top))+3.5rem)] flex justify-center gap-1.5 px-5">
            {view.photos.map((p, i) => (
              <span
                key={p}
                className={cn(
                  "h-1 flex-1 rounded-full transition-colors",
                  i === active ? "bg-white" : "bg-white/35",
                )}
              />
            ))}
          </div>
        )}

        {/* Identité */}
        <div className="absolute inset-x-5 bottom-4 flex items-end justify-between gap-3 text-white">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="font-display truncate text-[1.85rem] leading-none font-extrabold drop-shadow-lg">
                {view.firstName}, {view.age}
              </h1>
              {view.verified && <VerifiedBadge size={24} />}
            </div>
            {view.online ? (
              <span className="mt-2 inline-flex items-center gap-1.5 rounded-[var(--radius-pill)] border border-white/25 bg-white/15 px-2.5 py-1 text-xs font-semibold backdrop-blur-md">
                <span className="size-2 rounded-full bg-emerald-400 shadow-[0_0_6px_2px_rgba(52,211,153,0.6)]" />
                En temps réel
              </span>
            ) : view.locationLine ? (
              <p className="mt-2 flex items-center gap-1.5 text-sm text-white/90 drop-shadow">
                <MapPin className="size-4" aria-hidden />
                <span className="truncate">{view.locationLine}</span>
              </p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={scrollToDetails}
            aria-label="Voir le profil complet"
            className="grid size-10 shrink-0 place-items-center rounded-full border border-white/25 bg-white/15 text-white backdrop-blur-md transition-all active:scale-95"
          >
            <ChevronDown className="size-5" aria-hidden />
          </button>
        </div>
      </div>

      <m.div
        ref={detailsRef}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: EASE }}
        className="space-y-5 px-5 pt-5"
      >
        {/* Galerie de vignettes + tuile privée */}
        {hasGallery && (
          <div className="grid grid-cols-4 gap-2.5">
            {view.photos.map((photo, i) => (
              <button
                key={photo}
                type="button"
                onClick={() => setActive(i)}
                aria-label={`Photo ${i + 1}`}
                aria-current={i === active}
                className={cn(
                  "relative aspect-square overflow-hidden rounded-[var(--radius-md)] transition-all active:scale-95",
                  i === active
                    ? "ring-primary ring-offset-background ring-2 ring-offset-2"
                    : "opacity-90",
                )}
              >
                <Image
                  src={photo}
                  alt=""
                  fill
                  sizes="120px"
                  className="object-cover object-center"
                />
              </button>
            ))}
            {view.privatePhotoCount > 0 && (
              <button
                type="button"
                onClick={onUnlockPrivate}
                aria-label="Contenu privé verrouillé"
                className="relative grid aspect-square place-items-center overflow-hidden rounded-[var(--radius-md)] bg-gradient-to-br from-amber-500 to-amber-700 text-white transition-all active:scale-95"
              >
                <Lock className="size-4" aria-hidden />
                <span className="mt-1 text-[0.62rem] leading-tight font-bold">
                  18+
                </span>
                {view.privatePhotoCount > 1 && (
                  <span className="text-[0.55rem] font-semibold opacity-90">
                    {view.privatePhotoCount} médias
                  </span>
                )}
              </button>
            )}
          </div>
        )}

        {/* À propos */}
        {view.bio && <AboutMe bio={view.bio} />}

        {/* Plus d'infos */}
        {(view.interests.length > 0 || view.profession) && (
          <section className="border-border rounded-[var(--radius-lg)] border p-4">
            <h2 className="font-display text-base font-bold">Plus d’infos</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {view.profession && (
                <InfoTag label={view.profession} Icon={Briefcase} />
              )}
              {view.interests.map((interest) => (
                <InfoTag
                  key={interest.label}
                  label={interest.label}
                  Icon={interestIcon(interest.icon)}
                />
              ))}
            </div>
          </section>
        )}

        {/* Signaler / bloquer — en bas de fiche */}
        {(onReport || onBlock) && (
          <section className="border-border/70 flex flex-col gap-1 border-t pt-4">
            {onReport && (
              <button
                type="button"
                onClick={onReport}
                className="text-muted-foreground hover:text-foreground flex h-12 items-center gap-3 rounded-[var(--radius-md)] px-2 text-sm font-semibold transition-colors"
              >
                <Flag className="size-[1.15rem]" aria-hidden />
                Signaler ce profil
              </button>
            )}
            {onBlock && (
              <button
                type="button"
                onClick={onBlock}
                className="text-danger flex h-12 items-center gap-3 rounded-[var(--radius-md)] px-2 text-sm font-semibold transition-colors active:bg-black/5 dark:active:bg-white/5"
              >
                <ShieldX className="size-[1.15rem]" aria-hidden />
                Bloquer {view.firstName}
              </button>
            )}
          </section>
        )}
      </m.div>

      {/* Barre d'action ancrée */}
      <div className="fixed inset-x-0 bottom-0 z-30 mx-auto w-full max-w-md">
        <div className="from-background flex items-center gap-3.5 bg-gradient-to-t to-transparent px-5 pt-6 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
          <IconButton
            tone="glass"
            shape="round"
            size="lg"
            aria-label="Passer"
            className="text-subtle-foreground"
            onClick={onPass}
          >
            <X className="size-6" strokeWidth={2.4} aria-hidden />
          </IconButton>
          <button
            type="button"
            onClick={onMessage}
            className="gradient-signature shadow-brand font-display flex h-14 flex-1 items-center justify-center gap-2 rounded-[var(--radius-pill)] font-bold text-white active:scale-[0.98]"
          >
            <MessageCircle className="size-5" aria-hidden />
            {messageLabel}
          </button>
          <IconButton
            tone="gradient"
            shape="round"
            size="lg"
            aria-label="J'aime"
            onClick={onLike}
          >
            <Heart className="size-6 fill-current" aria-hidden />
          </IconButton>
        </div>
      </div>
    </div>
  );
}

/** Section « À propos » — repliée à 4 lignes, dépliable. */
function AboutMe({ bio }: { bio: string }) {
  const [expanded, setExpanded] = useState(false);
  const isLong = bio.length > 160;

  return (
    <section className="border-border rounded-[var(--radius-lg)] border p-4">
      <button
        type="button"
        onClick={() => isLong && setExpanded((v) => !v)}
        className="flex w-full items-center justify-between text-left"
        aria-expanded={expanded}
      >
        <h2 className="font-display text-base font-bold">À propos</h2>
        {isLong && (
          <ChevronDown
            className={cn(
              "text-muted-foreground size-5 transition-transform",
              expanded && "rotate-180",
            )}
            aria-hidden
          />
        )}
      </button>
      <p
        className={cn(
          "text-muted-foreground mt-2 text-sm leading-relaxed",
          !expanded && isLong && "line-clamp-4",
        )}
      >
        {bio}
      </p>
    </section>
  );
}

/** Tag « Plus d'infos » : icône vectorielle + libellé. */
function InfoTag({ label, Icon }: { label: string; Icon: LucideIcon }) {
  return (
    <span className="bg-muted/60 text-foreground inline-flex items-center gap-1.5 rounded-[var(--radius-pill)] px-3 py-1.5 text-[0.8rem] font-semibold">
      <Icon className="text-primary size-4" aria-hidden />
      {label}
    </span>
  );
}
