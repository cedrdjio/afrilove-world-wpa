import type {
  Drinking,
  Gender,
  GymHabit,
  HasPets,
  LookingFor,
  Smoking,
  WantsChildren,
} from "./types";

export interface Option<T extends string> {
  value: T;
  label: string;
  icon?: string;
  description?: string;
}

export const GENDER_OPTIONS: Option<Gender>[] = [
  { value: "femme", label: "Une femme", icon: "👩🏾" },
  { value: "homme", label: "Un homme", icon: "👨🏾" },
];

export const LOOKING_FOR_OPTIONS: Option<LookingFor>[] = [
  { value: "femmes", label: "Des femmes", icon: "💗" },
  { value: "hommes", label: "Des hommes", icon: "💙" },
  { value: "les-deux", label: "Tout le monde", icon: "💜" },
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
  { value: "occasional", label: "Parfois", icon: "🚶🏾" },
  { value: "regular", label: "Souvent", icon: "🏋🏾" },
];

export const PETS_OPTIONS: Option<HasPets>[] = [
  { value: "love", label: "J’adore", icon: "🐾" },
  { value: "neutral", label: "Neutre", icon: "🙂" },
  { value: "not_fan", label: "Pas fan", icon: "🙅🏾" },
];

export const CHILDREN_OPTIONS: Option<WantsChildren>[] = [
  { value: "wants", label: "J’en veux", icon: "🍼" },
  { value: "has_children", label: "J’en ai déjà", icon: "👶🏾" },
  { value: "not_wanted", label: "Je n’en veux pas", icon: "🚫" },
];
