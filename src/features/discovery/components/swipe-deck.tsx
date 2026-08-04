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
import { Heart, X } from "lucide-react";

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
  loading = false,
  onDecide,
  emptyTitle,
  emptySubtitle,
  emptyActionLabel,
  onEmptyAction,
}: {
  top?: DeckCardModel;
  next?: DeckCardModel;
  lastDirection: SwipeDirection;
  /** Conservés pour l'API (rewind/super Premium) — non rendus dans la maquette 2 boutons. */
  canRewind?: boolean;
  loading?: boolean;
  onDecide: (direction: SwipeDirection) => void;
  onRewind?: () => void;
  emptyTitle: string;
  emptySubtitle: string;
  emptyActionLabel: string;
  onEmptyAction: () => void;
}) {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="relative min-h-0 flex-1">
        {loading && !top && (
          <div className="border-border bg-muted size-full animate-pulse rounded-[28px] border" />
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

        {/* Actions superposées sur la carte (bas-droite), hors du lien de nav. */}
        {top && (
          <div className="absolute right-4 bottom-4 z-30 flex items-center gap-3.5">
            <ActionButton
              label="Passer"
              onClick={() => onDecide("pass")}
              className="size-14 bg-black/45 text-white ring-1 ring-white/25 backdrop-blur-md"
            >
              <X className="size-6" strokeWidth={2.6} aria-hidden />
            </ActionButton>
            <ActionButton
              label="J'aime"
              onClick={() => onDecide("like")}
              className="gradient-signature shadow-brand size-14 text-white"
            >
              <Heart className="size-6 fill-current" aria-hidden />
            </ActionButton>
          </div>
        )}
      </div>
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
        "focus-visible:ring-ring grid place-items-center rounded-full transition-all duration-200 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none active:scale-90 disabled:opacity-40",
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
    <div className="border-border bg-card grid size-full place-items-center rounded-[28px] border p-8 text-center shadow-[0_20px_50px_-24px_rgba(46,36,64,0.4)]">
      <div>
        <span className="bg-accent/15 mx-auto grid size-16 place-items-center rounded-full">
          <Heart className="text-primary size-8" aria-hidden />
        </span>
        <h2 className="font-display text-foreground mt-4 text-xl font-bold">
          {title}
        </h2>
        <p className="text-muted-foreground mt-2 text-sm">{subtitle}</p>
        <button
          type="button"
          onClick={onAction}
          className="gradient-signature shadow-brand mt-6 rounded-[var(--radius-pill)] px-5 py-2.5 text-sm font-semibold text-white"
        >
          {actionLabel}
        </button>
      </div>
    </div>
  );
}
