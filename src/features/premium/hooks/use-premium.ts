"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { queryKeys, queryRoots } from "@/lib/query-keys";
import { useAuth } from "@/providers/auth-provider";
import { useSupabase } from "@/providers/supabase-provider";
import {
  fetchFavorites,
  fetchPlans,
  purchasePlan,
} from "@/features/premium/service";
import type {
  CheckoutContext,
  CheckoutInput,
} from "@/features/premium/payments";

/** Forfaits Premium actifs (`premium_plans`) — port de `usePremiumPlans`. */
export function usePremiumPlans() {
  const supabase = useSupabase();
  const { user } = useAuth();
  return useQuery({
    queryKey: queryKeys.premiumPlans(),
    queryFn: () => fetchPlans(supabase),
    enabled: Boolean(user?.id),
    staleTime: 10 * 60 * 1000,
  });
}

/**
 * Achat d'un forfait via CamerPay — port de `usePurchasePlan`. Seul un paiement
 * réglé change les droits ; on re-fetch entitlements + likers sur 'succeeded'.
 * `popup` est la fenêtre CamerPay ouverte dans le geste utilisateur (l'écran
 * l'ouvre et la passe ici, sinon le navigateur la bloquerait).
 */
export function usePurchasePlan() {
  const supabase = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (vars: { input: CheckoutInput; ctx?: CheckoutContext }) =>
      purchasePlan(supabase, vars.input, vars.ctx),
    onSuccess: (result) => {
      if (result.outcome === "succeeded") {
        queryClient.invalidateQueries({ queryKey: [queryRoots.entitlements] });
        queryClient.invalidateQueries({ queryKey: [queryRoots.likers] });
      }
    },
  });
}

/** Favoris enrichis (`get_my_favorites`) — port de `useFavorites`. */
export function useFavorites() {
  const supabase = useSupabase();
  const { user } = useAuth();
  return useQuery({
    queryKey: queryKeys.favorites(user?.id),
    queryFn: () => fetchFavorites(supabase),
    enabled: Boolean(user?.id),
    staleTime: 30_000,
  });
}
