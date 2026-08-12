"use client";

import { LazyMotion, MotionConfig, domMax } from "framer-motion";
import { type ReactNode } from "react";

import { useSettingsStore } from "@/store/settings-store";

/**
 * Contexte d'animation global (Framer Motion).
 * - `LazyMotion` + `domAnimation` : ne charge que les features nécessaires
 *   (bundle plus léger). `domMax` ajoute le drag (deck de swipe) et le layout.
 * - `reducedMotion` respecte à la fois la préférence système et le réglage
 *   utilisateur du Settings store.
 */
export function MotionProvider({ children }: { children: ReactNode }) {
  const userReducedMotion = useSettingsStore((s) => s.reducedMotion);

  return (
    <LazyMotion features={domMax}>
      <MotionConfig reducedMotion={userReducedMotion ? "always" : "user"}>
        {children}
      </MotionConfig>
    </LazyMotion>
  );
}
