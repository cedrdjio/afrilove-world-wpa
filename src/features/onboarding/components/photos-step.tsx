"use client";

import { useRef, useState } from "react";
import { ImagePlus, Loader2, X } from "lucide-react";
import { toast } from "sonner";

import { uploadProfilePhoto } from "@/features/onboarding/service";
import { cn } from "@/lib/utils";
import { useHaptics } from "@/hooks/use-haptics";
import { useSupabase } from "@/providers/supabase-provider";

const MAX_PHOTOS = 6;

/**
 * Étape photos : téléverse via l'Edge Function `upload-photo`. Facultative pour
 * terminer l'onboarding (mais 2 photos sont requises pour apparaître dans la
 * découverte). Remonte le nombre de photos au parent.
 */
export function PhotosStep({
  onCountChange,
}: {
  onCountChange: (count: number) => void;
}) {
  const supabase = useSupabase();
  const haptic = useHaptics();
  const inputRef = useRef<HTMLInputElement>(null);
  const [urls, setUrls] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);

  async function handleFile(file: File) {
    if (urls.length >= MAX_PHOTOS) return;
    setBusy(true);
    try {
      const { url } = await uploadProfilePhoto(supabase, file, urls.length);
      const next = [...urls, url];
      setUrls(next);
      onCountChange(next.length);
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
    // Suppression locale de l'aperçu (le nettoyage serveur viendra avec la
    // gestion des photos du profil).
    const next = urls.filter((_, idx) => idx !== i);
    setUrls(next);
    onCountChange(next.length);
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-3 gap-3">
        {Array.from({ length: MAX_PHOTOS }).map((_, i) => {
          const url = urls[i];
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
              </div>
            );
          }
          const isNext = i === urls.length;
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
        Ajoutez au moins 2 photos pour apparaître dans la découverte. Vous
        pouvez aussi le faire plus tard depuis votre profil.
      </p>
    </div>
  );
}
