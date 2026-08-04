"use client";

import { Briefcase } from "lucide-react";

import { GlassInput } from "@/components/ui/glass-input";
import { SearchFieldLayout } from "@/features/search/components/search-field-layout";
import { useSearchFiltersStore } from "@/features/search/store";

/** Filtre profession — port de `ProfessionFilterScreen`. */
export default function ProfessionFilterPage() {
  const profession = useSearchFiltersStore((s) => s.profession);
  const setProfession = useSearchFiltersStore((s) => s.setProfession);

  return (
    <SearchFieldLayout title="Profession">
      <GlassInput
        label="Métier recherché"
        icon={<Briefcase className="size-[15px]" aria-hidden />}
        placeholder="Ex : Ingénieur, Médecin…"
        value={profession}
        onChange={(e) => setProfession(e.target.value)}
      />
    </SearchFieldLayout>
  );
}
