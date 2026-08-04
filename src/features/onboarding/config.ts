import type {
  Drinking,
  Gender,
  GymHabit,
  HasPets,
  LookingFor,
  OnboardingData,
  Smoking,
  WantsChildren,
} from "./types";

export interface Option<T extends string> {
  value: T;
  label: string;
  icon?: string;
  description?: string;
}

/** Genre — parité `GenderScreen` (femme / homme / non-binaire) + descriptions. */
export const GENDER_OPTIONS: Option<Gender>[] = [
  {
    value: "femme",
    label: "Femme",
    icon: "👩🏾",
    description: "Je m’identifie comme une femme",
  },
  {
    value: "homme",
    label: "Homme",
    icon: "👨🏾",
    description: "Je m’identifie comme un homme",
  },
  {
    value: "non-binaire",
    label: "Non-binaire",
    icon: "✨",
    description: "Je m’identifie autrement",
  },
];

/** Recherche — parité `LookingForScreen`. */
export const LOOKING_FOR_OPTIONS: Option<LookingFor>[] = [
  {
    value: "femmes",
    label: "Des femmes",
    icon: "💗",
    description: "Afficher des profils féminins",
  },
  {
    value: "hommes",
    label: "Des hommes",
    icon: "💙",
    description: "Afficher des profils masculins",
  },
  {
    value: "les-deux",
    label: "Les deux",
    icon: "💜",
    description: "Afficher tous les profils",
  },
];

export const SMOKING_OPTIONS: Option<Smoking>[] = [
  { value: "non_smoker", label: "Non-fumeur", icon: "🚭" },
  { value: "occasional", label: "Occasionnel", icon: "🍃" },
  { value: "smoker", label: "Fumeur", icon: "🚬" },
];

export const DRINKING_OPTIONS: Option<Drinking>[] = [
  { value: "never", label: "Jamais", icon: "🚱" },
  { value: "socially", label: "Socialement", icon: "🥂" },
  { value: "regularly", label: "Régulièrement", icon: "🍷" },
];

export const GYM_OPTIONS: Option<GymHabit>[] = [
  { value: "never", label: "Jamais", icon: "🛋️" },
  { value: "occasional", label: "Occasionnel", icon: "🚶🏾" },
  { value: "regular", label: "Régulier", icon: "🏋🏾" },
];

export const PETS_OPTIONS: Option<HasPets>[] = [
  { value: "love", label: "Adore", icon: "🐾" },
  { value: "neutral", label: "Neutre", icon: "🙂" },
  { value: "not_fan", label: "Pas fan", icon: "🙅🏾" },
];

export const CHILDREN_OPTIONS: Option<WantsChildren>[] = [
  { value: "not_wanted", label: "N’en veut pas", icon: "🚫" },
  { value: "has_children", label: "En a déjà", icon: "👶🏾" },
  { value: "wants", label: "En veut", icon: "🍼" },
];

/**
 * Catégories de style de vie — port de `LIFESTYLE_CATEGORIES` (mobile). Chaque
 * catégorie mappe un champ du profil (`key`), un intitulé de section, l'emoji
 * de secours et sa `dbCategory` (colonne `lifestyle_options.category`), pour
 * fusionner les libellés gérés au dashboard avec ces valeurs de repli.
 */
export interface LifestyleCategoryDef {
  key: keyof Pick<
    OnboardingData,
    "smoking" | "drinking" | "gymHabit" | "hasPets" | "wantsChildren"
  >;
  label: string;
  dbCategory: string;
  options: Option<string>[];
}

export const LIFESTYLE_CATEGORIES: LifestyleCategoryDef[] = [
  {
    key: "smoking",
    label: "Tabac",
    dbCategory: "smoking",
    options: SMOKING_OPTIONS,
  },
  {
    key: "drinking",
    label: "Alcool",
    dbCategory: "drinking",
    options: DRINKING_OPTIONS,
  },
  { key: "gymHabit", label: "Sport", dbCategory: "gym", options: GYM_OPTIONS },
  {
    key: "hasPets",
    label: "Animaux",
    dbCategory: "pets",
    options: PETS_OPTIONS,
  },
  {
    key: "wantsChildren",
    label: "Enfants",
    dbCategory: "children",
    options: CHILDREN_OPTIONS,
  },
];
