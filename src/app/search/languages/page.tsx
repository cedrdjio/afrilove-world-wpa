"use client";

import { Chip } from "@/components/ui/chip";
import { SearchFieldLayout } from "@/features/search/components/search-field-layout";
import { useSearchFiltersStore } from "@/features/search/store";

const OPTIONS = [
  "Français",
  "Anglais",
  "Yoruba",
  "Twi",
  "Swahili",
  "Arabe",
  "Portugais",
  "Wolof",
  "Lingala",
] as const;

/** Filtre langues (multi-sélection) — port de `LanguagesFilterScreen`. */
export default function LanguagesFilterPage() {
  const languages = useSearchFiltersStore((s) => s.languages);
  const toggleLanguage = useSearchFiltersStore((s) => s.toggleLanguage);

  return (
    <SearchFieldLayout title="Langues">
      <div className="flex flex-wrap gap-2">
        {OPTIONS.map((lang) => (
          <Chip
            key={lang}
            label={lang}
            selected={languages.includes(lang)}
            onClick={() => toggleLanguage(lang)}
          />
        ))}
      </div>
    </SearchFieldLayout>
  );
}
