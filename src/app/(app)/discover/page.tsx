"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { m } from "framer-motion";
import { SlidersHorizontal, Bell } from "lucide-react";
import { toast } from "sonner";

import { ScreenBackground } from "@/components/layout/screen-background";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { GlassCard } from "@/components/ui/glass-card";
import { Spinner } from "@/components/ui/spinner";
import { EmptyState, ErrorState } from "@/components/feedback";
import { mapToAppError } from "@/lib/errors";
import { ROUTES } from "@/constants/routes";
import { useHaptics } from "@/hooks/use-haptics";
import { useSupabase } from "@/providers/supabase-provider";
import { searchProfiles } from "@/features/discovery/service";
import { useFiltersStore } from "@/features/discovery/stores/filters-store";
import { useDeckStore } from "@/features/discovery/stores/deck-store";
import { useSwipe } from "@/features/discovery/hooks/use-discovery";
import { useEntitlements } from "@/features/premium/hooks/use-entitlements";
import {
  useFavoriteIds,
  useToggleFavorite,
} from "@/features/favorites/hooks/use-favorites";
import { isRecentlyOnline } from "@/lib/presence";
import {
  SwipeCard,
  type SwipeDirection,
} from "@/features/discovery/components/swipe-card";
import { ActionButtons } from "@/features/discovery/components/action-buttons";
import type { DiscoveryProfile, SwipeAction } from "@/features/discovery/types";

// Deux onglets façon maquette : « Pour toi » = flux recommandé tel quel ;
// « À proximité » = le même flux, trié par distance croissante côté client.
type DiscoveryTab = "foryou" | "nearby";
const TABS: { key: DiscoveryTab; label: string }[] = [
  { key: "foryou", label: "Pour toi" },
  { key: "nearby", label: "À proximité" },
];

const DIRECTION_TO_ACTION: Record<SwipeDirection, SwipeAction> = {
  left: "pass",
  right: "like",
};

export default function DiscoverPage() {
  const router = useRouter();
  const supabase = useSupabase();
  const haptic = useHaptics();
  const [tab, setTab] = useState<DiscoveryTab>("foryou");
  const [commandedDirection, setCommandedDirection] =
    useState<SwipeDirection | null>(null);
  const swipe = useSwipe();
  const entitlements = useEntitlements();

  // Filtres actifs → signature du deck + fonction de chargement. Le deck
  // lui-même vit dans le deckStore : revenir sur cet écran ne recharge rien.
  const scope = useFiltersStore((s) => s.scope);
  const country = useFiltersStore((s) => s.country);
  const ageMin = useFiltersStore((s) => s.ageMin);
  const ageMax = useFiltersStore((s) => s.ageMax);
  const verifiedOnly = useFiltersStore((s) => s.verifiedOnly);
  const interestIds = useFiltersStore((s) => s.interestIds);
  const deckKey = JSON.stringify({
    scope,
    country,
    ageMin,
    ageMax,
    verifiedOnly,
    interestIds,
  });
  const fetchDeck = useCallback(
    () =>
      searchProfiles(supabase, {
        ageMin,
        ageMax,
        scope,
        country,
        verifiedOnly,
        mode: "all",
        interestIds,
      }),
    [supabase, ageMin, ageMax, scope, country, verifiedOnly, interestIds],
  );

  const deckProfiles = useDeckStore((s) => s.profiles);
  const consumedIds = useDeckStore((s) => s.consumedIds);
  const deckStatus = useDeckStore((s) => s.status);
  const deckExhaustedFlag = useDeckStore((s) => s.exhausted);
  const loadInitial = useDeckStore((s) => s.loadInitial);
  const refillDeck = useDeckStore((s) => s.refill);
  const consume = useDeckStore((s) => s.consume);
  const resetDeck = useDeckStore((s) => s.reset);

  useEffect(() => {
    void loadInitial(deckKey, fetchDeck);
  }, [deckKey, fetchDeck, loadInitial]);

  // « À proximité » réordonne par distance ; « Pour toi » garde l'ordre serveur.
  // Les profils déjà traités sont retirés — c'est ce qui fait avancer le deck.
  const profiles = useMemo(() => {
    const list = deckProfiles.filter((p) => !consumedIds.has(p.id));
    if (tab !== "nearby") return list;
    return [...list].sort((a, b) => {
      const da = a.distanceKm ?? Number.POSITIVE_INFINITY;
      const db = b.distanceKm ?? Number.POSITIVE_INFINITY;
      return da - db;
    });
  }, [deckProfiles, tab, consumedIds]);

  // Pagination intelligente : peu de cartes → la page suivante s'AJOUTE en fond.
  useEffect(() => {
    if (profiles.length < 4 && deckStatus === "idle" && !deckExhaustedFlag) {
      void refillDeck(fetchDeck);
    }
  }, [profiles.length, deckStatus, deckExhaustedFlag, refillDeck, fetchDeck]);

  const swipesLimit = entitlements.data?.swipesLimit ?? null;
  const swipesRemaining =
    swipesLimit == null
      ? null
      : Math.max(0, swipesLimit - (entitlements.data?.swipesUsedToday ?? 0));

  // Un changement de filtres ou d'onglet annule toute commande de swipe en
  // attente (évite qu'une commande obsolète parte sur la nouvelle carte du
  // dessus). Réinitialisation en rendu — pattern React recommandé plutôt qu'un
  // effet (react-hooks/set-state-in-effect).
  const resetSignature = `${deckKey}|${tab}`;
  const [lastResetSignature, setLastResetSignature] = useState(resetSignature);
  if (lastResetSignature !== resetSignature) {
    setLastResetSignature(resetSignature);
    if (commandedDirection !== null) setCommandedDirection(null);
  }

  const visibleCards = profiles.slice(0, 3);
  const isLoadingDeck = deckStatus === "loading";
  const isRefilling = deckStatus === "refilling" && profiles.length === 0;
  const isEmpty =
    deckExhaustedFlag && profiles.length === 0 && deckStatus === "idle";
  const isError = deckStatus === "error";
  const deckError = useDeckStore((s) => s.error);
  const retryDeck = () => {
    resetDeck();
    void loadInitial(deckKey, fetchDeck);
  };

  const favoriteIds = useFavoriteIds();
  const toggleFavorite = useToggleFavorite();
  const topProfile = visibleCards[0];
  const topIsFavorite = topProfile ? favoriteIds.has(topProfile.id) : false;

  const handleSwiped = (
    direction: SwipeDirection,
    profile: DiscoveryProfile,
  ) => {
    consume(profile.id);
    setCommandedDirection(null);
    swipe.mutate(
      { targetId: profile.id, action: DIRECTION_TO_ACTION[direction] },
      {
        onSuccess: ({ isMatch }) => {
          if (isMatch) {
            haptic("success");
            router.push(
              `${ROUTES.matchCelebration}?id=${profile.id}&name=${encodeURIComponent(profile.firstName)}`,
            );
          } else if (swipesRemaining != null && swipesRemaining <= 1) {
            router.push(`${ROUTES.discoverLikeLimit}?reason=swipes`);
          }
        },
        onError: (error) => {
          // Les limites gratuites sont appliquées par le trigger DB : les codes
          // d'exception arrivent dans le message d'erreur.
          const message = error instanceof Error ? error.message : "";
          if (
            message.includes("SWIPE_LIMIT_REACHED") ||
            message.includes("LIKE_LIMIT_REACHED")
          ) {
            router.push(`${ROUTES.discoverLikeLimit}?reason=swipes`);
          } else if (message.includes("FAVORITES_LIMIT_REACHED")) {
            router.push(`${ROUTES.discoverLikeLimit}?reason=favorites`);
          } else if (
            message.includes("SUPER_LIKE_PREMIUM_ONLY") ||
            message.includes("SUPER_LIKE_LIMIT_REACHED")
          ) {
            toast("Premium arrive bientôt", {
              description: "Les super-likes se débloqueront avec le Jalon 11.",
            });
          }
        },
      },
    );
  };

  // Les boutons ne font pas avancer le deck : ils commandent la carte du
  // dessus, qui joue sa sortie puis notifie via onSwiped — même chemin qu'un
  // glissement au doigt.
  const triggerSwipe = (direction: SwipeDirection) => {
    if (topProfile && !commandedDirection) setCommandedDirection(direction);
  };

  // Signet : garde le profil dans les Favoris ET compte comme un like — la
  // carte part à droite (même animation) et handleSwiped enregistre le like.
  const handleToggleFavorite = () => {
    if (!topProfile || toggleFavorite.isPending) return;
    toggleFavorite.mutate({
      targetId: topProfile.id,
      isFavorite: topIsFavorite,
    });
    if (!topIsFavorite) triggerSwipe("right");
  };

  const showActionBar =
    !isEmpty &&
    !isLoadingDeck &&
    !isRefilling &&
    !isError &&
    Boolean(topProfile);

  return (
    <div className="relative flex flex-1 flex-col">
      <ScreenBackground theme="cream" />

      {/* En-tête : filtres + thème à gauche, titre, notifications à droite. */}
      <div className="relative z-10 flex items-center justify-between px-5 pt-8">
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => router.push(ROUTES.discoverFilters)}
            aria-label="Filtres"
            className="border-border/60 bg-card/60 text-foreground hover:bg-muted grid size-11 place-items-center rounded-2xl border backdrop-blur transition-colors"
          >
            <SlidersHorizontal className="size-[17px]" aria-hidden />
          </button>
          <ThemeToggle className="size-11 rounded-2xl" />
        </div>
        <h1 className="font-display text-foreground text-[22px] tracking-wide">
          Découvrir
        </h1>
        <button
          type="button"
          onClick={() =>
            toast("Notifications bientôt disponibles", {
              description: "Le centre de notifications arrive au Jalon 10.",
            })
          }
          aria-label="Notifications"
          className="border-border/60 bg-card/60 text-foreground hover:bg-muted grid size-11 place-items-center rounded-2xl border backdrop-blur transition-colors"
        >
          <Bell className="size-[18px]" aria-hidden />
        </button>
      </div>

      {/* Onglets + compteur de swipes. */}
      <div className="relative z-10 flex items-center gap-3 px-5 pt-6">
        <div className="border-brand-500/15 bg-card/60 flex rounded-full border p-1">
          {TABS.map((t) => {
            const active = tab === t.key;
            return (
              <button
                key={t.key}
                type="button"
                onClick={() => {
                  haptic("light");
                  setTab(t.key);
                }}
                className={`font-display rounded-full px-4 py-2 text-[12.5px] transition-colors ${
                  active
                    ? "gradient-signature text-white"
                    : "text-muted-foreground"
                }`}
              >
                {t.label}
              </button>
            );
          })}
        </div>
        {swipesRemaining != null ? (
          <button
            type="button"
            onClick={() =>
              toast("Premium arrive bientôt", {
                description: "Les forfaits se débloquent au Jalon 11.",
              })
            }
            className="border-brand-500/20 bg-brand-500/[0.08] text-brand-600 font-display ml-auto rounded-full border px-3 py-1.5 text-[10.5px] uppercase"
          >
            {swipesRemaining} swipe{swipesRemaining > 1 ? "s" : ""}
          </button>
        ) : null}
      </div>

      {/* Deck. */}
      <div className="relative z-10 mx-3 mt-5 mb-[168px] flex-1">
        {isLoadingDeck || isRefilling ? (
          <div className="border-border/80 bg-card/50 flex h-full flex-col items-center justify-center rounded-[28px] border-[1.5px]">
            <Spinner className="size-8" />
            <p className="text-muted-foreground mt-4 text-[13px]">
              Recherche de profils…
            </p>
          </div>
        ) : isError ? (
          <div className="flex h-full items-center justify-center px-4">
            <ErrorState error={mapToAppError(deckError)} onRetry={retryDeck} />
          </div>
        ) : isEmpty ? (
          <EmptyState
            title="Vous avez tout vu !"
            description="Il n'y a plus de nouveaux profils près de chez vous. Élargissez votre rayon de recherche pour découvrir plus de monde."
            actionLabel="Élargir mes critères"
            onAction={() => router.push(ROUTES.discoverFilters)}
          />
        ) : (
          <div className="relative h-full">
            {visibleCards
              .map((profile, i) => (
                <SwipeCard
                  key={profile.id}
                  profile={profile}
                  isTop={i === 0}
                  stackIndex={i}
                  commandedDirection={i === 0 ? commandedDirection : null}
                  isOnline={isRecentlyOnline(profile.lastActiveAt)}
                  onSwiped={(direction) => handleSwiped(direction, profile)}
                  onTap={() => router.push(`/profile/${profile.id}`)}
                />
              ))
              .reverse()}
          </div>
        )}
      </div>

      {/* Barre d'actions flottante, au-dessus de la barre de navigation. */}
      {showActionBar ? (
        <m.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed inset-x-3 bottom-[104px] z-20 mx-auto max-w-[calc(28rem-1.5rem)]"
        >
          <GlassCard padded={false} className="py-2.5">
            <ActionButtons
              onNope={() => triggerSwipe("left")}
              onLike={() => triggerSwipe("right")}
              onToggleFavorite={handleToggleFavorite}
              isFavorite={topIsFavorite}
            />
          </GlassCard>
        </m.div>
      ) : null}
    </div>
  );
}
