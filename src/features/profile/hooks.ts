"use client";

import { useQuery } from "@tanstack/react-query";

import { useAuth } from "@/providers/auth-provider";

import { profileService } from "./service";

export const PROFILE_STATS_QUERY_KEY = "profile-stats" as const;

export function useProfileStats() {
  const { user, isAuthenticated } = useAuth();
  return useQuery({
    queryKey: [PROFILE_STATS_QUERY_KEY, user?.id],
    queryFn: profileService.fetchStats,
    enabled: isAuthenticated,
    staleTime: 60_000,
  });
}
