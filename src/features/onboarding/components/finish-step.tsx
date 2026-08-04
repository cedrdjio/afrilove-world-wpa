"use client";

import { PartyPopper } from "lucide-react";
import { m } from "framer-motion";

import { GradientButton } from "@/components/ui/gradient-button";
import { ErrorState } from "@/components/feedback";
import { type AppError } from "@/lib/errors";

/**
 * Écran de fin — port de `FinishScreen` (mobile). L'action déclenche
 * l'enregistrement du profil (`persistOnboarding`) puis le routage vers la
 * résolution ; une erreur reste affichée en ligne avec possibilité de
 * réessayer sans perdre le brouillon.
 */
export function FinishStep({
  firstName,
  finishing,
  error,
  onFinish,
}: {
  firstName: string;
  finishing: boolean;
  error: AppError | null;
  onFinish: () => void;
}) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-2 text-center">
      <m.span
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.15, duration: 0.38, ease: [0.23, 1, 0.32, 1] }}
        className="gradient-signature shadow-brand mb-7 grid size-24 place-items-center rounded-full text-white"
      >
        <PartyPopper className="size-11" strokeWidth={1.8} aria-hidden />
      </m.span>

      <h2 className="font-display text-foreground mb-3 text-[30px] leading-tight text-balance">
        Profil complet{firstName ? `, ${firstName}` : ""} !
      </h2>
      <p className="text-muted-foreground mb-8 max-w-sm text-[13.5px] leading-[21px]">
        Votre profil AfriLove World est prêt. Il est temps de faire de belles
        rencontres.
      </p>

      {error ? (
        <div className="mb-6 w-full">
          <ErrorState error={error} inline onRetry={onFinish} />
        </div>
      ) : null}

      <GradientButton
        label="Découvrir l’application"
        className="max-w-xs"
        loading={finishing}
        onClick={onFinish}
      />
    </div>
  );
}
