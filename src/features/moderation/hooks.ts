"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { useAuth } from "@/providers/auth-provider";

import { moderationService, type ReportReason } from "./service";

/** Liste des membres bloqués (écran « Utilisateurs bloqués »). */
export function useBlockedProfiles() {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: ["blocked-profiles"],
    queryFn: moderationService.fetchBlocked,
    enabled: isAuthenticated,
    staleTime: 30_000,
  });
}

/** Débloque un membre puis rafraîchit la liste + la découverte. */
export function useUnblockProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (targetId: string) =>
      moderationService.unblockProfile(targetId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["blocked-profiles"] });
      queryClient.invalidateQueries({ queryKey: ["discovery"] });
    },
  });
}

export function useBlockProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (targetId: string) => moderationService.blockProfile(targetId),
    onSuccess: () => {
      // Un membre bloqué sort de la découverte, des favoris et des messages.
      queryClient.invalidateQueries({ queryKey: ["discovery"] });
      queryClient.invalidateQueries({ queryKey: ["saved-favorites"] });
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
  });
}

export function useReportProfile() {
  return useMutation({
    mutationFn: ({
      targetId,
      reason,
      details,
    }: {
      targetId: string;
      reason: ReportReason;
      details?: string;
    }) => moderationService.reportProfile(targetId, reason, details),
  });
}
