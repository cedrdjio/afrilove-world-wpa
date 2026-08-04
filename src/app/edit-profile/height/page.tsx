"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Minus, Plus } from "lucide-react";

import { EditScreenLayout } from "@/features/profile/components/edit-screen-layout";
import { ErrorState } from "@/components/feedback";
import { Spinner } from "@/components/ui/spinner";
import { mapToAppError } from "@/lib/errors";
import {
  useProfileQuery,
  useUpdateProfile,
} from "@/features/profile/hooks/use-profile";

const MIN = 140;
const MAX = 220;

/** Édition de la taille — port de `EditHeightScreen`. */
export default function EditHeightPage() {
  const router = useRouter();
  const profileQuery = useProfileQuery();
  const updateProfile = useUpdateProfile();
  const [height, setHeight] = useState(168);
  const [initialized, setInitialized] = useState(false);

  if (profileQuery.data && !initialized) {
    setInitialized(true);
    setHeight(profileQuery.data.heightCm ?? 168);
  }

  const handleSave = () =>
    updateProfile.mutate(
      { height_cm: height },
      { onSuccess: () => router.back() },
    );

  return (
    <EditScreenLayout
      title="Taille"
      subtitle="Ajustez votre taille en centimètres."
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

      <div className="grid flex-1 place-items-center">
        {profileQuery.isPending ? (
          <Spinner />
        ) : (
          <div className="flex items-center gap-8">
            <button
              type="button"
              onClick={() => setHeight((h) => Math.max(MIN, h - 1))}
              aria-label="Diminuer"
              className="border-border/60 bg-card/60 text-foreground grid size-[52px] place-items-center rounded-[22px] border"
            >
              <Minus className="size-5" aria-hidden />
            </button>
            <div className="text-center">
              <p className="font-display text-foreground text-[56px] leading-[56px]">
                {height}
              </p>
              <p className="text-muted-foreground text-[11px] font-semibold">
                centimètres
              </p>
            </div>
            <button
              type="button"
              onClick={() => setHeight((h) => Math.min(MAX, h + 1))}
              aria-label="Augmenter"
              className="border-border/60 bg-card/60 text-foreground grid size-[52px] place-items-center rounded-[22px] border"
            >
              <Plus className="size-5" aria-hidden />
            </button>
          </div>
        )}
      </div>
    </EditScreenLayout>
  );
}
