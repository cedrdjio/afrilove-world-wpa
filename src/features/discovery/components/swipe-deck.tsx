"use client";

import { useCallback } from "react";
import Link from "next/link";
import {
  AnimatePresence,
  m,
  useMotionValue,
  useTransform,
  type Variants,
} from "framer-motion";
import { Heart, RotateCcw, Sparkles, X } from "lucide-react";

import { ROUTES } from "@/constants/routes";
import { useHaptics } from "@/hooks/use-haptics";
import { cn } from "@/lib/utils";

import { useDiscoveryStore, type SwipeDirection } from "../store";
import { profileToCard, type DeckCardModel } from "../card";
import { ProfileCard } from "./profile-card";

const SWIPE_THRESHOLD = 110;

const cardVariants: Variants = {
  enter: { scale: 0.94, opacity: 0.7 },
  center: { scale: 1, opacity: 1 },
  exit: (direction: SwipeDirection) => ({
    x: direction === "pass" ? -520 : 520,
    y: direction === "super" ? -120 : 40,
    opacity: 0,
    rotate: direction === "pass" ? -22 : 22,
    transition: { duration: 0.32 },
  }),
};

/** Carte du dessus : draggable, pilote le like/pass selon la direction. */
function TopCard({
  card,
  onDecide,
}: {
  card: DeckCardModel;
  onDecide: (direction: SwipeDirection) => void;
}) {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-220, 220], [-16, 16]);
  const likeOpacity = useTransform(x, [20, 130], [0, 1]);
  const passOpacity = useTransform(x, [-20, -130], [0, 1]);

  return (
    <m.div
      className="absolute inset-0 cursor-grab touch-none active:cursor-grabbing"
      style={{ x, rotate }}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.6}
      whileTap={{ scale: 0.98 }}
      onDragEnd={(_, info) => {
        if (info.offset.x > SWIPE_THRESHOLD) onDecide("like");
        else if (info.offset.x < -SWIPE_THRESHOLD) onDecide("pass");
      }}
    >
      <Link
        href={`${ROUTES.discover}/${card.id}`}
        aria-label={`Voir le profil de ${card.firstName}`}
        className="block size-full"
        draggable={false}
        onClick={(e) => {
          // Un glissement ne doit pas déclencher la navigation.
          if (Math.abs(x.get()) > 6) e.preventDefault();
        }}
      >
        <ProfileCard card={card} priority />
      </Link>

      <m.div
        style={{ opacity: likeOpacity }}
        className="border-success text-success pointer-events-none absolute top-10 left-6 rotate-[-12deg] rounded-xl border-4 px-4 py-1 text-2xl font-extrabold tracking-wider"
      >
        LIKE
      </m.div>
      <m.div
        style={{ opacity: passOpacity }}
        className="border-danger text-danger pointer-events-none absolute top-10 right-6 rotate-[12deg] rounded-xl border-4 px-4 py-1 text-2xl font-extrabold tracking-wider"
      >
        NON
      </m.div>
    </m.div>
  );
}

/**
 * Deck de découverte — présentation pure (pile de cartes, drag, boutons,
 * profondeur). Ne rend que 2 cartes (perf). Réutilisé par le deck de démo et
 * le deck réel (données Supabase).
 */
export function SwipeDeckView({
  top,
  next,
  lastDirection,
  canRewind,
  loading = false,
  onDecide,
  onRewind,
  emptyTitle,
  emptySubtitle,
  emptyActionLabel,
  onEmptyAction,
}: {
  top?: DeckCardModel;
  next?: DeckCardModel;
  lastDirection: SwipeDirection;
  canRewind: boolean;
  loading?: boolean;
  onDecide: (direction: SwipeDirection) => void;
  onRewind: () => void;
  emptyTitle: string;
  emptySubtitle: string;
  emptyActionLabel: string;
  onEmptyAction: () => void;
}) {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="relative min-h-0 flex-1">
        {loading && !top && (
          <div className="size-full animate-pulse rounded-[var(--radius-xl)] border border-white/10 bg-white/5" />
        )}

        {!loading && !top && (
          <EmptyState
            title={emptyTitle}
            subtitle={emptySubtitle}
            actionLabel={emptyActionLabel}
            onAction={onEmptyAction}
          />
        )}

        {next && (
          <div className="absolute inset-0 -translate-y-4 scale-[0.94] opacity-60">
            <ProfileCard card={next} />
          </div>
        )}

        <AnimatePresence custom={lastDirection}>
          {top && (
            <m.div
              key={top.id}
              className="absolute inset-0"
              variants={cardVariants}
              custom={lastDirection}
              initial="enter"
              animate="center"
              exit="exit"
            >
              <TopCard card={top} onDecide={onDecide} />
            </m.div>
          )}
        </AnimatePresence>
      </div>

      {top && (
        <div className="relative z-20 -mt-8 flex items-center justify-center gap-5 pb-1">
          <ActionButton
            label="Revenir en arrière"
            onClick={onRewind}
            disabled={!canRewind}
            className="size-12 text-white/80"
          >
            <RotateCcw className="size-5" aria-hidden />
          </ActionButton>
          <ActionButton
            label="Passer"
            onClick={() => onDecide("pass")}
            className="size-16 text-white"
          >
            <X className="size-7" strokeWidth={2.4} aria-hidden />
          </ActionButton>
          <ActionButton
            label="J'aime"
            onClick={() => onDecide("like")}
            className="gradient-signature shadow-brand size-[4.75rem] scale-105 border-white/30 text-white"
          >
            <Heart className="size-9 fill-current" aria-hidden />
          </ActionButton>
          <ActionButton
            label="Super like"
            onClick={() => onDecide("super")}
            className="text-brand-300 size-12"
          >
            <Sparkles className="size-5 fill-current" aria-hidden />
          </ActionButton>
        </div>
      )}
    </div>
  );
}

/**
 * Deck de démonstration (aperçu design non authentifié) — piloté par le store
 * Zustand local. Le deck réel (`RealSwipeDeck`) sert les membres connectés.
 */
export function SwipeDeck() {
  const queue = useDiscoveryStore((s) => s.queue);
  const swipe = useDiscoveryStore((s) => s.swipe);
  const rewind = useDiscoveryStore((s) => s.rewind);
  const reset = useDiscoveryStore((s) => s.reset);
  const canRewind = useDiscoveryStore((s) => s.history.length > 0);
  const lastDirection = useDiscoveryStore(
    (s) => s.history[0]?.direction ?? "like",
  );
  const haptic = useHaptics();

  const decide = useCallback(
    (direction: SwipeDirection) => {
      haptic(direction === "pass" ? "light" : "success");
      swipe(direction);
    },
    [haptic, swipe],
  );

  const [top, next] = queue;

  return (
    <SwipeDeckView
      top={top ? profileToCard(top) : undefined}
      next={next ? profileToCard(next) : undefined}
      lastDirection={lastDirection}
      canRewind={canRewind}
      onDecide={decide}
      onRewind={rewind}
      emptyTitle="Plus de profils pour l'instant"
      emptySubtitle="Revenez plus tard ou élargissez vos filtres."
      emptyActionLabel="Recommencer la démo"
      onEmptyAction={reset}
    />
  );
}

function ActionButton({
  children,
  label,
  onClick,
  disabled,
  className,
}: {
  children: React.ReactNode;
  label: string;
  onClick: () => void;
  disabled?: boolean;
  className?: string;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "grid place-items-center rounded-full border border-white/25 bg-white/10 backdrop-blur-lg transition-all duration-200 focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:outline-none active:scale-90 disabled:opacity-40",
        className,
      )}
    >
      {children}
    </button>
  );
}

function EmptyState({
  title,
  subtitle,
  actionLabel,
  onAction,
}: {
  title: string;
  subtitle: string;
  actionLabel: string;
  onAction: () => void;
}) {
  return (
    <div className="grid size-full place-items-center rounded-[var(--radius-xl)] border border-white/15 bg-white/5 p-8 text-center">
      <div>
        <Heart className="text-brand-300 mx-auto size-12" aria-hidden />
        <h2 className="font-display mt-4 text-xl font-bold text-white">
          {title}
        </h2>
        <p className="mt-2 text-sm text-white/70">{subtitle}</p>
        <button
          type="button"
          onClick={onAction}
          className="mt-6 rounded-[var(--radius-pill)] bg-white/15 px-5 py-2.5 text-sm font-semibold text-white backdrop-blur-lg"
        >
          {actionLabel}
        </button>
      </div>
    </div>
  );
}
