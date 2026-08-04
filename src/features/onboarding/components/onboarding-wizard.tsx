"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { AnimatePresence, m } from "framer-motion";
import { ChevronLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { ROUTES } from "@/constants/routes";
import { mapToAppError, type AppError } from "@/lib/errors";
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
  MIN_AGE,
  MIN_BIO,
  MIN_INTERESTS,
  MIN_NAME,
  MIN_PHOTOS,
  type OnboardingData,
} from "@/features/onboarding/types";
import {
  BioStep,
  BirthDateStep,
  GenderStep,
  InterestsStep,
  LifestyleStep,
  LookingForStep,
} from "./steps";
import { NameStep } from "./name-step";
import { PhotosStep } from "./photos-step";
import { LocationStep } from "./location-step";
import { NotificationStep } from "./notification-step";
import { CarouselStep } from "./carousel-step";
import { FinishStep } from "./finish-step";
import { OnboardingProgress } from "./onboarding-progress";

function isAdult(iso: string | null): boolean {
  if (!iso) return false;
  const threshold = new Date();
  threshold.setFullYear(threshold.getFullYear() - MIN_AGE);
  return new Date(iso).getTime() <= threshold.getTime();
}

type StepKind = "carousel" | "content" | "permission" | "finish";

interface StepDef {
  id: string;
  kind: StepKind;
  title?: string;
  subtitle?: string;
  valid?: (d: OnboardingData) => boolean;
}

/**
 * Ordre UX fidèle au mobile : carousel → 8 étapes de contenu (numérotées) →
 * 2 permissions (skippables) → écran de fin. Les étapes de contenu ont une
 * règle de validation stricte (parité des `isValid` mobiles) ; carousel,
 * permissions et fin gèrent leurs propres actions.
 */
const STEPS: StepDef[] = [
  { id: "carousel", kind: "carousel" },
  {
    id: "name",
    kind: "content",
    title: "Ton identité",
    subtitle:
      "Ton prénom sera visible par les autres membres. Ton nom reste privé.",
    valid: (d) =>
      d.firstName.trim().length >= MIN_NAME &&
      d.lastName.trim().length >= MIN_NAME,
  },
  {
    id: "gender",
    kind: "content",
    title: "Je suis…",
    subtitle: "Personnalisez votre expérience.",
    valid: (d) => !!d.gender,
  },
  {
    id: "birthDate",
    kind: "content",
    title: "Votre date de naissance",
    subtitle: "Vous devez avoir au moins 18 ans pour utiliser AfriLove World.",
    valid: (d) => isAdult(d.birthDate),
  },
  {
    id: "lookingFor",
    kind: "content",
    title: "Je recherche…",
    subtitle: "Qui souhaitez-vous rencontrer sur AfriLove World ?",
    valid: (d) => !!d.lookingFor,
  },
  {
    id: "interests",
    kind: "content",
    title: "Vos passions",
    subtitle: `Sélectionnez au moins ${MIN_INTERESTS} centres d’intérêt.`,
    valid: (d) => d.interestIds.length >= MIN_INTERESTS,
  },
  {
    id: "bio",
    kind: "content",
    title: "Parlez-nous de vous",
    subtitle: "Une bonne bio attire 3× plus de matches. Soyez authentique.",
    valid: (d) => d.bio.trim().length >= MIN_BIO,
  },
  {
    id: "photos",
    kind: "content",
    title: "Vos photos",
    subtitle: "Soyez authentique. 3 photos = 4× plus de visibilité.",
    valid: (d) => d.photos.length >= MIN_PHOTOS,
  },
  {
    id: "lifestyle",
    kind: "content",
    title: "Votre mode de vie",
    subtitle: "Aidez-nous à mieux vous faire matcher.",
    valid: (d) =>
      !!(d.smoking && d.drinking && d.gymHabit && d.hasPets && d.wantsChildren),
  },
  { id: "location", kind: "permission" },
  { id: "notifications", kind: "permission" },
  { id: "finish", kind: "finish" },
];

const CONTENT_STEP_IDS = STEPS.filter((s) => s.kind === "content").map(
  (s) => s.id,
);
const EASE = [0.23, 1, 0.32, 1] as const;

export function OnboardingWizard() {
  const supabase = useSupabase();
  const router = useRouter();
  const haptic = useHaptics();
  const { user, profile, isLoading, refreshProfile } = useAuth();
  const { data, step, ownerId, reset, patch, setStep, clear } =
    useOnboardingStore();
  const [finishing, setFinishing] = useState(false);
  const [finishError, setFinishError] = useState<AppError | null>(null);

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

  const current = STEPS[Math.min(step, STEPS.length - 1)]!;
  const isContent = current.kind === "content";
  const canProceed = current.valid ? current.valid(data) : true;

  function goNext() {
    haptic("light");
    setStep(Math.min(step + 1, STEPS.length - 1));
  }

  function back() {
    if (step === 0) {
      router.push(ROUTES.home);
      return;
    }
    haptic("light");
    setStep(step - 1);
  }

  async function finish() {
    if (!user) return;
    setFinishing(true);
    setFinishError(null);
    try {
      await persistOnboarding(supabase, user.id, data);
      await refreshProfile();
      clear();
      haptic("success");
      // Parité mobile (FinishScreen) : on passe par la résolution, qui relit
      // le profil (profile_completed recalculé par trigger) et route ensuite.
      router.replace(ROUTES.authResolving);
    } catch (error) {
      setFinishing(false);
      setFinishError(mapToAppError(error));
      haptic("error");
    }
  }

  const catalogPending =
    (current.id === "interests" && interestsQuery.isPending) ||
    (current.id === "location" && countriesQuery.isPending);

  const contentIndex = CONTENT_STEP_IDS.indexOf(current.id);
  const showBack = current.kind !== "finish";

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col px-6 pt-4 pb-6">
      <header className="flex h-10 items-center gap-3">
        {showBack ? (
          <button
            type="button"
            onClick={back}
            aria-label="Retour"
            className="text-muted-foreground hover:text-foreground -ml-2 grid size-10 shrink-0 place-items-center rounded-full transition-colors"
          >
            <ChevronLeft className="size-6" aria-hidden />
          </button>
        ) : null}
        {isContent && contentIndex >= 0 ? (
          <OnboardingProgress
            current={contentIndex}
            total={CONTENT_STEP_IDS.length}
          />
        ) : null}
      </header>

      <div className="mt-6 flex flex-1 flex-col overflow-hidden">
        {isContent ? (
          <>
            <h1 className="text-[1.6rem] leading-tight font-extrabold tracking-tight text-balance">
              {current.title}
            </h1>
            {current.subtitle ? (
              <p className="text-muted-foreground mt-2 text-[0.95rem] leading-relaxed">
                {current.subtitle}
              </p>
            ) : null}
          </>
        ) : null}

        <div className="-mx-1 mt-7 flex flex-1 flex-col overflow-y-auto px-1">
          <AnimatePresence mode="wait">
            <m.div
              key={current.id}
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -16 }}
              transition={{ duration: 0.28, ease: EASE }}
              className="flex flex-1 flex-col"
            >
              {catalogPending ? (
                <div className="grid flex-1 place-items-center py-16">
                  <Spinner />
                </div>
              ) : (
                renderStepBody()
              )}
            </m.div>
          </AnimatePresence>
        </div>
      </div>

      {isContent ? (
        <div className="pt-4">
          <Button size="lg" block disabled={!canProceed} onClick={goNext}>
            Continuer
          </Button>
        </div>
      ) : null}
    </div>
  );

  function renderStepBody() {
    switch (current.id) {
      case "carousel":
        return <CarouselStep onStart={goNext} />;
      case "name":
        return <NameStep data={data} patch={patch} />;
      case "gender":
        return <GenderStep data={data} patch={patch} />;
      case "birthDate":
        return <BirthDateStep data={data} patch={patch} />;
      case "lookingFor":
        return <LookingForStep data={data} patch={patch} />;
      case "interests":
        return (
          <InterestsStep
            data={data}
            patch={patch}
            interests={interestsQuery.data ?? []}
          />
        );
      case "bio":
        return <BioStep data={data} patch={patch} />;
      case "photos":
        return (
          <PhotosStep
            photos={data.photos}
            onChange={(photos) => patch({ photos })}
          />
        );
      case "lifestyle":
        return <LifestyleStep data={data} patch={patch} />;
      case "location":
        return (
          <LocationStep
            data={data}
            patch={patch}
            countries={countriesQuery.data ?? []}
            onDone={goNext}
          />
        );
      case "notifications":
        return <NotificationStep onDone={goNext} />;
      case "finish":
        return (
          <FinishStep
            firstName={data.firstName.trim()}
            finishing={finishing}
            error={finishError}
            onFinish={() => void finish()}
          />
        );
      default:
        return null;
    }
  }
}
