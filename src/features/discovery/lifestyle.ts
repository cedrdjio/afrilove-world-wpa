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
  Ruler,
  Sofa,
  Sparkles,
  Users,
  Wind,
  Wine,
} from "lucide-react";

import { MarsIcon, VenusIcon } from "@/features/onboarding/gender-icons";
import type { IconType } from "@/features/onboarding/config";

/** Un attribut affichable : libellé humain + icône vectorielle. */
export interface LifestyleFact {
  label: string;
  Icon: IconType;
}

type Dict = Record<string, LifestyleFact>;

/**
 * Correspondances valeur d'énum → libellé + icône. Les valeurs sont les
 * énums stables de la base (mêmes que l'onboarding) ; on les traduit ici
 * pour la fiche profil détaillée. 100 % vectoriel, aucun emoji.
 */
const GENDER: Dict = {
  femme: { label: "Femme", Icon: VenusIcon },
  homme: { label: "Homme", Icon: MarsIcon },
  "non-binaire": { label: "Non-binaire", Icon: Sparkles },
};

const SMOKING: Dict = {
  non_smoker: { label: "Non-fumeur", Icon: CigaretteOff },
  occasional: { label: "Fume à l'occasion", Icon: Wind },
  smoker: { label: "Fumeur", Icon: Cigarette },
};

const DRINKING: Dict = {
  never: { label: "Ne boit pas", Icon: GlassWater },
  socially: { label: "Boit socialement", Icon: Wine },
  regularly: { label: "Boit régulièrement", Icon: Martini },
};

const GYM: Dict = {
  never: { label: "Pas de sport", Icon: Sofa },
  occasional: { label: "Sport parfois", Icon: Footprints },
  regular: { label: "Sport souvent", Icon: Dumbbell },
};

const PETS: Dict = {
  love: { label: "Adore les animaux", Icon: PawPrint },
  neutral: { label: "Neutre (animaux)", Icon: Cat },
  not_fan: { label: "Pas fan des animaux", Icon: Ban },
};

const CHILDREN: Dict = {
  wants: { label: "Veut des enfants", Icon: Baby },
  has_children: { label: "A des enfants", Icon: Users },
  not_wanted: { label: "Ne veut pas d'enfants", Icon: Ban },
};

const lookup = (dict: Dict, value: string | null): LifestyleFact | null =>
  value ? (dict[value] ?? null) : null;

export const genderFact = (v: string | null) => lookup(GENDER, v);
export const smokingFact = (v: string | null) => lookup(SMOKING, v);
export const drinkingFact = (v: string | null) => lookup(DRINKING, v);
export const gymFact = (v: string | null) => lookup(GYM, v);
export const petsFact = (v: string | null) => lookup(PETS, v);
export const childrenFact = (v: string | null) => lookup(CHILDREN, v);

/** Taille en cm → « 1,78 m ». */
export function heightFact(cm: number | null): LifestyleFact | null {
  if (!cm) return null;
  const metres = (cm / 100).toFixed(2).replace(".", ",");
  return { label: `${metres} m`, Icon: Ruler as LucideIcon };
}
