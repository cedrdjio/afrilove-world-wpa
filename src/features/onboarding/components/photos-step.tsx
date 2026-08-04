"use client";

import { useRef, useState } from "react";
import { ImagePlus, Loader2, X } from "lucide-react";
import { toast } from "sonner";

import { uploadProfilePhoto } from "@/features/onboarding/service";
import { MAX_PHOTOS, MIN_PHOTOS } from "@/features/onboarding/types";
import { cn } from "@/lib/utils";
import { useHaptics } from "@/hooks/use-haptics";
import { useSupabase } from "@/providers/supabase-provider";

/**
 * Étape photos — port de `UploadPhotosScreen`. Téléverse via l'Edge Function
 * `upload-photo` (écriture S3 côté serveur). Les URLs sont conservées dans le
 * brouillon persisté : la condition « min. 2 photos » et l'aperçu survivent à
 * un rafraîchissement. La première photo est la principale (badge + avatar via
 * trigger). La suppression est locale ; le nettoyage serveur relève de la
 * gestion des photos du profil (Jalon 6).
 */
export function PhotosStep({
  photos,
  onChange,
}: {
  photos: string[];
  onChange: (photos: string[]) => void;
}) {
  const supabase = useSupabase();
  const haptic = useHaptics();
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  async function handleFile(file: File) {
    if (photos.length >= MAX_PHOTOS) return;
    setBusy(true);
    try {
      const { url } = await uploadProfilePhoto(supabase, file, photos.length);
      onChange([...photos, url]);
      haptic("success");
    } catch {
      haptic("error");
      toast.error("Envoi de la photo impossible pour le moment.", {
        description: "Vous pourrez ajouter vos photos depuis votre profil.",
      });
    } finally {
      setBusy(false);
    }
  }

  function removeAt(i: number) {
    onChange(photos.filter((_, idx) => idx !== i));
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-3 gap-3">
        {Array.from({ length: MAX_PHOTOS }).map((_, i) => {
          const url = photos[i];
          if (url) {
            return (
              <div
                key={i}
                className="border-border relative aspect-[3/4] overflow-hidden rounded-[var(--radius-lg)] border"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={url}
                  alt={`Photo ${i + 1}`}
                  className="size-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => removeAt(i)}
                  aria-label="Retirer la photo"
                  className="bg-background/80 text-foreground absolute top-1.5 right-1.5 grid size-6 place-items-center rounded-full backdrop-blur"
                >
                  <X className="size-3.5" aria-hidden />
                </button>
                {i === 0 ? (
                  <span className="gradient-signature absolute bottom-1.5 left-1.5 rounded-full px-2 py-0.5 text-[8px] font-bold tracking-wide text-white">
                    Principal
                  </span>
                ) : null}
              </div>
            );
          }
          const isNext = i === photos.length;
          return (
            <button
              key={i}
              type="button"
              disabled={!isNext || busy}
              onClick={() => inputRef.current?.click()}
              className={cn(
                "grid aspect-[3/4] place-items-center rounded-[var(--radius-lg)] border-2 border-dashed transition-colors",
                isNext
                  ? "border-primary/40 text-primary hover:bg-primary/5"
                  : "border-border text-muted-foreground/40",
              )}
            >
              {busy && isNext ? (
                <Loader2 className="size-6 animate-spin" aria-hidden />
              ) : (
                <ImagePlus className="size-6" aria-hidden />
              )}
            </button>
          );
        })}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void handleFile(file);
          e.target.value = "";
        }}
      />

      <p className="text-muted-foreground text-sm leading-relaxed">
        Soyez authentique — 3 photos = 4× plus de visibilité. Min. {MIN_PHOTOS}{" "}
        photos requises pour apparaître dans la découverte.
      </p>
    </div>
  );
}
