"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { moderationService, type ReportReason } from "./service";

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
