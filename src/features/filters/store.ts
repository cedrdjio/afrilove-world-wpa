"use client";

import { create } from "zustand";

export const ALL_INTERESTS = [
  "Voyages",
  "Cuisine",
  "Musique",
  "Sport",
  "Art",
  "Danse",
  "Cinéma",
] as const;

export interface Filters {
  distanceKm: number;
  ageMin: number;
  ageMax: number;
  interests: string[];
  verifiedOnly: boolean;
}

interface FiltersState extends Filters {
  setDistance: (km: number) => void;
  setAge: (min: number, max: number) => void;
  toggleInterest: (interest: string) => void;
  setVerifiedOnly: (value: boolean) => void;
  reset: () => void;
}

const DEFAULTS: Filters = {
  distanceKm: 25,
  ageMin: 24,
  ageMax: 35,
  interests: ["Voyages", "Musique"],
  verifiedOnly: true,
};

/**
 * Critères de recherche (« 11 Filtres »). Persistables plus tard via Supabase
 * (préférences utilisateur) ; l'écran de découverte s'y abonnera pour filtrer
 * le deck.
 */
export const useFiltersStore = create<FiltersState>((set) => ({
  ...DEFAULTS,
  setDistance: (distanceKm) => set({ distanceKm }),
  setAge: (ageMin, ageMax) => set({ ageMin, ageMax }),
  toggleInterest: (interest) =>
    set((s) => ({
      interests: s.interests.includes(interest)
        ? s.interests.filter((i) => i !== interest)
        : [...s.interests, interest],
    })),
  setVerifiedOnly: (verifiedOnly) => set({ verifiedOnly }),
  reset: () => set(DEFAULTS),
}));
