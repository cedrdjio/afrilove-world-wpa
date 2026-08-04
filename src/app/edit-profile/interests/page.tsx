"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { EditScreenLayout } from "@/features/profile/components/edit-screen-layout";
import { Chip } from "@/components/ui/chip";
import { ErrorState, Skeleton } from "@/components/feedback";
import { mapToAppError } from "@/lib/errors";
import {
  useProfileQuery,
  useUpdateInterests,
} from "@/features/profile/hooks/use-profile";
import { useInterestsQuery } from "@/features/profile/hooks/use-reference-data";
import { MIN_INTERESTS } from "@/features/profile/types";

/** Édition des centres d'intérêt — port de `EditInterestsScreen`. */
export default function EditInterestsPage() {
  const router = useRouter();
  const profileQuery = useProfileQuery();
  const interestsQuery = useInterestsQuery();
  const updateInterests = useUpdateInterests();
  const [selected, setSelected] = useState<string[]>([]);
  const [initialized, setInitialized] = useState(false);

  if (profileQuery.data && !initialized) {
    setInitialized(true);
    setSelected(profileQuery.data.interestIds);
  }

  const toggle = (id: string) =>
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id],
    );

  const handleSave = () =>
    updateInterests.mutate(selected, { onSuccess: () => router.back() });

  return (
    <EditScreenLayout
      title="Intérêts"
      subtitle={`Sélectionnez au moins ${MIN_INTERESTS} centres d’intérêt (${selected.length} sélectionnés).`}
      onSave={handleSave}
      saveDisabled={selected.length < MIN_INTERESTS}
      saving={updateInterests.isPending}
    >
      {updateInterests.error ? (
        <div className="mb-4">
          <ErrorState
            error={mapToAppError(updateInterests.error)}
            inline
            onRetry={handleSave}
          />
        </div>
      ) : null}

      <div className="flex flex-wrap gap-2.5">
        {profileQuery.isPending || interestsQuery.isPending
          ? Array.from({ length: 12 }).map((_, i) => (
              <Skeleton key={i} width={90} height={34} radius={17} />
            ))
          : interestsQuery.data?.map((interest) => (
              <Chip
                key={interest.id}
                label={interest.label}
                selected={selected.includes(interest.id)}
                onClick={() => toggle(interest.id)}
              />
            ))}
      </div>
    </EditScreenLayout>
  );
}
