import type { Profile } from "@/features/profiles/types";

import type { DiscoveryProfile } from "./types";

/**
 * Modèle normalisé d'une carte de deck — dénominateur commun entre les profils
 * de démo (`Profile`) et les profils réels (`DiscoveryProfile`). La carte de
 * présentation ne dépend que de ce modèle (DRY).
 */
export interface DeckCardModel {
  id: string;
  firstName: string;
  age: number;
  photo: string | null;
  compatibility: number;
  verified: boolean;
  city: string | null;
  distanceKm: number | null;
  interests: string[];
}

export function profileToCard(p: Profile): DeckCardModel {
  return {
    id: p.id,
    firstName: p.firstName,
    age: p.age,
    photo: p.photos[0],
    compatibility: p.compatibility,
    verified: p.verified,
    city: p.city,
    distanceKm: p.distanceKm,
    interests: p.interests,
  };
}

export function discoveryToCard(p: DiscoveryProfile): DeckCardModel {
  return {
    id: p.id,
    firstName: p.firstName,
    age: p.age,
    photo: p.avatarUrl,
    compatibility: p.compatibility,
    verified: p.isVerified,
    city: p.city,
    distanceKm: p.distanceKm,
    interests: p.interestNames,
  };
}
