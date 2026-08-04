"use client";

import { BadgeCheck } from "lucide-react";

import { Switch } from "@/components/ui/switch";
import { SearchFieldLayout } from "@/features/search/components/search-field-layout";
import { useSearchFiltersStore } from "@/features/search/store";

/** Filtre vérification — port de `VerifiedFilterScreen`. */
export default function VerifiedFilterPage() {
  const verifiedOnly = useSearchFiltersStore((s) => s.verifiedOnly);
  const toggleVerifiedOnly = useSearchFiltersStore((s) => s.toggleVerifiedOnly);

  return (
    <SearchFieldLayout title="Vérification">
      <div className="border-border/70 bg-card/45 flex items-center gap-3.5 rounded-2xl border-[1.5px] px-4 py-4">
        <span className="grid size-9 shrink-0 place-items-center rounded-full bg-[#D99B2B]/[0.12]">
          <BadgeCheck className="size-4 text-[#D99B2B]" aria-hidden />
        </span>
        <span className="text-foreground font-display flex-1 text-[14px] font-semibold">
          Profils vérifiés uniquement
        </span>
        <Switch
          checked={verifiedOnly}
          onCheckedChange={() => toggleVerifiedOnly()}
          aria-label="Profils vérifiés uniquement"
        />
      </div>
    </SearchFieldLayout>
  );
}
