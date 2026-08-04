"use client";

import { calculateAge, type Profile } from "@/features/profile/types";
import {
  useEducationLevelsQuery,
  useInterestsQuery,
  useLanguagesQuery,
  useLifestyleCategories,
  useReligionsQuery,
} from "./use-reference-data";

export interface ProfileDisplayData {
  age: number | null;
  interestLabels: string[];
  languageLabels: string[];
  religionLabel: string | null;
  educationLabel: string | null;
  lifestyleRows: { label: string; value: string }[];
}

/**
 * Résout un `Profile` brut (ids + enums) en libellés FR prêts à afficher, en
 * croisant les catalogues de référence en cache — partagé par l'aperçu de son
 * propre profil et la vue d'un autre membre pour qu'ils ne divergent jamais.
 * Port de `useProfileDisplayData`.
 */
export function useProfileDisplayData(
  profile: Profile | undefined,
): ProfileDisplayData | null {
  const interestsQuery = useInterestsQuery();
  const languagesQuery = useLanguagesQuery();
  const religionsQuery = useReligionsQuery();
  const educationQuery = useEducationLevelsQuery();
  const { categories: lifestyleCategories } = useLifestyleCategories();

  if (!profile) return null;

  const interestLabels = profile.interestIds
    .map((id) => interestsQuery.data?.find((i) => i.id === id)?.label)
    .filter((label): label is string => Boolean(label));

  const languageLabels = profile.languageIds
    .map((id) => languagesQuery.data?.find((l) => l.id === id)?.label)
    .filter((label): label is string => Boolean(label));

  const religionLabel =
    religionsQuery.data?.find((r) => r.id === profile.religionId)?.label ??
    null;
  const educationLabel =
    educationQuery.data?.find((e) => e.id === profile.educationLevelId)
      ?.label ?? null;

  const lifestyleRows = lifestyleCategories.map((category) => ({
    label: category.label,
    value:
      category.options.find((option) => option.value === profile[category.key])
        ?.label ?? "—",
  }));

  return {
    age: profile.birthDate ? calculateAge(profile.birthDate) : null,
    interestLabels,
    languageLabels,
    religionLabel,
    educationLabel,
    lifestyleRows,
  };
}
