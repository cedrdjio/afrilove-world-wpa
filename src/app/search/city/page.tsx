"use client";

import { StringChoiceList } from "@/features/search/components/string-choice-list";
import { SearchFieldLayout } from "@/features/search/components/search-field-layout";
import { useSearchFiltersStore } from "@/features/search/store";

const OPTIONS = [
  "Toutes les villes",
  "Lagos",
  "Accra",
  "Dakar",
  "Abidjan",
  "Nairobi",
  "Paris",
  "Londres",
] as const;

/** Filtre ville — port de `CityFilterScreen`. */
export default function CityFilterPage() {
  const city = useSearchFiltersStore((s) => s.city);
  const setCity = useSearchFiltersStore((s) => s.setCity);

  return (
    <SearchFieldLayout title="Ville">
      <StringChoiceList options={OPTIONS} value={city} onChange={setCity} />
    </SearchFieldLayout>
  );
}
