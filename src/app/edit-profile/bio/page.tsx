"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { EditScreenLayout } from "@/features/profile/components/edit-screen-layout";
import { Textarea } from "@/components/ui/textarea";
import { ErrorState } from "@/components/feedback";
import { Spinner } from "@/components/ui/spinner";
import { mapToAppError } from "@/lib/errors";
import {
  useProfileQuery,
  useUpdateProfile,
} from "@/features/profile/hooks/use-profile";

const MAX_LENGTH = 300;

/** Édition de la bio — port de `EditBioScreen`. */
export default function EditBioPage() {
  const router = useRouter();
  const profileQuery = useProfileQuery();
  const updateProfile = useUpdateProfile();
  const [bio, setBio] = useState("");
  const [initialized, setInitialized] = useState(false);

  if (profileQuery.data && !initialized) {
    setInitialized(true);
    setBio(profileQuery.data.bio ?? "");
  }

  const handleSave = () =>
    updateProfile.mutate({ bio }, { onSuccess: () => router.back() });

  return (
    <EditScreenLayout
      title="Bio"
      subtitle="Présentez-vous en quelques mots authentiques."
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

      {profileQuery.isPending ? (
        <div className="grid place-items-center py-16">
          <Spinner />
        </div>
      ) : (
        <>
          <Textarea
            rows={7}
            maxLength={MAX_LENGTH}
            value={bio}
            placeholder="Parlez de vous…"
            onChange={(e) => setBio(e.target.value.slice(0, MAX_LENGTH))}
            aria-label="Bio"
          />
          <p className="text-muted-foreground mt-2 text-right text-[11px] tabular-nums">
            {bio.length}/{MAX_LENGTH}
          </p>
        </>
      )}
    </EditScreenLayout>
  );
}
