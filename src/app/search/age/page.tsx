"use client";

import { RangeStepper } from "@/features/search/components/range-stepper";
import { SearchFieldLayout } from "@/features/search/components/search-field-layout";
import { useSearchFiltersStore } from "@/features/search/store";

/** Filtre tranche d'âge — port de `AgeFilterScreen`. */
export default function AgeFilterPage() {
  const ageMin = useSearchFiltersStore((s) => s.ageMin);
  const ageMax = useSearchFiltersStore((s) => s.ageMax);
  const setAgeRange = useSearchFiltersStore((s) => s.setAgeRange);

  return (
    <SearchFieldLayout title="Tranche d'âge">
      <RangeStepper
        min={18}
        max={99}
        low={ageMin}
        high={ageMax}
        onChange={setAgeRange}
        unit="à"
      />
    </SearchFieldLayout>
  );
}
