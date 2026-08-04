"use client";

import { Chip } from "@/components/ui/chip";
import { SearchFieldLayout } from "@/features/search/components/search-field-layout";
import { useSearchFiltersStore } from "@/features/search/store";

const OPTIONS = [
  "Non-fumeur",
  "Boit socialement",
  "Sportif",
  "Aime les animaux",
  "Veut des enfants",
  "Pratiquant",
  "Aime voyager",
  "Cuisine",
] as const;

/** Filtre mode de vie (multi-sélection) — port de `LifestyleFilterScreen`. */
export default function LifestyleFilterPage() {
  const lifestyle = useSearchFiltersStore((s) => s.lifestyle);
  const toggleLifestyle = useSearchFiltersStore((s) => s.toggleLifestyle);

  return (
    <SearchFieldLayout title="Mode de vie">
      <div className="flex flex-wrap gap-2">
        {OPTIONS.map((option) => (
          <Chip
            key={option}
            label={option}
            selected={lifestyle.includes(option)}
            onClick={() => toggleLifestyle(option)}
          />
        ))}
      </div>
    </SearchFieldLayout>
  );
}
