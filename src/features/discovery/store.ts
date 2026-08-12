"use client";

import { create } from "zustand";

import { DEMO_PROFILES } from "@/features/profiles/data";
import type { Profile } from "@/features/profiles/types";

export type SwipeDirection = "like" | "pass" | "super";

interface DiscoveryState {
  /** Pile de profils restants (haut de pile = index 0). */
  queue: Profile[];
  /** Historique pour le « rewind » (Premium). */
  history: { profile: Profile; direction: SwipeDirection }[];
  /** Profil venant de matcher — déclenche l'overlay « C'est un match ! ». */
  matched: Profile | null;
  swipe: (direction: SwipeDirection) => void;
  rewind: () => void;
  clearMatch: () => void;
  reset: () => void;
}

/**
 * État du deck de découverte (Zustand). Découplé de l'UI : les composants
 * s'abonnent aux sélecteurs dont ils ont besoin pour éviter les re-rendus
 * inutiles. La logique de « match » est simulée ici (profils marqués comme
 * réciproques) ; elle sera remplacée par un appel realtime Supabase.
 */
const RECIPROCAL = new Set(["mariama"]);

export const useDiscoveryStore = create<DiscoveryState>((set) => ({
  queue: DEMO_PROFILES,
  history: [],
  matched: null,

  swipe: (direction) =>
    set((state) => {
      const [top, ...rest] = state.queue;
      if (!top) return state;
      const isMatch = direction !== "pass" && RECIPROCAL.has(top.id);
      return {
        queue: rest,
        history: [{ profile: top, direction }, ...state.history].slice(0, 20),
        matched: isMatch ? top : state.matched,
      };
    }),

  rewind: () =>
    set((state) => {
      const [last, ...rest] = state.history;
      if (!last) return state;
      return { queue: [last.profile, ...state.queue], history: rest };
    }),

  clearMatch: () => set({ matched: null }),
  reset: () => set({ queue: DEMO_PROFILES, history: [], matched: null }),
}));
