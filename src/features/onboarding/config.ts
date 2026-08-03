import {
  Baby,
  Ban,
  Cat,
  Cigarette,
  CigaretteOff,
  Dumbbell,
  Footprints,
  GlassWater,
  type LucideIcon,
  Martini,
  PawPrint,
  Sofa,
  Users,
  Wind,
  Wine,
} from "lucide-react";

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
  /** Icône vectorielle Lucide — aucun emoji dans l'interface. */
  icon?: LucideIcon;
  description?: string;
}

/* Étapes d'identité (genre / recherche) : cartes épurées sans pictogramme
   décoratif — plus premium et plus proche des standards iOS qu'un emoji. */
export const GENDER_OPTIONS: Option<Gender>[] = [
  { value: "femme", label: "Une femme" },
  { value: "homme", label: "Un homme" },
];

export const LOOKING_FOR_OPTIONS: Option<LookingFor>[] = [
  { value: "femmes", label: "Des femmes" },
  { value: "hommes", label: "Des hommes" },
  { value: "les-deux", label: "Tout le monde" },
];

export const SMOKING_OPTIONS: Option<Smoking>[] = [
  { value: "non_smoker", label: "Non-fumeur", icon: CigaretteOff },
  { value: "occasional", label: "Parfois", icon: Wind },
  { value: "smoker", label: "Fumeur", icon: Cigarette },
];

export const DRINKING_OPTIONS: Option<Drinking>[] = [
  { value: "never", label: "Jamais", icon: GlassWater },
  { value: "socially", label: "En société", icon: Wine },
  { value: "regularly", label: "Souvent", icon: Martini },
];

export const GYM_OPTIONS: Option<GymHabit>[] = [
  { value: "never", label: "Jamais", icon: Sofa },
  { value: "occasional", label: "Parfois", icon: Footprints },
  { value: "regular", label: "Souvent", icon: Dumbbell },
];

export const PETS_OPTIONS: Option<HasPets>[] = [
  { value: "love", label: "J’adore", icon: PawPrint },
  { value: "neutral", label: "Neutre", icon: Cat },
  { value: "not_fan", label: "Pas fan", icon: Ban },
];

export const CHILDREN_OPTIONS: Option<WantsChildren>[] = [
  { value: "wants", label: "J’en veux", icon: Baby },
  { value: "has_children", label: "J’en ai déjà", icon: Users },
  { value: "not_wanted", label: "Non merci", icon: Ban },
];
