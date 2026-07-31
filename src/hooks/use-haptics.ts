"use client";

import { useCallback } from "react";

import { useSettingsStore } from "@/store/settings-store";

type HapticPattern = "light" | "medium" | "success" | "warning" | "error";

const PATTERNS: Record<HapticPattern, number | number[]> = {
  light: 8,
  medium: 16,
  success: [10, 40, 12],
  warning: [20, 60, 20],
  error: [30, 40, 30, 40],
};

/**
 * Retour haptique mobile (Vibration API), respectant la préférence utilisateur.
 * No-op silencieux là où l'API n'existe pas (iOS Safari, desktop).
 */
export function useHaptics() {
  const enabled = useSettingsStore((s) => s.haptics);

  return useCallback(
    (pattern: HapticPattern = "light") => {
      if (!enabled) return;
      if (typeof navigator === "undefined" || !("vibrate" in navigator)) return;
      navigator.vibrate(PATTERNS[pattern]);
    },
    [enabled],
  );
}
