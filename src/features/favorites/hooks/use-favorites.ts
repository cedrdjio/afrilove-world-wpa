"use client";

import { useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { queryKeys, queryRoots } from "@/lib/query-keys";
import { useAuth } from "@/providers/auth-provider";
import { useSupabase } from "@/providers/supabase-provider";
import {
  addFavorite,
  fetchFavoriteIds,
  fetchSavedFavorites,
  removeFavorite,
} from "@/features/favorites/service";
import { useHaptics } from "@/hooks/use-haptics";

/** Liste complète pour l'onglet Favoris de Mes Matches. */
export function useSavedFavorites() {
  const supabase = useSupabase();
  const { user } = useAuth();
  return useQuery({
    queryKey: queryKeys.favorites(user?.id),
    queryFn: () => fetchSavedFavorites(supabase),
    enabled: Boolean(user?.id),
    staleTime: 30_000,
  });
}

/** Set des ids favoris — pour afficher l'état du signet sur les cartes. */
export function useFavoriteIds(): Set<string> {
  const supabase = useSupabase();
  const { user } = useAuth();
  const query = useQuery({
    queryKey: ["favorite-ids", user?.id],
    queryFn: () => fetchFavoriteIds(supabase),
    enabled: Boolean(user?.id),
    staleTime: 30_000,
  });
  return useMemo(() => new Set(query.data ?? []), [query.data]);
}

/** Ajoute/retire un favori, avec gestion de la limite gratuite (10). */
export function useToggleFavorite() {
  const supabase = useSupabase();
  const queryClient = useQueryClient();
  const haptic = useHaptics();

  return useMutation({
    mutationFn: ({
      targetId,
      isFavorite,
    }: {
      targetId: string;
      isFavorite: boolean;
    }) =>
      isFavorite
        ? removeFavorite(supabase, targetId)
        : addFavorite(supabase, targetId),
    onSuccess: (_, { isFavorite }) => {
      haptic(isFavorite ? "light" : "medium");
      queryClient.invalidateQueries({ queryKey: [queryRoots.favorites] });
      queryClient.invalidateQueries({ queryKey: ["favorite-ids"] });
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : "";
      if (message.includes("FAVORITES_LIMIT_REACHED")) {
        toast.error("Limite de favoris atteinte", {
          description:
            "Vous avez 10 favoris. Passez Premium pour en garder autant que vous voulez.",
        });
      } else {
        toast.error("Le favori n'a pas pu être enregistré. Réessayez.");
      }
    },
  });
}
