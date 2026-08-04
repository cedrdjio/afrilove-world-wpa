"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Briefcase } from "lucide-react";

import { EditScreenLayout } from "@/features/profile/components/edit-screen-layout";
import { GlassInput } from "@/components/ui/glass-input";
import { ErrorState } from "@/components/feedback";
import { Spinner } from "@/components/ui/spinner";
import { mapToAppError } from "@/lib/errors";
import {
  useProfileQuery,
  useUpdateProfile,
} from "@/features/profile/hooks/use-profile";

/** Édition de la profession — port de `EditJobScreen`. */
export default function EditJobPage() {
  const router = useRouter();
  const profileQuery = useProfileQuery();
  const updateProfile = useUpdateProfile();
  const [job, setJob] = useState("");
  const [initialized, setInitialized] = useState(false);

  if (profileQuery.data && !initialized) {
    setInitialized(true);
    setJob(profileQuery.data.profession ?? "");
  }

  const handleSave = () =>
    updateProfile.mutate(
      { profession: job },
      { onSuccess: () => router.back() },
    );

  return (
    <EditScreenLayout
      title="Profession"
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
        <GlassInput
          label="Métier"
          icon={<Briefcase className="size-4" aria-hidden />}
          placeholder="Votre profession"
          value={job}
          onChange={(e) => setJob(e.target.value)}
        />
      )}
    </EditScreenLayout>
  );
}
