"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { db } from "@/services/supabase/browser";
import { useAuth } from "@/providers/auth-provider";
import {
  fetchEducationLevels,
  fetchInterests,
  fetchLanguages,
  fetchRelationshipGoals,
  fetchReligions,
} from "@/features/onboarding/service";

import { profileEditService, type EditableProfile } from "./edit-service";

export const EDITABLE_PROFILE_KEY = "editable-profile" as const;

/** Charge les valeurs actuelles du profil pour préremplir le formulaire. */
export function useEditableProfile() {
  const { user, isAuthenticated } = useAuth();
  return useQuery({
    queryKey: [EDITABLE_PROFILE_KEY, user?.id],
    queryFn: () => profileEditService.fetchEditableProfile(user!.id),
    enabled: isAuthenticated && Boolean(user?.id),
    staleTime: 30_000,
  });
}

/** Enregistre les modifications et rafraîchit le profil + les stats. */
export function useSaveProfile() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (form: EditableProfile) => {
      if (!user) throw new Error("Not authenticated");
      return profileEditService.saveEditableProfile(user.id, form);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [EDITABLE_PROFILE_KEY] });
      queryClient.invalidateQueries({ queryKey: ["profile-stats"] });
      queryClient.invalidateQueries({ queryKey: ["public-profile"] });
    },
  });
}

/** Catalogues de référence (intérêts, langues, religion, études, objectif). */
export function useProfileCatalogs() {
  const { isAuthenticated } = useAuth();
  const enabled = isAuthenticated;
  const interests = useQuery({
    queryKey: ["catalog-interests"],
    queryFn: () => fetchInterests(db()),
    enabled,
    staleTime: 10 * 60_000,
  });
  const languages = useQuery({
    queryKey: ["catalog-languages"],
    queryFn: () => fetchLanguages(db()),
    enabled,
    staleTime: 10 * 60_000,
  });
  const religions = useQuery({
    queryKey: ["catalog-religions"],
    queryFn: () => fetchReligions(db()),
    enabled,
    staleTime: 10 * 60_000,
  });
  const educationLevels = useQuery({
    queryKey: ["catalog-education"],
    queryFn: () => fetchEducationLevels(db()),
    enabled,
    staleTime: 10 * 60_000,
  });
  const relationshipGoals = useQuery({
    queryKey: ["catalog-goals"],
    queryFn: () => fetchRelationshipGoals(db()),
    enabled,
    staleTime: 10 * 60_000,
  });
  return {
    interests,
    languages,
    religions,
    educationLevels,
    relationshipGoals,
  };
}
