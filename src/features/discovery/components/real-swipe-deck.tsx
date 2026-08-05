"use client";

import { useCallback, useMemo, useState } from "react";

import { useAuth } from "@/providers/auth-provider";
import { useHaptics } from "@/hooks/use-haptics";
import { useFavoriteIds, useToggleFavorite } from "@/features/favorites/hooks";

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
 */
export function RealSwipeDeck({ feed = "foryou" }: { feed?: DiscoveryFeed }) {
  const { profile: me } = useAuth();
  const { data, isLoading, refetch, isFetching } = useDiscoveryFeed("all");
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
        },
      );
    },
    [queue, index, haptic, swipeMutation],
  );

  const rewind = useCallback(() => {
    setHistory((h) => (h.length === 0 ? h : h.slice(1)));
    setIndex((i) => Math.max(0, i - 1));
  }, []);

  const lastDirection = history[0]?.direction ?? "like";
  const topIsFavorite = top ? favoriteIds.has(top.id) : false;

  return (
    <>
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
