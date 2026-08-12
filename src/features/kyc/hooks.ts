"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { useAuth } from "@/providers/auth-provider";

import { kycService, type KycDocType } from "./service";

export const KYC_STATUS_QUERY_KEY = "kyc-status" as const;

export function useKycStatus() {
  const { user, isAuthenticated } = useAuth();
  return useQuery({
    queryKey: [KYC_STATUS_QUERY_KEY, user?.id],
    queryFn: kycService.fetchStatus,
    enabled: isAuthenticated,
    staleTime: 30_000,
  });
}

/**
 * Soumet une vérification complète : téléverse les images (recto, verso
 * optionnel, selfie) puis crée la demande. Tout se joue en une mutation pour
 * garder l'UI simple (un seul état de chargement / d'erreur).
 */
export function useSubmitKyc() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      docType: KycDocType;
      front: Blob;
      back: Blob | null;
      selfie: Blob;
    }) => {
      const idFrontPath = await kycService.uploadPart(input.front, "front");
      const idBackPath = input.back
        ? await kycService.uploadPart(input.back, "back")
        : null;
      const selfiePath = await kycService.uploadPart(input.selfie, "selfie");
      await kycService.submit({
        docType: input.docType,
        idFrontPath,
        idBackPath,
        selfiePath,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [KYC_STATUS_QUERY_KEY] });
    },
  });
}
