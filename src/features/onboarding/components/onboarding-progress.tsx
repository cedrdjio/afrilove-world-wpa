"use client";

import { m } from "framer-motion";

/** Barre de progression segmentée du parcours d'onboarding. */
export function OnboardingProgress({
  current,
  total,
}: {
  current: number;
  total: number;
}) {
  return (
    <div
      className="flex items-center gap-1.5"
      role="progressbar"
      aria-valuemin={1}
      aria-valuemax={total}
      aria-valuenow={current + 1}
      aria-label={`Étape ${current + 1} sur ${total}`}
    >
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className="bg-muted h-1.5 flex-1 overflow-hidden rounded-full"
        >
          <m.div
            className="gradient-signature h-full rounded-full"
            initial={false}
            animate={{ width: i <= current ? "100%" : "0%" }}
            transition={{ duration: 0.35, ease: [0.23, 1, 0.32, 1] }}
          />
        </div>
      ))}
    </div>
  );
}
