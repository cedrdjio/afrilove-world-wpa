"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { useAuth } from "@/providers/auth-provider";

import { photosService, type ProfilePhoto } from "./photos-service";

export const PHOTOS_QUERY_KEY = "profile-photos" as const;

export function usePhotos() {
  const { user, isAuthenticated } = useAuth();
  return useQuery({
    queryKey: [PHOTOS_QUERY_KEY, user?.id],
    queryFn: photosService.fetchPhotos,
    enabled: isAuthenticated,
    staleTime: 30_000,
  });
}

export function useAddPhoto() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ file, position }: { file: Blob; position: number }) =>
      photosService.addPhoto(file, position),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [PHOTOS_QUERY_KEY] });
    },
  });
}

export function useDeletePhoto() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => photosService.deletePhoto(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [PHOTOS_QUERY_KEY] });
    },
  });
}

export function useReorderPhotos() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (orderedIds: string[]) => photosService.reorder(orderedIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [PHOTOS_QUERY_KEY] });
    },
  });
}

export type { ProfilePhoto };
