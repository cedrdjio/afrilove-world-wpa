"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { EditScreenLayout } from "@/features/profile/components/edit-screen-layout";
import { GlassInput } from "@/components/ui/glass-input";
import { Input } from "@/components/ui/input";
import { Choice } from "@/features/onboarding/components/choice";
import { ErrorState } from "@/components/feedback";
import { Spinner } from "@/components/ui/spinner";
import { mapToAppError } from "@/lib/errors";
import {
  GENDER_OPTIONS,
  LOOKING_FOR_OPTIONS,
} from "@/features/onboarding/config";
import { type Gender, type LookingFor } from "@/features/onboarding/types";
import { calculateAge } from "@/features/profile/types";
import {
  useProfileQuery,
  useUpdateProfile,
} from "@/features/profile/hooks/use-profile";

/** Informations de base — port de `EditBasicInfoScreen`. */
export default function EditBasicInfoPage() {
  const router = useRouter();
  const profileQuery = useProfileQuery();
  const updateProfile = useUpdateProfile();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [gender, setGender] = useState<Gender | null>(null);
  const [lookingFor, setLookingFor] = useState<LookingFor | null>(null);
  const [initialized, setInitialized] = useState(false);

  const [today] = useState(() => {
    const t = new Date();
    return {
      max: new Date(t.getFullYear() - 18, t.getMonth(), t.getDate())
        .toISOString()
        .slice(0, 10),
      min: new Date(t.getFullYear() - 100, 0, 1).toISOString().slice(0, 10),
    };
  });

  // Initialisation depuis la query en rendu (et non dans un effet) : pattern
  // React recommandé pour dériver un état local d'une donnée asynchrone.
  if (profileQuery.data && !initialized) {
    const p = profileQuery.data;
    setInitialized(true);
    setFirstName(p.firstName ?? "");
    setLastName(p.lastName ?? "");
    setBirthDate(p.birthDate ?? "");
    setGender((p.gender as Gender | null) ?? null);
    setLookingFor((p.lookingFor as LookingFor | null) ?? null);
  }

  const age = useMemo(
    () => (birthDate ? calculateAge(birthDate) : null),
    [birthDate],
  );

  // Le nom civil est facultatif : le profil vit sur le pseudo (first_name).
  const isValid =
    firstName.trim().length >= 2 &&
    age !== null &&
    age >= 18 &&
    Boolean(gender) &&
    Boolean(lookingFor);

  const handleSave = () => {
    if (!isValid || !gender || !lookingFor) return;
    updateProfile.mutate(
      {
        first_name: firstName.trim(),
        last_name: lastName.trim() || null,
        gender,
        looking_for: lookingFor,
        birth_date: birthDate,
      },
      { onSuccess: () => router.back() },
    );
  };

  return (
    <EditScreenLayout
      title="Informations de base"
      subtitle="Ces informations personnalisent votre expérience."
      onSave={handleSave}
      saveDisabled={!isValid}
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
        <div className="flex flex-col gap-5">
          <GlassInput
            label="Pseudo"
            placeholder="Ton pseudo"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
          />
          <GlassInput
            label="Nom (privé, facultatif)"
            placeholder="Nom"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
          />

          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="birth"
              className="text-muted-foreground text-[11.5px] font-semibold"
            >
              Date de naissance
            </label>
            <Input
              id="birth"
              type="date"
              value={birthDate}
              max={today.max}
              min={today.min}
              onChange={(e) => setBirthDate(e.target.value)}
            />
            {age !== null ? (
              <p
                className={
                  age >= 18
                    ? "text-muted-foreground text-[12px]"
                    : "text-danger text-[12px]"
                }
              >
                {age >= 18
                  ? `Vous avez ${age} ans.`
                  : "Vous devez avoir au moins 18 ans."}
              </p>
            ) : null}
          </div>

          <div className="flex flex-col gap-2">
            <p className="text-muted-foreground text-[11px] font-semibold">
              Je suis
            </p>
            <div className="flex flex-col gap-3">
              {GENDER_OPTIONS.map((o) => (
                <Choice
                  key={o.value}
                  label={o.label}
                  description={o.description}
                  icon={o.icon}
                  selected={gender === o.value}
                  onSelect={() => setGender(o.value)}
                />
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <p className="text-muted-foreground text-[11px] font-semibold">
              Je recherche
            </p>
            <div className="flex flex-col gap-3">
              {LOOKING_FOR_OPTIONS.map((o) => (
                <Choice
                  key={o.value}
                  label={o.label}
                  description={o.description}
                  icon={o.icon}
                  selected={lookingFor === o.value}
                  onSelect={() => setLookingFor(o.value)}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </EditScreenLayout>
  );
}
