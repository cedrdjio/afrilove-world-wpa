"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { Lightbulb, Loader2, Plus, X } from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/layout/page-header";
import { DEMO_ME } from "@/features/profiles/data";
import { useAuth } from "@/providers/auth-provider";
import { useHaptics } from "@/hooks/use-haptics";
import { cn } from "@/lib/utils";

import {
  usePhotos,
  useAddPhoto,
  useDeletePhoto,
  type ProfilePhoto,
} from "../photos-hooks";

const MAX_PHOTOS = 6;

/** Élément de grille présenté (photo réelle ou aperçu de démo). */
interface PhotoSlot {
  key: string;
  url: string;
}

/**
 * Gestion des photos (« 14 »). Données réelles (`profile_photos` + Edge
 * Function `upload-photo`) pour un membre connecté, aperçu local pour la
 * démo. L'UI (grille 6 cases, principale, cases vides) reste identique.
 */
export function PhotosScreen() {
  const { isAuthenticated } = useAuth();
  if (isAuthenticated) return <RealPhotos />;
  return <DemoPhotos />;
}

function RealPhotos() {
  const { data, isLoading } = usePhotos();
  const addPhoto = useAddPhoto();
  const deletePhoto = useDeletePhoto();

  const photos: PhotoSlot[] = (data ?? []).map((p: ProfilePhoto) => ({
    key: p.id,
    url: p.url,
  }));

  return (
    <PhotosView
      photos={photos}
      loading={isLoading}
      busy={addPhoto.isPending}
      onAdd={(file) => {
        addPhoto.mutate(
          { file, position: photos.length },
          {
            onError: () =>
              toast.error("La photo n'a pas pu être ajoutée. Réessayez."),
          },
        );
      }}
      onRemove={(key) => {
        deletePhoto.mutate(key, {
          onError: () => toast.error("Suppression impossible. Réessayez."),
        });
      }}
    />
  );
}

function DemoPhotos() {
  const [photos, setPhotos] = useState<PhotoSlot[]>(
    DEMO_ME.photos.map((url, i) => ({ key: `demo-${i}`, url })),
  );
  return (
    <PhotosView
      photos={photos}
      loading={false}
      busy={false}
      onAdd={(file) =>
        setPhotos((prev) => [
          ...prev,
          { key: `demo-${Date.now()}`, url: URL.createObjectURL(file) },
        ])
      }
      onRemove={(key) => setPhotos((prev) => prev.filter((p) => p.key !== key))}
    />
  );
}

function PhotosView({
  photos,
  loading,
  busy,
  onAdd,
  onRemove,
}: {
  photos: PhotoSlot[];
  loading: boolean;
  busy: boolean;
  onAdd: (file: File) => void;
  onRemove: (key: string) => void;
}) {
  const haptic = useHaptics();
  const inputRef = useRef<HTMLInputElement>(null);

  const slots = Array.from({ length: MAX_PHOTOS }, (_, i) => photos[i] ?? null);
  const firstEmpty = photos.length;

  return (
    <div className="mx-auto w-full max-w-md px-5 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
      <PageHeader title="Mes photos" back center />

      <p className="text-muted-foreground mt-4 text-sm leading-relaxed">
        Ajoute jusqu&apos;à {MAX_PHOTOS} photos. La première sera ta photo
        principale.
      </p>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="sr-only"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) {
            haptic("light");
            onAdd(file);
          }
          e.target.value = "";
        }}
      />

      <div className="mt-5 grid grid-cols-3 gap-3">
        {slots.map((photo, index) => {
          if (photo) {
            return (
              <div
                key={photo.key}
                className="shadow-soft relative aspect-3/4 overflow-hidden rounded-[var(--radius-md)]"
              >
                <Image
                  src={photo.url}
                  alt={index === 0 ? "Photo principale" : `Photo ${index + 1}`}
                  fill
                  sizes="(max-width: 448px) 30vw, 130px"
                  className="object-cover"
                  unoptimized={photo.url.startsWith("blob:")}
                />
                {index === 0 ? (
                  <span className="gradient-signature font-display absolute top-2 left-2 rounded-[var(--radius-pill)] px-2.5 py-1 text-[10.5px] font-bold text-white">
                    Principale
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      haptic("warning");
                      onRemove(photo.key);
                    }}
                    aria-label={`Supprimer la photo ${index + 1}`}
                    className="bg-brand-950/55 absolute right-1.5 bottom-1.5 grid size-6 place-items-center rounded-full text-white backdrop-blur-sm"
                  >
                    <X className="size-3.5" strokeWidth={2.6} aria-hidden />
                  </button>
                )}
              </div>
            );
          }

          const isNext = index === firstEmpty;
          const showSpinner = isNext && busy;
          return (
            <button
              key={`empty-${index}`}
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={!isNext || busy || loading}
              aria-label="Ajouter une photo"
              className={cn(
                "border-accent/50 grid aspect-3/4 place-items-center rounded-[var(--radius-md)] border-2 border-dashed bg-white/40 disabled:opacity-60 dark:bg-white/5",
              )}
            >
              <span
                className={cn(
                  "grid size-9 place-items-center rounded-full",
                  isNext
                    ? "gradient-signature text-white"
                    : "bg-accent/20 text-accent",
                )}
              >
                {showSpinner ? (
                  <Loader2 className="size-5 animate-spin" aria-hidden />
                ) : (
                  <Plus className="size-5" strokeWidth={2.4} aria-hidden />
                )}
              </span>
            </button>
          );
        })}
      </div>

      <div className="glass mt-6 flex items-start gap-3.5 rounded-[var(--radius-lg)] p-4">
        <span className="bg-accent/15 grid size-10 shrink-0 place-items-center rounded-[var(--radius-sm)]">
          <Lightbulb className="text-primary size-5" aria-hidden />
        </span>
        <div>
          <div className="font-display font-bold">Conseil</div>
          <p className="text-muted-foreground mt-1 text-sm leading-relaxed">
            Les profils avec un vrai sourire reçoivent 40 % de likes en plus.
          </p>
        </div>
      </div>
    </div>
  );
}
