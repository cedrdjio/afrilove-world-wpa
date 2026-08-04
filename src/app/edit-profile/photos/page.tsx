"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Plus, RefreshCw, Star, X } from "lucide-react";

import { EditScreenLayout } from "@/features/profile/components/edit-screen-layout";
import { ErrorState, Skeleton } from "@/components/feedback";
import { cn } from "@/lib/utils";
import { mapToAppError } from "@/lib/errors";
import {
  useProfileQuery,
  usePhotoManagement,
} from "@/features/profile/hooks/use-profile";
import {
  MAX_PHOTOS,
  MIN_PHOTOS,
  type ProfilePhoto,
} from "@/features/profile/types";

/** Gestion des photos — port de `EditPhotosScreen`. Ajout / remplacement /
 *  suppression / photo principale, et réorganisation par glisser-déposer. */
export default function EditPhotosPage() {
  const router = useRouter();
  const profileQuery = useProfileQuery();
  const { addPhoto, replacePhoto, removePhoto, reorder } = usePhotoManagement();
  const fileRef = useRef<HTMLInputElement>(null);
  // Cible de l'input fichier : ajout (null) ou remplacement (id de la photo).
  const replaceTargetRef = useRef<string | null>(null);
  const [dragIndex, setDragIndex] = useState<number | null>(null);

  const photos = profileQuery.data?.photos ?? [];
  const isValid = photos.length >= MIN_PHOTOS;
  const busy = addPhoto.isPending || replacePhoto.isPending;

  function openPicker(replacePhotoId: string | null) {
    replaceTargetRef.current = replacePhotoId;
    fileRef.current?.click();
  }

  function onFileChosen(file: File) {
    const target = replaceTargetRef.current;
    if (target) replacePhoto.mutate({ photoId: target, file });
    else addPhoto.mutate({ file, position: photos.length });
    replaceTargetRef.current = null;
  }

  function makePrimary(photo: ProfilePhoto) {
    reorder.mutate([photo, ...photos.filter((p) => p.id !== photo.id)]);
  }

  function handleDrop(toIndex: number) {
    if (dragIndex === null || dragIndex === toIndex) {
      setDragIndex(null);
      return;
    }
    const next = [...photos];
    const [moved] = next.splice(dragIndex, 1);
    next.splice(toIndex, 0, moved!);
    setDragIndex(null);
    reorder.mutate(next);
  }

  const mutationError =
    addPhoto.error ?? replacePhoto.error ?? removePhoto.error ?? reorder.error;

  return (
    <EditScreenLayout
      title="Photos"
      subtitle={`Glissez pour réorganiser · ${MIN_PHOTOS} à ${MAX_PHOTOS} photos.`}
      onSave={() => router.back()}
      saveDisabled={!isValid}
    >
      {mutationError ? (
        <div className="mb-3">
          <ErrorState error={mapToAppError(mutationError)} inline />
        </div>
      ) : null}

      <div className="grid grid-cols-3 gap-2.5">
        {profileQuery.isPending
          ? Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="aspect-[3/4] w-full" radius={16} />
            ))
          : photos.map((photo, index) => (
              <div
                key={photo.id}
                draggable
                onDragStart={() => setDragIndex(index)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => handleDrop(index)}
                className={cn(
                  "relative aspect-[3/4] overflow-hidden rounded-2xl",
                  dragIndex === index && "opacity-50",
                )}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={photo.url}
                  alt={`Photo ${index + 1}`}
                  className="size-full object-cover"
                />

                <button
                  type="button"
                  onClick={() => removePhoto.mutate(photo.id)}
                  aria-label="Supprimer"
                  className="bg-card/90 text-foreground absolute top-1.5 right-1.5 grid size-[22px] place-items-center rounded-full"
                >
                  <X className="size-3" aria-hidden />
                </button>
                <button
                  type="button"
                  onClick={() => openPicker(photo.id)}
                  aria-label="Remplacer"
                  className="bg-card/90 text-foreground absolute top-9 right-1.5 grid size-[22px] place-items-center rounded-full"
                >
                  <RefreshCw className="size-3" aria-hidden />
                </button>

                {photo.isPrimary ? (
                  <span className="gradient-signature absolute bottom-1.5 left-1.5 rounded-full px-2 py-0.5 text-[8px] font-bold text-white">
                    Principale
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => makePrimary(photo)}
                    aria-label="Définir comme principale"
                    className="bg-card/90 absolute bottom-1.5 left-1.5 grid size-[22px] place-items-center rounded-full"
                  >
                    <Star className="size-3 text-[#D99B2B]" aria-hidden />
                  </button>
                )}
              </div>
            ))}

        {!profileQuery.isPending && photos.length < MAX_PHOTOS ? (
          <button
            type="button"
            onClick={() => openPicker(null)}
            disabled={busy}
            className="border-primary/[0.28] bg-card/60 grid aspect-[3/4] place-items-center rounded-2xl border-2 border-dashed"
          >
            <span className="bg-primary/10 grid size-9 place-items-center rounded-full">
              {busy ? (
                <Loader2
                  className="text-primary size-[18px] animate-spin"
                  aria-hidden
                />
              ) : (
                <Plus className="text-primary size-[18px]" aria-hidden />
              )}
            </span>
          </button>
        ) : null}
      </div>

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onFileChosen(file);
          e.target.value = "";
        }}
      />
    </EditScreenLayout>
  );
}
