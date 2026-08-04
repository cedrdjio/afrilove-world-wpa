"use client";

import { m } from "framer-motion";
import { X, Heart, Bookmark } from "lucide-react";

import { useHaptics } from "@/hooks/use-haptics";

interface ActionButtonsProps {
  onNope: () => void;
  onLike: () => void;
  /** Signet : garder le profil du dessus dans ses favoris (≠ like). */
  onToggleFavorite: () => void;
  isFavorite: boolean;
}

/**
 * Barre d'actions du deck — port de `ActionButtons` (mobile) : Pass (verre),
 * Like (dégradé signature, cœur qui bat), signet Favori. Le retour haptique
 * suit la préférence utilisateur.
 */
export function ActionButtons({
  onNope,
  onLike,
  onToggleFavorite,
  isFavorite,
}: ActionButtonsProps) {
  const haptic = useHaptics();

  const withHaptic = (fn: () => void) => () => {
    haptic("medium");
    fn();
  };

  return (
    <div className="flex items-center justify-center gap-4">
      <m.button
        type="button"
        whileTap={{ scale: 0.9 }}
        onClick={withHaptic(onNope)}
        aria-label="Passer"
        className="border-border/70 bg-card/85 text-muted-foreground grid size-[50px] place-items-center rounded-full border shadow-[0_6px_18px_rgba(46,36,64,0.14)]"
      >
        <X className="size-5" strokeWidth={2.2} aria-hidden />
      </m.button>

      <m.button
        type="button"
        whileTap={{ scale: 0.9 }}
        animate={{ scale: [1, 1.08, 1] }}
        transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
        onClick={withHaptic(onLike)}
        aria-label="J'aime"
        className="gradient-signature grid size-[60px] place-items-center rounded-full text-white shadow-[0_12px_26px_rgba(106,79,192,0.44)]"
      >
        <Heart className="size-6 fill-current" aria-hidden />
      </m.button>

      <m.button
        type="button"
        whileTap={{ scale: 0.9 }}
        onClick={withHaptic(onToggleFavorite)}
        aria-label="Ajouter aux favoris"
        aria-pressed={isFavorite}
        className="border-border/70 bg-card/85 text-brand-600 grid size-11 place-items-center rounded-full border shadow-[0_5px_14px_rgba(46,36,64,0.12)]"
      >
        <Bookmark
          className={`size-[18px] ${isFavorite ? "fill-current" : ""}`}
          aria-hidden
        />
      </m.button>
    </div>
  );
}
