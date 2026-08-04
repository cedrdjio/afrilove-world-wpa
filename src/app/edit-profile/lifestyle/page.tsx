"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { EditScreenLayout } from "@/features/profile/components/edit-screen-layout";
import { Chip } from "@/components/ui/chip";
import { ErrorState, Skeleton } from "@/components/feedback";
import { mapToAppError } from "@/lib/errors";
import {
  useProfileQuery,
  useUpdateProfile,
} from "@/features/profile/hooks/use-profile";
import {
  useLifestyleCategories,
  useRelationshipGoalsQuery,
} from "@/features/profile/hooks/use-reference-data";
import { type OnboardingData } from "@/features/onboarding/types";

type LifestyleKey =
  "smoking" | "drinking" | "gymHabit" | "hasPets" | "wantsChildren";

type Choices = Record<LifestyleKey, string | null>;
const EMPTY: Choices = {
  smoking: null,
  drinking: null,
  gymHabit: null,
  hasPets: null,
  wantsChildren: null,
};

/** Édition du mode de vie + objectif relationnel — port de `EditLifestyleScreen`. */
export default function EditLifestylePage() {
  const router = useRouter();
  const profileQuery = useProfileQuery();
  const { categories, isLoading } = useLifestyleCategories();
  const goalsQuery = useRelationshipGoalsQuery();
  const updateProfile = useUpdateProfile();
  const [choices, setChoices] = useState<Choices>(EMPTY);
  const [relationshipGoalId, setRelationshipGoalId] = useState<string | null>(
    null,
  );
  const [initialized, setInitialized] = useState(false);

  if (profileQuery.data && !initialized) {
    setInitialized(true);
    setChoices({
      smoking: profileQuery.data.smoking,
      drinking: profileQuery.data.drinking,
      gymHabit: profileQuery.data.gymHabit,
      hasPets: profileQuery.data.hasPets,
      wantsChildren: profileQuery.data.wantsChildren,
    });
    setRelationshipGoalId(profileQuery.data.relationshipGoalId);
  }

  const complete = Object.values(choices).every(Boolean);

  const handleSave = () =>
    updateProfile.mutate(
      {
        smoking: choices.smoking as OnboardingData["smoking"],
        drinking: choices.drinking as OnboardingData["drinking"],
        gym_habit: choices.gymHabit as OnboardingData["gymHabit"],
        has_pets: choices.hasPets as OnboardingData["hasPets"],
        wants_children:
          choices.wantsChildren as OnboardingData["wantsChildren"],
        relationship_goal_id: relationshipGoalId,
      },
      { onSuccess: () => router.back() },
    );

  return (
    <EditScreenLayout
      title="Mode de vie"
      onSave={handleSave}
      saveDisabled={!complete}
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

      {profileQuery.isPending || isLoading ? (
        <div className="flex flex-col gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} width="100%" height={70} radius={16} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col gap-5">
          {categories.map((category) => (
            <div key={category.key} className="flex flex-col gap-2">
              <p className="text-foreground/40 font-display text-[11px] tracking-wide uppercase">
                {category.label}
              </p>
              <div className="flex flex-wrap gap-2">
                {category.options.map((option) => (
                  <Chip
                    key={option.value}
                    label={option.label}
                    selected={choices[category.key] === option.value}
                    onClick={() =>
                      setChoices((prev) => ({
                        ...prev,
                        [category.key]: option.value,
                      }))
                    }
                  />
                ))}
              </div>
            </div>
          ))}

          <div className="flex flex-col gap-2">
            <p className="text-foreground/40 font-display text-[11px] tracking-wide uppercase">
              Objectif relationnel
            </p>
            <div className="flex flex-wrap gap-2">
              {goalsQuery.data?.map((goal) => (
                <Chip
                  key={goal.id}
                  label={goal.label}
                  selected={relationshipGoalId === goal.id}
                  onClick={() => setRelationshipGoalId(goal.id)}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </EditScreenLayout>
  );
}
