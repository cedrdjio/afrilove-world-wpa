"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { type Database } from "@/types/database";
import { useAuth } from "@/providers/auth-provider";
import { useSupabase } from "@/providers/supabase-provider";
import {
  deletePhoto,
  fetchOwnProfile,
  fetchProfileStats,
  fetchPublicProfile,
  reorderPhotos,
  setInterests,
  setLanguages,
  updateProfile,
  uploadPhoto,
} from "@/features/profile/service";
import { type ProfilePhoto } from "@/features/profile/types";

type ProfileUpdate = Database["public"]["Tables"]["profiles"]["Update"];

export const PROFILE_QUERY_KEY = "profile-full" as const;

/** Profil complet de l'utilisateur connecté (relations agrégées). */
export function useProfileQuery() {
  const supabase = useSupabase();
  const { user } = useAuth();
  return useQuery({
    queryKey: [PROFILE_QUERY_KEY, user?.id],
    queryFn: () => fetchOwnProfile(supabase, user!.id),
    enabled: Boolean(user?.id),
    staleTime: 60_000,
  });
}

/** Profil public d'un autre membre (RPC `get_public_profile`). */
export function useOtherProfileQuery(profileId: string | undefined) {
  const supabase = useSupabase();
  return useQuery({
    queryKey: ["public-profile", profileId],
    queryFn: () => fetchPublicProfile(supabase, profileId!),
    enabled: Boolean(profileId),
  });
}

/** Mutation générique « patch mon profil » — réutilisée par chaque éditeur. */
export function useUpdateProfile() {
  const supabase = useSupabase();
  const { user, refreshProfile } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (patch: ProfileUpdate) =>
      updateProfile(supabase, user!.id, patch),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: [PROFILE_QUERY_KEY, user?.id],
      });
      // Tient à jour la ligne légère de l'AuthProvider (gardes, en-têtes).
      await refreshProfile();
    },
  });
}

export function useUpdateInterests() {
  const supabase = useSupabase();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (interestIds: string[]) =>
      setInterests(supabase, user!.id, interestIds),
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: [PROFILE_QUERY_KEY, user?.id],
      }),
  });
}

export function useUpdateLanguages() {
  const supabase = useSupabase();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (languageIds: string[]) =>
      setLanguages(supabase, user!.id, languageIds),
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: [PROFILE_QUERY_KEY, user?.id],
      }),
  });
}

/**
 * Regroupe les mutations photo (ajout / remplacement / suppression /
 * ré-ordonnancement) — port de `usePhotoManagement`. La progression fine
 * d'upload du mobile n'est pas exposée par l'invocation Edge côté web ; les
 * écrans s'appuient sur l'état `isPending` des mutations.
 */
export function usePhotoManagement() {
  const supabase = useSupabase();
  const { user, refreshProfile } = useAuth();
  const queryClient = useQueryClient();

  const invalidate = async () => {
    await queryClient.invalidateQueries({
      queryKey: [PROFILE_QUERY_KEY, user?.id],
    });
    // La photo principale devient l'avatar (trigger) — rafraîchit l'en-tête.
    await refreshProfile();
  };

  const addPhoto = useMutation({
    mutationFn: ({ file, position }: { file: Blob; position: number }) =>
      uploadPhoto(supabase, { mode: "add", file, position }),
    onSuccess: invalidate,
  });

  const replacePhoto = useMutation({
    mutationFn: ({ file, photoId }: { file: Blob; photoId: string }) =>
      uploadPhoto(supabase, { mode: "replace", file, photoId }),
    onSuccess: invalidate,
  });

  const removePhoto = useMutation({
    mutationFn: (photoId: string) => deletePhoto(supabase, photoId),
    onSuccess: invalidate,
  });

  const reorder = useMutation({
    mutationFn: (photos: ProfilePhoto[]) => reorderPhotos(supabase, photos),
    onSuccess: invalidate,
  });

  return { addPhoto, replacePhoto, removePhoto, reorder };
}

/** Vues / likes reçus / matches / taux (RPC `get_my_profile_stats`). */
export function useProfileStats() {
  const supabase = useSupabase();
  const { user } = useAuth();
  return useQuery({
    queryKey: ["profile-stats", user?.id],
    queryFn: () => fetchProfileStats(supabase),
    enabled: Boolean(user?.id),
    staleTime: 60_000,
  });
}
