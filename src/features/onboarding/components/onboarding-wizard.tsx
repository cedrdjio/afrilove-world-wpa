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
  BirthDateStep,
  ChildrenStep,
  DrinkingStep,
  EducationStep,
  GenderStep,
  GoalStep,
  GymStep,
  HeightStep,
  InterestsStep,
  LanguagesStep,
  LocationStep,
  LookingForStep,
  NameStep,
  PetsStep,
  ProfessionStep,
  ReligionStep,
  ReviewStep,
  SmokingStep,
} from "./steps";
import { PhotosStep } from "./photos-step";
import { OnboardingProgress } from "./onboarding-progress";

interface StepDef {
  key: string;
  title: string;
  subtitle?: string;
  /** Étape facultative : affiche un lien « Passer ». */
  optional?: boolean;
  valid: (d: OnboardingData) => boolean;
}

function isAdult(iso: string | null): boolean {
  if (!iso) return false;
  const eighteen = new Date();
  eighteen.setFullYear(eighteen.getFullYear() - 18);
  return new Date(iso).getTime() <= eighteen.getTime();
}

// Un écran = une seule question. Le parcours est volontairement découpé pour
// ne jamais présenter plusieurs sujets sur un même écran (pattern Hinge/Bumble).
const STEPS: StepDef[] = [
  {
    key: "name",
    title: "Comment vous appeler ?",
    subtitle: "Votre pseudo sera visible sur votre profil.",
    valid: (d) => d.displayName.trim().length > 0,
  },
  {
    key: "birthdate",
    title: "Votre date de naissance",
    subtitle: "Vous devez avoir au moins 18 ans. Seul votre âge sera affiché.",
    valid: (d) => isAdult(d.birthDate),
  },
  { key: "gender", title: "Vous êtes…", valid: (d) => !!d.gender },
  {
    key: "lookingFor",
    title: "Vous recherchez…",
    subtitle: "Les profils que vous verrez dans la découverte.",
    valid: (d) => !!d.lookingFor,
  },
  {
    key: "location",
    title: "Où vivez-vous ?",
    valid: (d) => !!d.country,
  },
  {
    key: "height",
    title: "Votre taille",
    subtitle: "Optionnel — vous pourrez l’ajouter plus tard.",
    optional: true,
    valid: () => true,
  },
  {
    key: "profession",
    title: "Votre profession",
    subtitle: "Optionnel.",
    optional: true,
    valid: () => true,
  },
  {
    key: "education",
    title: "Votre niveau d’études",
    subtitle: "Optionnel.",
    optional: true,
    valid: () => true,
  },
  {
    key: "religion",
    title: "Votre religion",
    subtitle: "Optionnel.",
    optional: true,
    valid: () => true,
  },
  {
    key: "goal",
    title: "Quel type de relation ?",
    subtitle: "Ce que vous espérez trouver ici.",
    valid: (d) => !!d.relationshipGoalId,
  },
  { key: "smoking", title: "Tabac ?", valid: (d) => !!d.smoking },
  { key: "drinking", title: "Alcool ?", valid: (d) => !!d.drinking },
  { key: "gym", title: "Sport ?", valid: (d) => !!d.gymHabit },
  { key: "pets", title: "Animaux ?", valid: (d) => !!d.hasPets },
  { key: "children", title: "Enfants ?", valid: (d) => !!d.wantsChildren },
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
    (current.key === "education" && educationQuery.isPending) ||
    (current.key === "religion" && religionsQuery.isPending) ||
    (current.key === "goal" && goalsQuery.isPending);

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col overflow-x-hidden px-6 pt-4 pb-6">
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

        <div className="mt-7 flex-1 overflow-x-hidden overflow-y-auto px-1">
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

      <div className="flex flex-col gap-3 pt-4">
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
        {current.optional && !isLast ? (
          <button
            type="button"
            onClick={next}
            className="text-subtle-foreground hover:text-foreground text-center text-sm font-semibold transition-colors"
          >
            Passer cette étape
          </button>
        ) : null}
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
    case "name":
      return <NameStep data={data} patch={patch} />;
    case "birthdate":
      return <BirthDateStep data={data} patch={patch} />;
    case "gender":
      return <GenderStep data={data} patch={patch} />;
    case "lookingFor":
      return <LookingForStep data={data} patch={patch} />;
    case "location":
      return <LocationStep data={data} patch={patch} countries={countries} />;
    case "height":
      return <HeightStep data={data} patch={patch} />;
    case "profession":
      return <ProfessionStep data={data} patch={patch} />;
    case "education":
      return (
        <EducationStep
          data={data}
          patch={patch}
          educationLevels={educationLevels}
        />
      );
    case "religion":
      return <ReligionStep data={data} patch={patch} religions={religions} />;
    case "goal":
      return (
        <GoalStep
          data={data}
          patch={patch}
          relationshipGoals={relationshipGoals}
        />
      );
    case "smoking":
      return <SmokingStep data={data} patch={patch} />;
    case "drinking":
      return <DrinkingStep data={data} patch={patch} />;
    case "gym":
      return <GymStep data={data} patch={patch} />;
    case "pets":
      return <PetsStep data={data} patch={patch} />;
    case "children":
      return <ChildrenStep data={data} patch={patch} />;
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
