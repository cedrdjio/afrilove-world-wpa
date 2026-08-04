"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { queryRoots } from "@/lib/query-keys";
import { useAuth } from "@/providers/auth-provider";
import { useSupabase } from "@/providers/supabase-provider";
import { blockUser, unmatch } from "@/features/moderation/service";

/** Bloque un membre — il disparaît des conversations et de la découverte. */
export function useBlockUser() {
  const supabase = useSupabase();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (blockedId: string) => {
      if (!user) throw new Error("Session invalide");
      return blockUser(supabase, user.id, blockedId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [queryRoots.conversations] });
      queryClient.invalidateQueries({ queryKey: [queryRoots.discovery] });
      queryClient.invalidateQueries({ queryKey: [queryRoots.matches] });
    },
  });
}

/** Supprime un match (et ses messages) — la conversation disparaît. */
export function useUnmatch() {
  const supabase = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (matchId: string) => unmatch(supabase, matchId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [queryRoots.conversations] });
      queryClient.invalidateQueries({ queryKey: [queryRoots.matches] });
    },
  });
}
