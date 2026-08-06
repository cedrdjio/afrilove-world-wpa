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
  LookingForStep,
  NameStep,
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

// Parcours en 8 écrans groupés (parité jalon). Les champs secondaires
// (localisation, taille, métier, études, religion, objectif, langues) ne sont
// plus demandés à l'inscription : ils s'ajoutent ensuite depuis « Modifier mon
// profil ». Le mode de vie regroupe ses 5 questions sur un seul écran.
const STEPS: StepDef[] = [
  {
    key: "name",
    title: "Votre identité",
    subtitle:
      "Votre prénom sera visible par les autres membres. Votre nom reste privé et sert à vérifier votre identité.",
    valid: (d) =>
      d.displayName.trim().length >= 2 && d.privateName.trim().length >= 2,
  },
  { key: "gender", title: "Vous êtes…", valid: (d) => !!d.gender },
  {
    key: "birthdate",
    title: "Votre date de naissance",
    subtitle: "Vous devez avoir au moins 18 ans. Seul votre âge sera affiché.",
    valid: (d) => isAdult(d.birthDate),
  },
  {
    key: "lookingFor",
    title: "Vous recherchez…",
    subtitle: "Les profils que vous verrez dans la découverte.",
    valid: (d) => !!d.lookingFor,
  },
  {
    key: "interests",
    title: "Vos centres d’intérêt",
    subtitle: `Sélectionnez au moins ${MIN_INTERESTS} passions.`,
    valid: (d) => d.interestIds.length >= MIN_INTERESTS,
  },
  {
    key: "bio",
    title: "Présentez-vous",
    subtitle: "Quelques mots sincères font toute la différence.",
    valid: (d) => d.bio.trim().length > 0,
  },
  {
    key: "photos",
    title: "Ajoutez vos photos",
    subtitle: "Une première photo donne 4× plus de visibilité.",
    valid: () => true,
  },
  {
    key: "lifestyle",
    title: "Votre mode de vie",
    subtitle: "Pour des rencontres qui vous ressemblent.",
    valid: (d) =>
      !!d.smoking &&
      !!d.drinking &&
      !!d.gymHabit &&
      !!d.hasPets &&
      !!d.wantsChildren,
  },
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

  // Attache le brouillon au compte courant (remise à zéro si autre utilisateur).
  useEffect(() => {
    if (user && ownerId !== user.id) reset(user.id);
  }, [user, ownerId, reset]);

  // Pré-remplit prénom/nom depuis les métadonnées d'inscription (saisie manuelle
  // ou Google), pour ne pas les redemander. On ne touche jamais à une saisie
  // déjà présente. `patch` (store zustand) n'est pas un setState React.
  useEffect(() => {
    if (!user) return;
    const meta = (user.user_metadata ?? {}) as Record<string, unknown>;
    const str = (v: unknown) => (typeof v === "string" ? v.trim() : "");
    const first =
      str(meta.first_name) ||
      str(meta.given_name) ||
      str(meta.name).split(" ")[0] ||
      "";
    const last = str(meta.last_name) || str(meta.family_name);
    const fill: Partial<OnboardingData> = {};
    if (first && !data.displayName) fill.displayName = first;
    if (last && !data.privateName) fill.privateName = last;
    if (Object.keys(fill).length > 0) patch(fill);
  }, [user, data.displayName, data.privateName, patch]);

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
    current.key === "interests" && interestsQuery.isPending;

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
  onPhotoCount,
}: {
  stepKey: string;
  data: OnboardingData;
  patch: (p: Partial<OnboardingData>) => void;
  interests: Awaited<ReturnType<typeof fetchInterests>>;
  onPhotoCount: (n: number) => void;
}) {
  switch (stepKey) {
    case "name":
      return <NameStep data={data} patch={patch} />;
    case "gender":
      return <GenderStep data={data} patch={patch} />;
    case "birthdate":
      return <BirthDateStep data={data} patch={patch} />;
    case "lookingFor":
      return <LookingForStep data={data} patch={patch} />;
    case "interests":
      return <InterestsStep data={data} patch={patch} interests={interests} />;
    case "bio":
      return <BioStep data={data} patch={patch} />;
    case "photos":
      return <PhotosStep onCountChange={onPhotoCount} />;
    case "lifestyle":
      return <LifestyleStep data={data} patch={patch} />;
    default:
      return null;
  }
}
