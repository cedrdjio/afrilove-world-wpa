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
  fetchInterests,
  persistOnboarding,
} from "@/features/onboarding/service";
import { useOnboardingStore } from "@/features/onboarding/store";
import {
  MIN_INTERESTS,
  type OnboardingData,
} from "@/features/onboarding/types";
import {
  BioStep,
  BirthDateStep,
  GenderStep,
  InterestsStep,
  LifestyleStep,
  LocationStep,
  LookingForStep,
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
  { key: "gender", title: "Je suis…", valid: (d) => !!d.gender },
  { key: "lookingFor", title: "Je recherche…", valid: (d) => !!d.lookingFor },
  {
    key: "birthDate",
    title: "Votre date de naissance",
    subtitle: "Pour proposer des profils de votre âge.",
    valid: (d) => isAdult(d.birthDate),
  },
  { key: "location", title: "Où vivez-vous ?", valid: (d) => !!d.country },
  {
    key: "bio",
    title: "Présentez-vous",
    subtitle: "Quelques mots sincères font toute la différence.",
    valid: (d) => d.bio.trim().length > 0,
  },
  {
    key: "lifestyle",
    title: "Votre style de vie",
    valid: (d) =>
      !!(d.smoking && d.drinking && d.gymHabit && d.hasPets && d.wantsChildren),
  },
  {
    key: "interests",
    title: "Vos centres d’intérêt",
    valid: (d) => d.interestIds.length >= MIN_INTERESTS,
  },
  { key: "review", title: "Presque terminé 🎉", valid: () => true },
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

  const interestsQuery = useQuery({
    queryKey: ["interests"],
    queryFn: () => fetchInterests(supabase),
    staleTime: 1000 * 60 * 60,
  });
  const countriesQuery = useQuery({
    queryKey: ["countries"],
    queryFn: () => fetchCountries(supabase),
    staleTime: 1000 * 60 * 60,
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
    // Dernière étape : on enregistre le profil et on ouvre l'app.
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
    (current.key === "location" && countriesQuery.isPending);

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
  onPhotoCount,
}: {
  stepKey: string;
  data: OnboardingData;
  patch: (p: Partial<OnboardingData>) => void;
  interests: Awaited<ReturnType<typeof fetchInterests>>;
  countries: Awaited<ReturnType<typeof fetchCountries>>;
  onPhotoCount: (n: number) => void;
}) {
  switch (stepKey) {
    case "gender":
      return <GenderStep data={data} patch={patch} />;
    case "lookingFor":
      return <LookingForStep data={data} patch={patch} />;
    case "birthDate":
      return <BirthDateStep data={data} patch={patch} />;
    case "location":
      return <LocationStep data={data} patch={patch} countries={countries} />;
    case "bio":
      return <BioStep data={data} patch={patch} />;
    case "lifestyle":
      return <LifestyleStep data={data} patch={patch} />;
    case "interests":
      return <InterestsStep data={data} patch={patch} interests={interests} />;
    case "review":
      return <ReviewStep data={data} patch={patch} />;
    case "photos":
      return <PhotosStep onCountChange={onPhotoCount} />;
    default:
      return null;
  }
}
