"use client";

import { useCallback, useMemo, useState } from "react";

import { useAuth } from "@/providers/auth-provider";
import { useHaptics } from "@/hooks/use-haptics";

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

/**
 * Deck de découverte réel (membre connecté). Alimente le deck présentationnel
 * avec `search_profiles`, persiste chaque swipe (`useSwipe`) et déclenche
 * l'overlay de match sur un like réciproque détecté côté serveur.
 */
export function RealSwipeDeck() {
  const { profile: me } = useAuth();
  const { data, isLoading, refetch, isFetching } = useDiscoveryFeed("all");
  const swipeMutation = useSwipe();
  const haptic = useHaptics();

  const [index, setIndex] = useState(0);
  const [history, setHistory] = useState<
    { id: string; direction: SwipeDirection }[]
  >([]);
  const [match, setMatch] = useState<MatchView | null>(null);

  // Un nouveau vivier (filtres modifiés, refill) réinitialise le pointeur :
  // les profils déjà swipés sont exclus côté serveur, la liste est fraîche.
  // Réinitialisation pendant le rendu (motif React recommandé, pas d'effet).
  const [seenData, setSeenData] = useState(data);
  if (seenData !== data) {
    setSeenData(data);
    setIndex(0);
    setHistory([]);
  }

  const queue = useMemo(() => data ?? [], [data]);
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
      />
      <MatchOverlayView
        match={match}
        myPhoto={me?.avatar_url ?? null}
        onClose={() => setMatch(null)}
      />
    </>
  );
}
