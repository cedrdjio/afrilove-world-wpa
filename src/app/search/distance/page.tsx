"use client";

import { Chip } from "@/components/ui/chip";
import { SearchFieldLayout } from "@/features/search/components/search-field-layout";
import { useSearchFiltersStore } from "@/features/search/store";

const OPTIONS = [5, 10, 25, 50, 100, 200] as const;

/** Filtre distance — port de `DistanceFilterScreen`. */
export default function DistanceFilterPage() {
  const distanceKm = useSearchFiltersStore((s) => s.distanceKm);
  const setDistanceKm = useSearchFiltersStore((s) => s.setDistanceKm);

  return (
    <SearchFieldLayout title="Distance">
      <div className="flex flex-wrap gap-2">
        {OPTIONS.map((option) => (
          <Chip
            key={option}
            label={`${option} km`}
            selected={distanceKm === option}
            onClick={() => setDistanceKm(option)}
          />
        ))}
      </div>
    </SearchFieldLayout>
  );
}
