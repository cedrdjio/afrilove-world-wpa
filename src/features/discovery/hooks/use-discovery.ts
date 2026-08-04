"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { queryKeys, queryRoots } from "@/lib/query-keys";
import { useAuth } from "@/providers/auth-provider";
import { useSupabase } from "@/providers/supabase-provider";
import {
  countProfiles,
  fetchCountries,
  swipe,
} from "@/features/discovery/service";
import { useFiltersStore } from "@/features/discovery/stores/filters-store";
import type { SwipeAction } from "@/features/discovery/types";

/** Compteur live du bouton « Voir N profils » de l'écran Filtres. */
export function useDiscoveryCount() {
  const supabase = useSupabase();
  const { user } = useAuth();
  const scope = useFiltersStore((s) => s.scope);
  const country = useFiltersStore((s) => s.country);
  const ageMin = useFiltersStore((s) => s.ageMin);
  const ageMax = useFiltersStore((s) => s.ageMax);
  const verifiedOnly = useFiltersStore((s) => s.verifiedOnly);
  const interestIds = useFiltersStore((s) => s.interestIds);

  return useQuery({
    queryKey: queryKeys.discoveryCount(
      scope,
      country,
      ageMin,
      ageMax,
      verifiedOnly,
      interestIds,
    ),
    queryFn: () =>
      countProfiles(supabase, {
        ageMin,
        ageMax,
        scope,
        country,
        verifiedOnly,
        interestIds,
      }),
    enabled: Boolean(user?.id),
    staleTime: 30_000,
  });
}

/** Pays représentés dans l'app, pour le sélecteur « pays précis » des filtres. */
export function useDiscoveryCountries() {
  const supabase = useSupabase();
  const { user } = useAuth();
  return useQuery({
    queryKey: queryKeys.discoveryCountries(),
    queryFn: () => fetchCountries(supabase),
    enabled: Boolean(user?.id),
    staleTime: 10 * 60_000,
  });
}

/**
 * Enregistre un swipe. En cas de succès, invalide les caches transverses
 * (droits, favoris, et matchs/conversations si le like est mutuel) — invalidations
 * strictement identiques au mobile.
 */
export function useSwipe() {
  const supabase = useSupabase();
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
      return swipe(supabase, user.id, targetId, action);
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: [queryRoots.entitlements] });
      queryClient.invalidateQueries({ queryKey: [queryRoots.favorites] });
      if (result.isMatch) {
        queryClient.invalidateQueries({ queryKey: [queryRoots.matches] });
        queryClient.invalidateQueries({
          queryKey: [queryRoots.conversations],
        });
      }
    },
  });
}
