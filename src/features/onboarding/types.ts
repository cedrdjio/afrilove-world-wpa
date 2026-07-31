/** Valeurs canoniques alignées sur les contraintes CHECK de `profiles`. */
export type Gender = "femme" | "homme";
export type LookingFor = "femmes" | "hommes" | "les-deux";
export type Smoking = "non_smoker" | "occasional" | "smoker";
export type Drinking = "never" | "socially" | "regularly";
export type GymHabit = "never" | "occasional" | "regular";
export type HasPets = "love" | "neutral" | "not_fan";
export type WantsChildren = "not_wanted" | "wants" | "has_children";

/** Brouillon d'onboarding (persisté localement le temps du parcours). */
export interface OnboardingData {
  gender: Gender | null;
  lookingFor: LookingFor | null;
  birthDate: string | null; // yyyy-mm-dd
  country: string | null; // libellé pays (profiles.country est du texte)
  city: string | null;
  bio: string;
  smoking: Smoking | null;
  drinking: Drinking | null;
  gymHabit: GymHabit | null;
  hasPets: HasPets | null;
  wantsChildren: WantsChildren | null;
  interestIds: string[];
}

export const EMPTY_ONBOARDING: OnboardingData = {
  gender: null,
  lookingFor: null,
  birthDate: null,
  country: null,
  city: null,
  bio: "",
  smoking: null,
  drinking: null,
  gymHabit: null,
  hasPets: null,
  wantsChildren: null,
  interestIds: [],
};

export const MIN_INTERESTS = 3;
export const MIN_BIO = 1;
