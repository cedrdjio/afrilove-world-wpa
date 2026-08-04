"use client";

import { useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { queryKeys, queryRoots } from "@/lib/query-keys";
import { useAuth } from "@/providers/auth-provider";
import { useSupabase } from "@/providers/supabase-provider";
import {
  fetchNotifications,
  markAllRead,
  subscribeToNotifications,
  unsubscribe,
} from "@/features/notifications/service";

/**
 * Abonnement Realtime aux notifications entrantes — sans lui, les envois du
 * dashboard n'apparaîtraient qu'au refetch suivant (staleTime 30 s), jamais en
 * direct. Monté une fois dans le shell authentifié (`AppPresence`).
 */
export function useNotificationsRealtime() {
  const supabase = useSupabase();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!user?.id) return;

    const channel = subscribeToNotifications(supabase, user.id, () => {
      queryClient.invalidateQueries({ queryKey: [queryRoots.notifications] });
    });

    return () => unsubscribe(supabase, channel);
  }, [supabase, user?.id, queryClient]);
}

export function useNotificationsQuery() {
  const supabase = useSupabase();
  const { user } = useAuth();

  return useQuery({
    queryKey: queryKeys.notifications(user?.id),
    queryFn: () => fetchNotifications(supabase, user!.id),
    enabled: Boolean(user?.id),
    staleTime: 30_000,
  });
}

/** Nombre de notifications non lues — alimente la pastille de la cloche. */
export function useUnreadNotificationsCount(): number {
  const notificationsQuery = useNotificationsQuery();
  return (notificationsQuery.data ?? []).filter((n) => !n.read).length;
}

export function useMarkAllNotificationsRead() {
  const supabase = useSupabase();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => {
      if (!user) throw new Error("Session invalide");
      return markAllRead(supabase, user.id);
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: [queryRoots.notifications] }),
  });
}
