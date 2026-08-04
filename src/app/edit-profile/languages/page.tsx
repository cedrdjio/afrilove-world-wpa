"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { EditScreenLayout } from "@/features/profile/components/edit-screen-layout";
import { Chip } from "@/components/ui/chip";
import { ErrorState, Skeleton } from "@/components/feedback";
import { mapToAppError } from "@/lib/errors";
import {
  useProfileQuery,
  useUpdateLanguages,
} from "@/features/profile/hooks/use-profile";
import { useLanguagesQuery } from "@/features/profile/hooks/use-reference-data";

/** Édition des langues parlées — port de `EditLanguagesScreen`. */
export default function EditLanguagesPage() {
  const router = useRouter();
  const profileQuery = useProfileQuery();
  const languagesQuery = useLanguagesQuery();
  const updateLanguages = useUpdateLanguages();
  const [selected, setSelected] = useState<string[]>([]);
  const [initialized, setInitialized] = useState(false);

  if (profileQuery.data && !initialized) {
    setInitialized(true);
    setSelected(profileQuery.data.languageIds);
  }

  const toggle = (id: string) =>
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id],
    );

  const handleSave = () =>
    updateLanguages.mutate(selected, { onSuccess: () => router.back() });

  return (
    <EditScreenLayout
      title="Langues"
      subtitle="Quelles langues parlez-vous ?"
      onSave={handleSave}
      saveDisabled={selected.length === 0}
      saving={updateLanguages.isPending}
    >
      {updateLanguages.error ? (
        <div className="mb-4">
          <ErrorState
            error={mapToAppError(updateLanguages.error)}
            inline
            onRetry={handleSave}
          />
        </div>
      ) : null}

      <div className="flex flex-wrap gap-2.5">
        {profileQuery.isPending || languagesQuery.isPending
          ? Array.from({ length: 9 }).map((_, i) => (
              <Skeleton key={i} width={90} height={34} radius={17} />
            ))
          : languagesQuery.data?.map((language) => (
              <Chip
                key={language.id}
                label={language.label}
                selected={selected.includes(language.id)}
                onClick={() => toggle(language.id)}
              />
            ))}
      </div>
    </EditScreenLayout>
  );
}
