"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { useAuth } from "@/providers/auth-provider";

import { discoveryService } from "./service";
import { useDiscoveryFilters } from "./filters-store";
import type { DiscoveryFeedMode, SwipeAction } from "./types";

/**
 * Deck de l'écran Découverte. Chaque valeur des filtres fait partie de la clé
 * de requête : changer un filtre relance immédiatement la recherche. Les
 * profils déjà swipés sont exclus côté serveur — un simple refetch renvoie
 * donc toujours de nouveaux visages.
 */
export function useDiscoveryFeed(mode: DiscoveryFeedMode) {
  const { isAuthenticated } = useAuth();
  const scope = useDiscoveryFilters((s) => s.scope);
  const country = useDiscoveryFilters((s) => s.country);
  const ageMin = useDiscoveryFilters((s) => s.ageMin);
  const ageMax = useDiscoveryFilters((s) => s.ageMax);
  const verifiedOnly = useDiscoveryFilters((s) => s.verifiedOnly);
  const interestIds = useDiscoveryFilters((s) => s.interestIds);

  return useQuery({
    queryKey: [
      "discovery",
      mode,
      scope,
      country,
      ageMin,
      ageMax,
      verifiedOnly,
      interestIds,
    ],
    queryFn: () =>
      discoveryService.searchProfiles({
        ageMin,
        ageMax,
        scope,
        country,
        verifiedOnly,
        mode,
        interestIds,
      }),
    enabled: isAuthenticated,
    staleTime: 60_000,
  });
}

/** Compteur live du bouton « Voir N profils » de l'écran Filtres. */
export function useDiscoveryCount() {
  const { isAuthenticated } = useAuth();
  const scope = useDiscoveryFilters((s) => s.scope);
  const country = useDiscoveryFilters((s) => s.country);
  const ageMin = useDiscoveryFilters((s) => s.ageMin);
  const ageMax = useDiscoveryFilters((s) => s.ageMax);
  const verifiedOnly = useDiscoveryFilters((s) => s.verifiedOnly);
  const interestIds = useDiscoveryFilters((s) => s.interestIds);

  return useQuery({
    queryKey: [
      "discovery-count",
      scope,
      country,
      ageMin,
      ageMax,
      verifiedOnly,
      interestIds,
    ],
    queryFn: () =>
      discoveryService.countProfiles({
        ageMin,
        ageMax,
        scope,
        country,
        verifiedOnly,
        interestIds,
      }),
    enabled: isAuthenticated,
    staleTime: 30_000,
  });
}

/** Pays représentés dans l'app, pour le sélecteur « pays précis » des filtres. */
export function useDiscoveryCountries() {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: ["discovery-countries"],
    queryFn: () => discoveryService.fetchCountries(),
    enabled: isAuthenticated,
    staleTime: 10 * 60_000,
  });
}

export function usePublicProfile(id: string) {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: ["public-profile", id],
    queryFn: () => discoveryService.fetchPublicProfile(id),
    enabled: isAuthenticated && Boolean(id),
    staleTime: 60_000,
  });
}

export function useSwipe() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      targetId,
      action,
    }: {
      targetId: string;
      action: SwipeAction;
    }) => {
      if (!user) throw new Error("Not authenticated");
      return discoveryService.swipe(user.id, targetId, action);
    },
    onSuccess: (result) => {
      // Un swipe consomme du quota et alimente « Mes favoris ».
      queryClient.invalidateQueries({ queryKey: ["entitlements"] });
      queryClient.invalidateQueries({ queryKey: ["favorites"] });
      if (result.isMatch) {
        queryClient.invalidateQueries({ queryKey: ["matches"] });
        queryClient.invalidateQueries({ queryKey: ["conversations"] });
      }
    },
  });
}
