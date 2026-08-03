import {
  Baby,
  Ban,
  Cat,
  Cigarette,
  CigaretteOff,
  Dumbbell,
  Footprints,
  GlassWater,
  Martini,
  PawPrint,
  Sofa,
  Sparkles,
  Users,
  Wind,
  Wine,
} from "lucide-react";
import type { ComponentType, SVGProps } from "react";

import { MarsIcon, VenusIcon } from "./gender-icons";
import type {
  Drinking,
  Gender,
  GymHabit,
  HasPets,
  LookingFor,
  Smoking,
  WantsChildren,
} from "./types";

/** Composant d'icône vectorielle (Lucide ou SVG maison). Aucun emoji. */
export type IconType = ComponentType<
  SVGProps<SVGSVGElement> & { strokeWidth?: string | number }
>;

export interface Option<T extends string> {
  value: T;
  label: string;
  icon?: IconType;
  description?: string;
}

export const GENDER_OPTIONS: Option<Gender>[] = [
  {
    value: "femme",
    label: "Une femme",
    icon: VenusIcon,
    description: "Je m’identifie comme une femme",
  },
  {
    value: "homme",
    label: "Un homme",
    icon: MarsIcon,
    description: "Je m’identifie comme un homme",
  },
  {
    value: "non-binaire",
    label: "Non-binaire",
    icon: Sparkles,
    description: "Je m’identifie autrement",
  },
];

export const LOOKING_FOR_OPTIONS: Option<LookingFor>[] = [
  {
    value: "femmes",
    label: "Des femmes",
    icon: VenusIcon,
    description: "Afficher des profils féminins",
  },
  {
    value: "hommes",
    label: "Des hommes",
    icon: MarsIcon,
    description: "Afficher des profils masculins",
  },
  {
    value: "les-deux",
    label: "Tout le monde",
    icon: Sparkles,
    description: "Afficher tous les profils",
  },
];

export const SMOKING_OPTIONS: Option<Smoking>[] = [
  { value: "non_smoker", label: "Non-fumeur", icon: CigaretteOff },
  { value: "occasional", label: "Occasionnel", icon: Wind },
  { value: "smoker", label: "Fumeur", icon: Cigarette },
];

export const DRINKING_OPTIONS: Option<Drinking>[] = [
  { value: "never", label: "Jamais", icon: GlassWater },
  { value: "socially", label: "Socialement", icon: Wine },
  { value: "regularly", label: "Régulièrement", icon: Martini },
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
