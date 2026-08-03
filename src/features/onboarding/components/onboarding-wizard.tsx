"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { AnimatePresence, m } from "framer-motion";
import { ChevronLeft } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { ROUTES } from "@/constants/routes";
import { useHaptics } from "@/hooks/use-haptics";
import { useAuth } from "@/providers/auth-provider";
import { useSupabase } from "@/providers/supabase-provider";
import {
  fetchCountries,
  fetchEducationLevels,
  fetchInterests,
  fetchLanguages,
  fetchRelationshipGoals,
  fetchReligions,
  persistOnboarding,
} from "@/features/onboarding/service";
import { useOnboardingStore } from "@/features/onboarding/store";
import {
  MIN_INTERESTS,
  MIN_LANGUAGES,
  type OnboardingData,
} from "@/features/onboarding/types";
import {
  BioStep,
  DetailsStep,
  GoalLifestyleStep,
  IdentityStep,
  InterestsStep,
  LanguagesStep,
  LocationStep,
  ReviewStep,
} from "./steps";
import { PhotosStep } from "./photos-step";
import { OnboardingProgress } from "./onboarding-progress";

interface StepDef {
  key: string;
  title: string;
  subtitle?: string;
  valid: (d: OnboardingData) => boolean;
}

function isAdult(iso: string | null): boolean {
  if (!iso) return false;
  const eighteen = new Date();
  eighteen.setFullYear(eighteen.getFullYear() - 18);
  return new Date(iso).getTime() <= eighteen.getTime();
}

const STEPS: StepDef[] = [
  {
    key: "identity",
    title: "Vos informations",
    subtitle: "Ces informations personnalisent votre expérience.",
    valid: (d) =>
      d.displayName.trim().length > 0 &&
      isAdult(d.birthDate) &&
      !!d.gender &&
      !!d.lookingFor,
  },
  { key: "location", title: "Où vivez-vous ?", valid: (d) => !!d.country },
  {
    key: "details",
    title: "Quelques détails",
    subtitle: "Tout est optionnel — enrichissez votre profil à votre rythme.",
    valid: () => true,
  },
  {
    key: "goal",
    title: "Objectif & mode de vie",
    valid: (d) =>
      !!d.relationshipGoalId &&
      !!(d.smoking && d.drinking && d.gymHabit && d.hasPets && d.wantsChildren),
  },
  {
    key: "languages",
    title: "Vos langues",
    subtitle: "Quelles langues parlez-vous ?",
    valid: (d) => d.languageIds.length >= MIN_LANGUAGES,
  },
  {
    key: "bio",
    title: "Présentez-vous",
    subtitle: "Quelques mots sincères font toute la différence.",
    valid: (d) => d.bio.trim().length > 0,
  },
  {
    key: "interests",
    title: "Vos centres d’intérêt",
    valid: (d) => d.interestIds.length >= MIN_INTERESTS,
  },
  { key: "review", title: "Presque terminé", valid: () => true },
  { key: "photos", title: "Ajoutez vos photos", valid: () => true },
];

const EASE = [0.23, 1, 0.32, 1] as const;

export function OnboardingWizard() {
  const supabase = useSupabase();
  const router = useRouter();
  const haptic = useHaptics();
  const { user, profile, isLoading, refreshProfile } = useAuth();
  const { data, step, ownerId, reset, patch, setStep, clear } =
    useOnboardingStore();
  const [finishing, setFinishing] = useState(false);
  const [, setPhotoCount] = useState(0);

  const hour = 1000 * 60 * 60;
  const interestsQuery = useQuery({
    queryKey: ["interests"],
    queryFn: () => fetchInterests(supabase),
    staleTime: hour,
  });
  const countriesQuery = useQuery({
    queryKey: ["countries"],
    queryFn: () => fetchCountries(supabase),
    staleTime: hour,
  });
  const languagesQuery = useQuery({
    queryKey: ["languages"],
    queryFn: () => fetchLanguages(supabase),
    staleTime: hour,
  });
  const religionsQuery = useQuery({
    queryKey: ["religions"],
    queryFn: () => fetchReligions(supabase),
    staleTime: hour,
  });
  const educationQuery = useQuery({
    queryKey: ["education_levels"],
    queryFn: () => fetchEducationLevels(supabase),
    staleTime: hour,
  });
  const goalsQuery = useQuery({
    queryKey: ["relationship_goals"],
    queryFn: () => fetchRelationshipGoals(supabase),
    staleTime: hour,
  });

  // Attache le brouillon au compte courant (remise à zéro si autre utilisateur).
  useEffect(() => {
    if (user && ownerId !== user.id) reset(user.id);
  }, [user, ownerId, reset]);

  // Onboarding déjà terminé → app.
  useEffect(() => {
    if (profile?.onboarding_completed) router.replace(ROUTES.discover);
  }, [profile?.onboarding_completed, router]);

  if (isLoading || !user || profile?.onboarding_completed) {
    return (
      <div className="grid min-h-dvh place-items-center">
        <Spinner />
      </div>
    );
  }

  const current = STEPS[step]!;
  const isLast = step === STEPS.length - 1;
  const canProceed = current.valid(data);

  async function next() {
    if (!isLast) {
      haptic("light");
      setStep(step + 1);
      return;
    }
    if (!user) return;
    setFinishing(true);
    try {
      await persistOnboarding(supabase, user.id, data);
      await refreshProfile();
      clear();
      haptic("success");
      router.replace(ROUTES.discover);
    } catch {
      setFinishing(false);
      haptic("error");
      toast.error("Impossible d’enregistrer votre profil. Réessayez.");
    }
  }

  function back() {
    if (step === 0) {
      router.push(ROUTES.home);
      return;
    }
    haptic("light");
    setStep(step - 1);
  }

  const catalogsPending =
    (current.key === "interests" && interestsQuery.isPending) ||
    (current.key === "location" && countriesQuery.isPending) ||
    (current.key === "languages" && languagesQuery.isPending) ||
    (current.key === "details" &&
      (religionsQuery.isPending || educationQuery.isPending)) ||
    (current.key === "goal" && goalsQuery.isPending);

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col px-6 pt-4 pb-6">
      <header className="flex items-center gap-3">
        <button
          type="button"
          onClick={back}
          aria-label="Retour"
          className="text-muted-foreground hover:text-foreground -ml-2 grid size-10 place-items-center rounded-full transition-colors"
        >
          <ChevronLeft className="size-6" aria-hidden />
        </button>
        <OnboardingProgress current={step} total={STEPS.length} />
      </header>

      <div className="mt-8 flex flex-1 flex-col overflow-hidden">
        <h1 className="text-[1.6rem] leading-tight font-extrabold tracking-tight text-balance">
          {current.title}
        </h1>
        {current.subtitle ? (
          <p className="text-muted-foreground mt-2 text-[0.95rem] leading-relaxed">
            {current.subtitle}
          </p>
        ) : null}

        <div className="-mx-1 mt-7 flex-1 overflow-y-auto px-1">
          <AnimatePresence mode="wait">
            <m.div
              key={current.key}
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -16 }}
              transition={{ duration: 0.28, ease: EASE }}
            >
              {catalogsPending ? (
                <div className="grid place-items-center py-16">
                  <Spinner />
                </div>
              ) : (
                <StepBody
                  stepKey={current.key}
                  data={data}
                  patch={patch}
                  interests={interestsQuery.data ?? []}
                  countries={countriesQuery.data ?? []}
                  languages={languagesQuery.data ?? []}
                  religions={religionsQuery.data ?? []}
                  educationLevels={educationQuery.data ?? []}
                  relationshipGoals={goalsQuery.data ?? []}
                  onPhotoCount={setPhotoCount}
                />
              )}
            </m.div>
          </AnimatePresence>
        </div>
      </div>

      <div className="pt-4">
        <Button
          size="lg"
          block
          disabled={!canProceed || finishing}
          onClick={next}
        >
          {finishing
            ? "Enregistrement…"
            : isLast
              ? "Terminer & découvrir"
              : "Continuer"}
        </Button>
      </div>
    </div>
  );
}

function StepBody({
  stepKey,
  data,
  patch,
  interests,
  countries,
  languages,
  religions,
  educationLevels,
  relationshipGoals,
  onPhotoCount,
}: {
  stepKey: string;
  data: OnboardingData;
  patch: (p: Partial<OnboardingData>) => void;
  interests: Awaited<ReturnType<typeof fetchInterests>>;
  countries: Awaited<ReturnType<typeof fetchCountries>>;
  languages: Awaited<ReturnType<typeof fetchLanguages>>;
  religions: Awaited<ReturnType<typeof fetchReligions>>;
  educationLevels: Awaited<ReturnType<typeof fetchEducationLevels>>;
  relationshipGoals: Awaited<ReturnType<typeof fetchRelationshipGoals>>;
  onPhotoCount: (n: number) => void;
}) {
  switch (stepKey) {
    case "identity":
      return <IdentityStep data={data} patch={patch} />;
    case "location":
      return <LocationStep data={data} patch={patch} countries={countries} />;
    case "details":
      return (
        <DetailsStep
          data={data}
          patch={patch}
          religions={religions}
          educationLevels={educationLevels}
        />
      );
    case "goal":
      return (
        <GoalLifestyleStep
          data={data}
          patch={patch}
          relationshipGoals={relationshipGoals}
        />
      );
    case "languages":
      return <LanguagesStep data={data} patch={patch} languages={languages} />;
    case "bio":
      return <BioStep data={data} patch={patch} />;
    case "interests":
      return <InterestsStep data={data} patch={patch} interests={interests} />;
    case "review":
      return (
        <ReviewStep
          data={data}
          patch={patch}
          religions={religions}
          educationLevels={educationLevels}
          relationshipGoals={relationshipGoals}
          languages={languages}
        />
      );
    case "photos":
      return <PhotosStep onCountChange={onPhotoCount} />;
    default:
      return null;
  }
}
