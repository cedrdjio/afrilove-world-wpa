"use client";

import { RangeStepper } from "@/features/search/components/range-stepper";
import { SearchFieldLayout } from "@/features/search/components/search-field-layout";
import { useSearchFiltersStore } from "@/features/search/store";

/** Filtre taille — port de `HeightFilterScreen`. */
export default function HeightFilterPage() {
  const heightMin = useSearchFiltersStore((s) => s.heightMin);
  const heightMax = useSearchFiltersStore((s) => s.heightMax);
  const setHeightRange = useSearchFiltersStore((s) => s.setHeightRange);

  return (
    <SearchFieldLayout title="Taille">
      <RangeStepper
        min={140}
        max={220}
        low={heightMin}
        high={heightMax}
        onChange={setHeightRange}
        unit="cm à"
      />
    </SearchFieldLayout>
  );
}
