"use client";

import { useRouter } from "next/navigation";
import { ArrowRight, Check, Plus } from "lucide-react";

import { ScreenBackground } from "@/components/layout/screen-background";
import { GlowOrb } from "@/components/layout/glow-orb";
import { ScreenHeader } from "@/components/layout/screen-header";
import { GradientButton } from "@/components/ui/gradient-button";
import { FullScreenLoader } from "@/components/feedback";
import { ROUTES } from "@/constants/routes";
import { useProfileQuery } from "@/features/profile/hooks/use-profile";
import {
  computeProfileCompletion,
  type ProfileCompletionStatus,
} from "@/features/profile/types";

const RADIUS = 48;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

const CHECKLIST: {
  key: keyof ProfileCompletionStatus["missing"];
  title: string;
  subtitle: string;
  href: string;
}[] = [
  {
    key: "bio",
    title: "Bio / Description",
    subtitle: "Quelques mots sur vous",
    href: "/edit-profile/bio",
  },
  {
    key: "photos",
    title: "2 photos minimum",
    subtitle: "Montrez votre plus beau profil",
    href: "/edit-profile/photos",
  },
  {
    key: "interests",
    title: "3 centres d’intérêt minimum",
    subtitle: "Ce qui vous passionne",
    href: "/edit-profile/interests",
  },
  {
    key: "lifestyle",
    title: "Mode de vie",
    subtitle: "Tabac, alcool, sport, animaux, enfants",
    href: "/edit-profile/lifestyle",
  },
  {
    key: "gender",
    title: "Genre",
    subtitle: "Comment vous identifiez-vous",
    href: "/edit-profile/basic-info",
  },
  {
    key: "lookingFor",
    title: "Vous recherchez",
    subtitle: "Qui souhaitez-vous rencontrer",
    href: "/edit-profile/basic-info",
  },
  {
    key: "birthDate",
    title: "Date de naissance",
    subtitle: "Votre âge sur le profil",
    href: "/edit-profile/basic-info",
  },
];

/** Complétion de profil — port de `ProfileCompletionScreen`. */
export default function ProfileCompletionPage() {
  const router = useRouter();
  const profileQuery = useProfileQuery();

  if (!profileQuery.data) return <FullScreenLoader />;

  const status = computeProfileCompletion(profileQuery.data);
  const done = CHECKLIST.filter((item) => !status.missing[item.key]);
  const todo = CHECKLIST.filter((item) => status.missing[item.key]);
  const percent = Math.round((done.length / CHECKLIST.length) * 100);
  const dashOffset = CIRCUMFERENCE * (1 - percent / 100);
  const nextHref = todo[0]?.href ?? "/edit-profile";

  return (
    <div className="relative flex min-h-dvh flex-col">
      <ScreenBackground theme="cream">
        <GlowOrb
          size={230}
          color="rgba(155,126,222,0.09)"
          bottom={-40}
          right={-40}
          duration={10}
        />
      </ScreenBackground>

      <div className="relative z-10 mx-auto w-full max-w-md px-6 pt-6 pb-8">
        <ScreenHeader />

        <div className="mb-6 flex flex-col items-center">
          <div className="relative mb-3.5 grid size-[116px] place-items-center">
            <svg
              width={116}
              height={116}
              viewBox="0 0 116 116"
              className="absolute -rotate-90"
            >
              <defs>
                <linearGradient id="pgr" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#8B69D6" />
                  <stop offset="100%" stopColor="#5B3E9E" />
                </linearGradient>
              </defs>
              <circle
                cx={58}
                cy={58}
                r={RADIUS}
                stroke="rgba(62,53,82,0.07)"
                strokeWidth={9}
                fill="none"
              />
              <circle
                cx={58}
                cy={58}
                r={RADIUS}
                stroke="url(#pgr)"
                strokeWidth={9}
                fill="none"
                strokeDasharray={CIRCUMFERENCE}
                strokeDashoffset={dashOffset}
                strokeLinecap="round"
                style={{ transition: "stroke-dashoffset 0.9s ease" }}
              />
            </svg>
            <div className="text-center">
              <p className="font-display text-foreground text-[30px]">
                {percent}%
              </p>
              <p className="text-muted-foreground text-[10px] font-medium">
                complété
              </p>
            </div>
          </div>
          <h1 className="font-display text-foreground mb-1.5 text-center text-[26px] leading-[1.15]">
            {status.isComplete ? "Profil complet ! " : "Complétez pour "}
            <span className="text-primary">
              {status.isComplete ? "Bravo !" : "plus de matches !"}
            </span>
          </h1>
          <p className="text-muted-foreground text-center text-[12px] leading-[18px]">
            {status.isComplete
              ? "Votre profil est prêt à être découvert par la communauté."
              : "Les profils complets reçoivent 3× plus de likes."}
          </p>
        </div>

        <div className="mb-3.5 flex flex-col gap-2.5">
          {done.map((item) => (
            <div
              key={item.key}
              className="border-border/70 bg-card/45 flex items-center gap-3 rounded-[17px] border px-4 py-3.5"
            >
              <span className="gradient-signature grid size-8 place-items-center rounded-[10px]">
                <Check
                  className="size-3.5 text-white"
                  strokeWidth={3}
                  aria-hidden
                />
              </span>
              <span className="text-foreground flex-1 text-[13px] font-semibold">
                {item.title}
              </span>
              <span className="text-primary/60 flex items-center gap-1 text-[10px] font-medium">
                Fait
                <Check className="size-2.5" strokeWidth={3} aria-hidden />
              </span>
            </div>
          ))}

          {todo.map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => router.push(item.href)}
              className="border-primary/[0.22] bg-card/55 flex items-center gap-3 rounded-[17px] border px-4 py-3.5 text-left"
            >
              <span className="border-primary/30 bg-primary/10 grid size-8 place-items-center rounded-[10px] border border-dashed">
                <Plus className="text-primary size-3.5" aria-hidden />
              </span>
              <span className="flex-1">
                <span className="text-foreground block text-[13px] font-semibold">
                  {item.title}
                </span>
                <span className="text-muted-foreground block text-[11px]">
                  {item.subtitle}
                </span>
              </span>
            </button>
          ))}
        </div>

        {status.isComplete ? (
          <GradientButton
            label="Découvrir l’application"
            onClick={() => router.replace(ROUTES.discover)}
          />
        ) : (
          <GradientButton
            label="Compléter maintenant"
            icon={<ArrowRight className="size-3.5" aria-hidden />}
            onClick={() => router.push(nextHref)}
          />
        )}
      </div>
    </div>
  );
}
