"use client";

import { useQuery } from "@tanstack/react-query";

import { queryKeys } from "@/lib/query-keys";
import { useAuth } from "@/providers/auth-provider";
import { useSupabase } from "@/providers/supabase-provider";
import { fetchEntitlements, fetchLikers } from "@/features/premium/service";

/** Droits & compteurs du compte connecté (limites, premium, likers count). */
export function useEntitlements() {
  const supabase = useSupabase();
  const { user } = useAuth();
  return useQuery({
    queryKey: queryKeys.entitlements(user?.id),
    queryFn: () => fetchEntitlements(supabase),
    enabled: Boolean(user?.id),
    staleTime: 30_000,
  });
}

/** « Qui vous a aimé » — réservé au Premium (vide sinon, appliqué côté RPC). */
export function useLikers(enabled: boolean) {
  const supabase = useSupabase();
  const { user } = useAuth();
  return useQuery({
    queryKey: queryKeys.likers(user?.id),
    queryFn: () => fetchLikers(supabase),
    enabled: Boolean(user?.id) && enabled,
    staleTime: 30_000,
  });
}
