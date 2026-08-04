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
  /** Prénom réel — visible par les autres membres (port du store mobile). */
  firstName: string;
  /** Nom de famille réel — privé, sert à la vérification d'identité (KYC). */
  lastName: string;
  gender: Gender | null;
  lookingFor: LookingFor | null;
  birthDate: string | null; // yyyy-mm-dd
  country: string | null; // libellé pays (profiles.country est du texte)
  city: string | null;
  /** Coordonnées capturées via la géolocalisation navigateur (proximité). */
  latitude: number | null;
  longitude: number | null;
  bio: string;
  smoking: Smoking | null;
  drinking: Drinking | null;
  gymHabit: GymHabit | null;
  hasPets: HasPets | null;
  wantsChildren: WantsChildren | null;
  interestIds: string[];
  /** URLs publiques des photos déjà téléversées pendant le parcours. */
  photos: string[];
}

export const EMPTY_ONBOARDING: OnboardingData = {
  firstName: "",
  lastName: "",
  gender: null,
  lookingFor: null,
  birthDate: null,
  country: null,
  city: null,
  latitude: null,
  longitude: null,
  bio: "",
  smoking: null,
  drinking: null,
  gymHabit: null,
  hasPets: null,
  wantsChildren: null,
  interestIds: [],
  photos: [],
};

/** Règles de validation — parité stricte avec les écrans mobiles. */
export const MIN_NAME = 2; // NameScreen : firstName/lastName ≥ 2
export const MIN_AGE = 18; // BirthdayScreen
export const MIN_INTERESTS = 3; // profile/types MIN_INTERESTS
export const MIN_BIO = 20; // BioScreen MIN_BIO_LENGTH
export const MAX_BIO = 300; // BioScreen MAX_BIO_LENGTH
export const MIN_PHOTOS = 2; // UploadPhotosScreen MIN_PHOTOS
export const MAX_PHOTOS = 6; // UploadPhotosScreen SLOT_COUNT
