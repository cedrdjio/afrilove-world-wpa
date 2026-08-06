/** Valeurs canoniques alignées sur les contraintes CHECK de `profiles`. */
export type Gender = "femme" | "homme" | "non-binaire";
export type LookingFor = "femmes" | "hommes" | "les-deux";
export type Smoking = "non_smoker" | "occasional" | "smoker";
export type Drinking = "never" | "socially" | "regularly";
export type GymHabit = "never" | "occasional" | "regular";
export type HasPets = "love" | "neutral" | "not_fan";
export type WantsChildren = "not_wanted" | "wants" | "has_children";

/** Brouillon d'onboarding (persisté localement le temps du parcours). */
export interface OnboardingData {
  /** Prénom réel, public — écrit dans `first_name`. */
  displayName: string;
  /** Nom de famille réel, privé mais REQUIS (KYC) — écrit dans `last_name`. */
  privateName: string;
  gender: Gender | null;
  lookingFor: LookingFor | null;
  birthDate: string | null; // yyyy-mm-dd
  country: string | null; // libellé pays (profiles.country est du texte)
  city: string | null;
  /** Taille en centimètres (`height_cm`, 100–250). */
  heightCm: number | null;
  /** Métier libre (`profession`). */
  profession: string;
  /** Catalogues (FK) — ids des tables de référence. */
  educationLevelId: string | null;
  religionId: string | null;
  relationshipGoalId: string | null;
  bio: string;
  smoking: Smoking | null;
  drinking: Drinking | null;
  gymHabit: GymHabit | null;
  hasPets: HasPets | null;
  wantsChildren: WantsChildren | null;
  interestIds: string[];
  languageIds: string[];
}

export const EMPTY_ONBOARDING: OnboardingData = {
  displayName: "",
  privateName: "",
  gender: null,
  lookingFor: null,
  birthDate: null,
  country: null,
  city: null,
  heightCm: null,
  profession: "",
  educationLevelId: null,
  religionId: null,
  relationshipGoalId: null,
  bio: "",
  smoking: null,
  drinking: null,
  gymHabit: null,
  hasPets: null,
  wantsChildren: null,
  interestIds: [],
  languageIds: [],
};

export const MIN_INTERESTS = 3;
export const MIN_LANGUAGES = 1;
export const MIN_BIO = 1;
export const HEIGHT_MIN = 140;
export const HEIGHT_MAX = 220;
export const HEIGHT_DEFAULT = 170;
