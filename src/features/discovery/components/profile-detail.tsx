"use client";

import Image from "next/image";
import { m } from "framer-motion";
import {
  ChevronLeft,
  Heart,
  MapPin,
  MessageCircle,
  MoreHorizontal,
  X,
} from "lucide-react";

import { VerifiedBadge } from "@/components/brand/verified-badge";
import { Chip } from "@/components/ui/chip";
import { IconButton } from "@/components/ui/icon-button";
import { initials } from "@/utils/format";

/** Modèle d'affichage de la fiche (démo ou données réelles). */
export interface ProfileDetailView {
  id: string;
  firstName: string;
  age: number;
  heroPhoto: string | null;
  verified: boolean;
  locationLine: string;
  bio: string | null;
  interests: string[];
  stats: { value: string; label: string }[];
}

/**
 * Fiche profil détaillée (« 05 ») — présentation pure. En-tête photo, identité,
 * statistiques, bio et centres d'intérêt sur cartes de verre, barre d'action
 * ancrée en bas. Les actions (pass / like / message) sont fournies par le parent.
 */
export function ProfileDetail({
  view,
  onBack,
  onPass,
  onLike,
  onMessage,
  onOptions,
  messageLabel = "Envoyer un message",
}: {
  view: ProfileDetailView;
  onBack: () => void;
  onPass: () => void;
  onLike: () => void;
  onMessage: () => void;
  /** Ouvre la feuille d'actions (favoris / bloquer / signaler). */
  onOptions?: () => void;
  messageLabel?: string;
}) {
  return (
    <div className="relative mx-auto min-h-dvh w-full max-w-md pb-28">
      {/* En-tête photo */}
      <div className="relative h-[45vh] max-h-[400px] min-h-[320px] w-full overflow-hidden">
        {view.heroPhoto ? (
          <Image
            src={view.heroPhoto}
            alt={`Photo de ${view.firstName}`}
            fill
            priority
            sizes="(max-width: 448px) 100vw, 400px"
            className="object-cover"
            style={{ objectPosition: "50% 26%" }}
          />
        ) : (
          <div className="gradient-signature grid size-full place-items-center">
            <span className="font-display text-8xl font-extrabold text-white/90">
              {initials(view.firstName)}
            </span>
          </div>
        )}
        <div className="from-brand-950/35 to-brand-950/60 absolute inset-0 bg-gradient-to-b via-transparent" />

        <div className="absolute inset-x-0 top-[max(1rem,env(safe-area-inset-top))] flex items-center justify-between px-5">
          <IconButton tone="glassDark" aria-label="Retour" onClick={onBack}>
            <ChevronLeft className="size-5" aria-hidden />
          </IconButton>
          <IconButton tone="glassDark" aria-label="Options" onClick={onOptions}>
            <MoreHorizontal className="size-5" aria-hidden />
          </IconButton>
        </div>

        <div className="absolute inset-x-5 bottom-4 text-white">
          <div className="flex items-center gap-2">
            <h1 className="font-display text-3xl font-extrabold drop-shadow-lg">
              {view.firstName}, {view.age}
            </h1>
            {view.verified && <VerifiedBadge size={22} />}
          </div>
          {view.locationLine && (
            <p className="mt-1 flex items-center gap-1.5 text-sm text-white/90 drop-shadow">
              <MapPin className="size-4" aria-hidden />
              {view.locationLine}
            </p>
          )}
        </div>
      </div>

      {/* Contenu */}
      <m.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
        className="space-y-4 px-5 pt-5"
      >
        {view.stats.length > 0 && (
          <div className="flex gap-3">
            {view.stats.map((s) => (
              <Stat key={s.label} value={s.value} label={s.label} />
            ))}
          </div>
        )}

        {view.bio && (
          <section className="glass rounded-[var(--radius-lg)] p-4">
            <h2 className="font-display text-base font-bold">À propos</h2>
            <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
              {view.bio}
            </p>
          </section>
        )}

        {view.interests.length > 0 && (
          <section className="glass rounded-[var(--radius-lg)] p-4">
            <h2 className="font-display text-base font-bold">
              Centres d&apos;intérêt
            </h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {view.interests.map((interest) => (
                <Chip key={interest} tone="soft">
                  {interest}
                </Chip>
              ))}
            </div>
          </section>
        )}
      </m.div>

      {/* Barre d'action */}
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

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="glass flex-1 rounded-[var(--radius-lg)] p-4">
      <div className="text-primary font-display text-2xl font-extrabold">
        {value}
      </div>
      <div className="text-muted-foreground mt-0.5 text-xs">{label}</div>
    </div>
  );
}
