"use client";

import { useQuery } from "@tanstack/react-query";

import { useSupabase } from "@/providers/supabase-provider";
import {
  LIFESTYLE_CATEGORIES,
  type LifestyleCategoryDef,
} from "@/features/onboarding/config";
import { fetchLifestyleOptions } from "@/features/onboarding/service";

export interface LifestyleCategoryView {
  key: LifestyleCategoryDef["key"];
  label: string;
  options: { value: string; label: string }[];
}

/**
 * Catégories de style de vie affichées à l'onboarding — port web de
 * `useLifestyleCategories` (mobile). Les libellés viennent de la table
 * `lifestyle_options` (gérée au dashboard) ; icônes/intitulés de section et
 * valeurs de secours restent locaux. Tant que le catalogue n'est pas chargé —
 * ou s'il est vide — les constantes de repli servent pour ne jamais bloquer
 * l'onboarding.
 */
export function useLifestyleCategories(): {
  categories: LifestyleCategoryView[];
  isLoading: boolean;
} {
  const supabase = useSupabase();
  const query = useQuery({
    queryKey: ["lifestyle-options"],
    queryFn: () => fetchLifestyleOptions(supabase),
    staleTime: 30 * 60 * 1000,
  });

  const categories: LifestyleCategoryView[] = LIFESTYLE_CATEGORIES.map(
    (fallback) => {
      const dbOptions = (query.data ?? [])
        .filter((option) => option.category === fallback.dbCategory)
        .map((option) => ({ value: option.value, label: option.label }));
      return {
        key: fallback.key,
        label: fallback.label,
        options:
          dbOptions.length > 0
            ? dbOptions
            : fallback.options.map((o) => ({ value: o.value, label: o.label })),
      };
    },
  );

  return { categories, isLoading: query.isLoading };
}
