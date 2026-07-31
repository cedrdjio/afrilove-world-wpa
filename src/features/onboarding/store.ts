"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

import { EMPTY_ONBOARDING, type OnboardingData } from "./types";

interface OnboardingState {
  /** Compte auquel appartient le brouillon (évite les fuites entre sessions). */
  ownerId: string | null;
  data: OnboardingData;
  step: number;
  /** Réinitialise le brouillon pour un utilisateur donné. */
  reset: (ownerId: string) => void;
  patch: (patch: Partial<OnboardingData>) => void;
  setStep: (step: number) => void;
  clear: () => void;
}

/**
 * Brouillon d'onboarding persisté (localStorage) : le parcours survit à un
 * rafraîchissement. Vidé à la fin (clear) et remis à zéro si un autre compte
 * se connecte sur le même navigateur.
 */
export const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set) => ({
      ownerId: null,
      data: EMPTY_ONBOARDING,
      step: 0,
      reset: (ownerId) => set({ ownerId, data: EMPTY_ONBOARDING, step: 0 }),
      patch: (patch) => set((state) => ({ data: { ...state.data, ...patch } })),
      setStep: (step) => set({ step }),
      clear: () => set({ ownerId: null, data: EMPTY_ONBOARDING, step: 0 }),
    }),
    { name: "afl-onboarding-draft" },
  ),
);
