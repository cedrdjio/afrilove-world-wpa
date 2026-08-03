"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { Lightbulb, Plus, X } from "lucide-react";

import { PageHeader } from "@/components/layout/page-header";
import { DEMO_ME } from "@/features/profiles/data";
import { useHaptics } from "@/hooks/use-haptics";
import { cn } from "@/lib/utils";

const MAX_PHOTOS = 6;

/**
 * Gestion des photos (« 14 »). Grille jusqu'à 6 photos ; la première est la
 * principale. Ajout via sélecteur de fichier (aperçu local `objectURL`),
 * suppression, cases vides. L'upload réel passera par l'edge function
 * `upload-photo` + Supabase Storage.
 */
export function PhotosScreen() {
  const haptic = useHaptics();
  const inputRef = useRef<HTMLInputElement>(null);
  const [photos, setPhotos] = useState<string[]>([...DEMO_ME.photos]);

  const slots = Array.from({ length: MAX_PHOTOS }, (_, i) => photos[i] ?? null);
  const firstEmpty = photos.length;

  const addPhoto = (file: File) => {
    if (photos.length >= MAX_PHOTOS) return;
    haptic("light");
    setPhotos((prev) => [...prev, URL.createObjectURL(file)]);
  };

  const removePhoto = (index: number) => {
    haptic("warning");
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="mx-auto w-full max-w-md px-5 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
      <PageHeader
        title="Mes photos"
        back
        center
        trailing={
          <button
            type="button"
            className="text-primary shrink-0 text-sm font-bold"
          >
            Enregistrer
          </button>
        }
      />

      <p className="text-muted-foreground mt-4 text-sm leading-relaxed">
        Ajoute jusqu&apos;à {MAX_PHOTOS} photos. Glisse pour réordonner, la
        première sera ta photo principale.
      </p>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="sr-only"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) addPhoto(file);
          e.target.value = "";
        }}
      />

      <div className="mt-5 grid grid-cols-3 gap-3">
        {slots.map((photo, index) => {
          if (photo) {
            return (
              <div
                key={index}
                className="shadow-soft relative aspect-3/4 overflow-hidden rounded-[var(--radius-md)]"
              >
                <Image
                  src={photo}
                  alt={index === 0 ? "Photo principale" : `Photo ${index + 1}`}
                  fill
                  sizes="(max-width: 448px) 30vw, 130px"
                  className="object-cover"
                  unoptimized={photo.startsWith("blob:")}
                />
                {index === 0 ? (
                  <span className="gradient-signature font-display absolute top-2 left-2 rounded-[var(--radius-pill)] px-2.5 py-1 text-[10.5px] font-bold text-white">
                    Principale
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => removePhoto(index)}
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
          return (
            <button
              key={index}
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={!isNext}
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
                <Plus className="size-5" strokeWidth={2.4} aria-hidden />
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
