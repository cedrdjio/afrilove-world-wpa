"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { useAuth } from "@/providers/auth-provider";

import { activityService } from "./service";

export const NOTIFICATIONS_QUERY_KEY = "notifications" as const;

export function useNotifications() {
  const { user, isAuthenticated } = useAuth();
  return useQuery({
    queryKey: [NOTIFICATIONS_QUERY_KEY, user?.id],
    queryFn: activityService.fetchNotifications,
    enabled: isAuthenticated,
    staleTime: 30_000,
  });
}

export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: activityService.markAllRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [NOTIFICATIONS_QUERY_KEY] });
    },
  });
}
