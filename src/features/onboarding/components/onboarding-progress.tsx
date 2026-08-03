"use client";

import { m } from "framer-motion";

/**
 * Barre de progression continue du parcours d'onboarding. Une seule piste dont
 * le remplissage grandit avec l'avancement — reste lisible même avec un grand
 * nombre d'étapes (une question par écran). Un compteur « X / Y » accompagne la
 * barre pour situer l'utilisateur.
 */
export function OnboardingProgress({
  current,
  total,
}: {
  current: number;
  total: number;
}) {
  const pct = Math.round(((current + 1) / total) * 100);
  return (
    <div className="flex flex-1 items-center gap-3">
      <div
        className="bg-muted h-1.5 flex-1 overflow-hidden rounded-full"
        role="progressbar"
        aria-valuemin={1}
        aria-valuemax={total}
        aria-valuenow={current + 1}
        aria-label={`Étape ${current + 1} sur ${total}`}
      >
        <m.div
          className="gradient-signature h-full rounded-full"
          initial={false}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.35, ease: [0.23, 1, 0.32, 1] }}
        />
      </div>
      <span className="text-subtle-foreground shrink-0 text-xs font-semibold tabular-nums">
        {current + 1}/{total}
      </span>
    </div>
  );
}
