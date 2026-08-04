"use client";

import { StringChoiceList } from "@/features/search/components/string-choice-list";
import { SearchFieldLayout } from "@/features/search/components/search-field-layout";
import { useSearchFiltersStore } from "@/features/search/store";

const OPTIONS = [
  "Peu importe",
  "Chrétienne",
  "Musulmane",
  "Traditionnelle africaine",
  "Autre",
] as const;

/** Filtre religion — port de `ReligionFilterScreen`. */
export default function ReligionFilterPage() {
  const religion = useSearchFiltersStore((s) => s.religion);
  const setReligion = useSearchFiltersStore((s) => s.setReligion);

  return (
    <SearchFieldLayout title="Religion">
      <StringChoiceList
        options={OPTIONS}
        value={religion}
        onChange={setReligion}
      />
    </SearchFieldLayout>
  );
}
