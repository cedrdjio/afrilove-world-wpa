import { create } from "zustand";
import { persist } from "zustand/middleware";

/**
 * Préférences applicatives persistées (localStorage).
 * Le thème clair/sombre est géré par next-themes ; on stocke ici les réglages
 * transversaux indépendants des fonctionnalités métier.
 */
interface SettingsState {
  /** Retours haptiques sur les interactions (mobile). */
  haptics: boolean;
  /** Réduction des animations (complète `prefers-reduced-motion`). */
  reducedMotion: boolean;
  /** Langue de l'interface. */
  locale: "fr" | "en";
  /** Marqueur d'hydratation pour éviter les flashs SSR. */
  hasHydrated: boolean;

  setHaptics: (value: boolean) => void;
  setReducedMotion: (value: boolean) => void;
  setLocale: (locale: "fr" | "en") => void;
  setHasHydrated: (value: boolean) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      haptics: true,
      reducedMotion: false,
      locale: "fr",
      hasHydrated: false,

      setHaptics: (haptics) => set({ haptics }),
      setReducedMotion: (reducedMotion) => set({ reducedMotion }),
      setLocale: (locale) => set({ locale }),
      setHasHydrated: (hasHydrated) => set({ hasHydrated }),
    }),
    {
      name: "afroloveworld:settings",
      onRehydrateStorage: () => (state) => state?.setHasHydrated(true),
      partialize: ({ haptics, reducedMotion, locale }) => ({
        haptics,
        reducedMotion,
        locale,
      }),
    },
  ),
);
