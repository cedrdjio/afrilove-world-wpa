"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { EditScreenLayout } from "@/features/profile/components/edit-screen-layout";
import { ChoiceList } from "@/features/profile/components/choice-list";
import { ErrorState } from "@/components/feedback";
import { Spinner } from "@/components/ui/spinner";
import { mapToAppError } from "@/lib/errors";
import {
  useProfileQuery,
  useUpdateProfile,
} from "@/features/profile/hooks/use-profile";
import { useReligionsQuery } from "@/features/profile/hooks/use-reference-data";

/** Édition de la religion — port de `EditReligionScreen`. */
export default function EditReligionPage() {
  const router = useRouter();
  const profileQuery = useProfileQuery();
  const religionsQuery = useReligionsQuery();
  const updateProfile = useUpdateProfile();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [initialized, setInitialized] = useState(false);

  if (profileQuery.data && !initialized) {
    setInitialized(true);
    setSelectedId(profileQuery.data.religionId);
  }

  const handleSave = () =>
    updateProfile.mutate(
      { religion_id: selectedId },
      { onSuccess: () => router.back() },
    );

  return (
    <EditScreenLayout
      title="Religion"
      onSave={handleSave}
      saving={updateProfile.isPending}
    >
      {updateProfile.error ? (
        <div className="mb-4">
          <ErrorState
            error={mapToAppError(updateProfile.error)}
            inline
            onRetry={handleSave}
          />
        </div>
      ) : null}

      {profileQuery.isPending || religionsQuery.isPending ? (
        <div className="grid place-items-center py-16">
          <Spinner />
        </div>
      ) : (
        <ChoiceList
          options={religionsQuery.data ?? []}
          selectedId={selectedId}
          onSelect={setSelectedId}
        />
      )}
    </EditScreenLayout>
  );
}
