"use client";

import { StringChoiceList } from "@/features/search/components/string-choice-list";
import { SearchFieldLayout } from "@/features/search/components/search-field-layout";
import { useSearchFiltersStore } from "@/features/search/store";

const OPTIONS = [
  "Peu importe",
  "Lycée",
  "Licence",
  "Master",
  "Doctorat",
  "Formation professionnelle",
] as const;

/** Filtre éducation — port de `EducationFilterScreen`. */
export default function EducationFilterPage() {
  const education = useSearchFiltersStore((s) => s.education);
  const setEducation = useSearchFiltersStore((s) => s.setEducation);

  return (
    <SearchFieldLayout title="Éducation">
      <StringChoiceList
        options={OPTIONS}
        value={education}
        onChange={setEducation}
      />
    </SearchFieldLayout>
  );
}
