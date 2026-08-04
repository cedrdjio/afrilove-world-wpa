"use client";

import { StringChoiceList } from "@/features/search/components/string-choice-list";
import { SearchFieldLayout } from "@/features/search/components/search-field-layout";
import { useSearchFiltersStore } from "@/features/search/store";

const OPTIONS = [
  "Tous les pays",
  "Nigeria",
  "Ghana",
  "Sénégal",
  "Côte d'Ivoire",
  "Kenya",
  "France",
  "Royaume-Uni",
  "États-Unis",
] as const;

/** Filtre pays — port de `CountryFilterScreen`. */
export default function CountryFilterPage() {
  const country = useSearchFiltersStore((s) => s.country);
  const setCountry = useSearchFiltersStore((s) => s.setCountry);

  return (
    <SearchFieldLayout title="Pays">
      <StringChoiceList
        options={OPTIONS}
        value={country}
        onChange={setCountry}
      />
    </SearchFieldLayout>
  );
}
