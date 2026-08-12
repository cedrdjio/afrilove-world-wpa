"use client";

import { useCallback, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, Zap } from "lucide-react";
import { toast } from "sonner";

import { ROUTES } from "@/constants/routes";
import { cn } from "@/lib/utils";
import { useAuth } from "@/providers/auth-provider";
import { useHaptics } from "@/hooks/use-haptics";
import { useFavoriteIds, useToggleFavorite } from "@/features/favorites/hooks";
import { useEntitlements } from "@/features/premium/hooks";

import { discoveryToCard } from "../card";
import { useDiscoveryFeed, useSwipe } from "../hooks";
import type { SwipeAction } from "../types";
import type { SwipeDirection } from "../store";
import { SwipeDeckView } from "./swipe-deck";
import { MatchOverlayView, type MatchView } from "./match-overlay";

const ACTION_BY_DIRECTION: Record<SwipeDirection, SwipeAction> = {
  like: "like",
  pass: "pass",
  super: "super_like",
};

/** Onglet de découverte : « Pour toi » (compatibilité) ou « À proximité » (distance). */
export type DiscoveryFeed = "foryou" | "nearby";

/**
 * Deck de découverte réel (membre connecté). Alimente le deck présentationnel
 * avec `search_profiles`, persiste chaque swipe (`useSwipe`) et déclenche
 * l'overlay de match sur un like réciproque détecté côté serveur.
 *
 * `feed` réordonne le même vivier : « Pour toi » met en avant la meilleure
 * compatibilité, « À proximité » les profils géographiquement les plus proches.
 *
 * Le quota gratuit (15 swipes/jour, imposé côté base par `enforce_swipe_limits`)
 * est rendu visible ici : compteur du restant, blocage à l'épuisement et
 * invitation à passer Premium. Les abonnés ne voient aucune de ces limites.
 */
export function RealSwipeDeck({ feed = "foryou" }: { feed?: DiscoveryFeed }) {
  const { profile: me } = useAuth();
  const router = useRouter();
  const { data, isLoading, refetch, isFetching } = useDiscoveryFeed("all");
  const { data: entitlements, refetch: refetchEntitlements } =
    useEntitlements();
  const swipeMutation = useSwipe();
  const favoriteIds = useFavoriteIds();
  const toggleFavorite = useToggleFavorite();
  const haptic = useHaptics();

  const [index, setIndex] = useState(0);
  const [history, setHistory] = useState<
    { id: string; direction: SwipeDirection }[]
  >([]);
  const [match, setMatch] = useState<MatchView | null>(null);

  // Un nouveau vivier (filtres modifiés, refill) OU un changement d'onglet
  // (Pour toi / À proximité) réinitialise le pointeur : les profils déjà
  // swipés sont exclus côté serveur, la liste est fraîche.
  // Réinitialisation pendant le rendu (motif React recommandé, pas d'effet).
  const [seenData, setSeenData] = useState(data);
  const [seenFeed, setSeenFeed] = useState(feed);
  if (seenData !== data || seenFeed !== feed) {
    setSeenData(data);
    setSeenFeed(feed);
    setIndex(0);
    setHistory([]);
  }

  // Quota de swipes du jour. `swipesLimit` vaut null pour les abonnés (illimité).
  const isPremium = entitlements?.isPremium ?? false;
  const swipesLimit = entitlements?.swipesLimit ?? null;
  const swipesUsedToday = entitlements?.swipesUsedToday ?? 0;
  const remainingSwipes =
    swipesLimit == null ? null : Math.max(0, swipesLimit - swipesUsedToday);
  const limitReached = remainingSwipes !== null && remainingSwipes <= 0;

  // Réordonne le vivier selon l'onglet actif. « À proximité » trie par
  // distance croissante (profils sans distance en dernier) ; « Pour toi »
  // met en tête la meilleure compatibilité.
  const queue = useMemo(() => {
    const list = data ?? [];
    const sorted = [...list];
    if (feed === "nearby") {
      sorted.sort((a, b) => {
        const da = a.distanceKm ?? Number.POSITIVE_INFINITY;
        const db = b.distanceKm ?? Number.POSITIVE_INFINITY;
        return da - db;
      });
    } else {
      sorted.sort((a, b) => b.compatibility - a.compatibility);
    }
    return sorted;
  }, [data, feed]);
  const top = queue[index];
  const next = queue[index + 1];

  const decide = useCallback(
    (direction: SwipeDirection) => {
      const card = queue[index];
      if (!card) return;
      // Plafond quotidien atteint : on ne swipe pas, on invite au Premium.
      if (limitReached) {
        haptic("warning");
        return;
      }
      haptic(direction === "pass" ? "light" : "success");
      setHistory((h) => [{ id: card.id, direction }, ...h].slice(0, 20));
      setIndex((i) => i + 1);
      swipeMutation.mutate(
        { targetId: card.id, action: ACTION_BY_DIRECTION[direction] },
        {
          onSuccess: (res) => {
            if (res.isMatch && res.matchId) {
              setMatch({
                conversationId: res.matchId,
                firstName: card.firstName,
                photo: card.avatarUrl,
              });
            }
          },
          onError: (err) => {
            // Le serveur a refusé le swipe (quota épuisé entre deux
            // rafraîchissements) : on annule l'avance optimiste et on
            // resynchronise le compteur pour afficher l'écran de limite.
            setIndex((i) => Math.max(0, i - 1));
            setHistory((h) => h.slice(1));
            const message = err instanceof Error ? err.message : String(err);
            if (message.includes("SWIPE_LIMIT_REACHED")) {
              void refetchEntitlements();
              toast(
                "Limite quotidienne atteinte. Passe Premium pour continuer.",
              );
            } else if (message.includes("SUPER_LIKE")) {
              toast("Les super likes sont réservés aux membres Premium.");
            } else {
              toast.error("Action impossible. Réessaie.");
            }
          },
        },
      );
    },
    [queue, index, limitReached, haptic, swipeMutation, refetchEntitlements],
  );

  const rewind = useCallback(() => {
    setHistory((h) => (h.length === 0 ? h : h.slice(1)));
    setIndex((i) => Math.max(0, i - 1));
  }, []);

  const lastDirection = history[0]?.direction ?? "like";
  const topIsFavorite = top ? favoriteIds.has(top.id) : false;

  // Quota épuisé : on remplace le deck par l'invitation Premium.
  if (limitReached) {
    return (
      <SwipeLimitReached
        limit={swipesLimit ?? 15}
        onUpgrade={() => router.push(ROUTES.premium)}
      />
    );
  }

  return (
    <>
      {/* Compteur du quota gratuit — masqué pour les abonnés (illimité). */}
      {!isPremium && remainingSwipes !== null && (
        <div className="mb-3 flex justify-center">
          <span
            className={cn(
              "shadow-soft inline-flex items-center gap-1.5 rounded-[var(--radius-pill)] px-3 py-1.5 text-xs font-bold",
              remainingSwipes <= 3
                ? "bg-amber-500/15 text-amber-600 dark:text-amber-400"
                : "bg-card/85 border-border text-foreground/80 border backdrop-blur-md",
            )}
            role="status"
            aria-live="polite"
          >
            <Zap className="size-3.5" aria-hidden />
            {remainingSwipes} swipe{remainingSwipes > 1 ? "s" : ""} restant
            {remainingSwipes > 1 ? "s" : ""} aujourd’hui
          </span>
        </div>
      )}

      <SwipeDeckView
        top={top ? discoveryToCard(top) : undefined}
        next={next ? discoveryToCard(next) : undefined}
        lastDirection={lastDirection}
        canRewind={history.length > 0}
        loading={isLoading}
        onDecide={decide}
        onRewind={rewind}
        emptyTitle="Plus de profils pour l'instant"
        emptySubtitle="Revenez plus tard ou élargissez vos filtres."
        emptyActionLabel={isFetching ? "Chargement…" : "Actualiser"}
        onEmptyAction={() => void refetch()}
        isFavorite={topIsFavorite}
        favoriteBusy={toggleFavorite.isPending}
        onToggleFavorite={
          top
            ? () => {
                haptic(topIsFavorite ? "light" : "success");
                toggleFavorite.mutate({
                  targetId: top.id,
                  isFavorite: topIsFavorite,
                });
              }
            : undefined
        }
      />
      <MatchOverlayView
        match={match}
        myPhoto={me?.avatar_url ?? null}
        onClose={() => setMatch(null)}
      />
    </>
  );
}

/**
 * Écran affiché quand le quota gratuit de swipes du jour est épuisé : explique
 * la limite et propose de passer Premium (swipes illimités). Le quota se
 * réinitialise chaque jour côté serveur.
 */
function SwipeLimitReached({
  limit,
  onUpgrade,
}: {
  limit: number;
  onUpgrade: () => void;
}) {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="border-border bg-card grid min-h-0 flex-1 place-items-center rounded-[28px] border p-8 text-center shadow-[0_20px_50px_-24px_rgba(46,36,64,0.4)]">
        <div className="max-w-xs">
          <span className="gradient-signature shadow-brand mx-auto grid size-16 place-items-center rounded-full">
            <Sparkles className="size-8 fill-white text-white" aria-hidden />
          </span>
          <h2 className="font-display text-foreground mt-5 text-xl font-bold">
            Limite du jour atteinte
          </h2>
          <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
            Tu as utilisé tes {limit} swipes gratuits d’aujourd’hui. Passe
            Premium pour swiper sans limite — ou reviens demain, ton quota se
            réinitialise chaque jour.
          </p>
          <button
            type="button"
            onClick={onUpgrade}
            className="gradient-signature shadow-brand font-display mt-6 inline-flex items-center gap-2 rounded-[var(--radius-pill)] px-6 py-3 text-sm font-bold text-white active:scale-[0.98]"
          >
            <Sparkles className="size-4 fill-white" aria-hidden />
            Passer Premium
          </button>
        </div>
      </div>
    </div>
  );
}
