"use client";

import { useRouter } from "next/navigation";
import {
  Heart,
  Eye,
  Star,
  Zap,
  Globe2,
  ShieldCheck,
  ArrowLeft,
} from "lucide-react";

import { ScreenBackground } from "@/components/layout/screen-background";
import { GlowOrb } from "@/components/layout/glow-orb";
import { GradientButton } from "@/components/ui/gradient-button";
import { ROUTES } from "@/constants/routes";

const FEATURES = [
  {
    Icon: Heart,
    title: "Likes illimités",
    description:
      "Aimez autant de profils que vous voulez, sans limite quotidienne.",
  },
  {
    Icon: Eye,
    title: "Voir qui vous a aimé",
    description: "Découvrez immédiatement les profils qui vous ont déjà liké.",
  },
  {
    Icon: Star,
    title: "Super Like × 5 / jour",
    description: "Démarquez-vous auprès des profils qui vous plaisent le plus.",
  },
  {
    Icon: Zap,
    title: "Boost profil mensuel",
    description: "Soyez mis en avant pendant 30 minutes chaque mois.",
  },
  {
    Icon: Globe2,
    title: "Filtres avancés",
    description:
      "Affinez votre recherche par religion, éducation, langues et plus.",
  },
  {
    Icon: ShieldCheck,
    title: "Badge vérifié prioritaire",
    description: "Traitement prioritaire de votre vérification de profil.",
  },
];

/** Avantages Premium — port de `PremiumFeaturesScreen` (mobile). */
export default function PremiumFeaturesPage() {
  const router = useRouter();

  return (
    <div className="relative flex min-h-dvh flex-col">
      <ScreenBackground theme="cream">
        <GlowOrb
          size={220}
          color="rgba(155,126,222,0.1)"
          top={-50}
          right={-50}
          duration={9.5}
        />
      </ScreenBackground>

      <div className="relative z-10 mx-auto flex w-full max-w-md flex-1 flex-col px-6 pt-14 pb-7">
        <div className="mb-6 flex items-center justify-between">
          <button
            type="button"
            onClick={() => router.back()}
            aria-label="Retour"
            className="border-border/70 bg-card/80 text-foreground grid size-11 place-items-center rounded-full border"
          >
            <ArrowLeft className="size-[19px]" aria-hidden />
          </button>
          <h1 className="font-display text-foreground text-[20px]">
            Avantages Premium
          </h1>
          <span className="w-11" aria-hidden />
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="flex flex-col gap-3">
            {FEATURES.map((feature) => (
              <div
                key={feature.title}
                className="border-border/70 bg-card/45 flex items-start gap-3.5 rounded-2xl border-[1.5px] px-4 py-4"
              >
                <span className="grid size-10 place-items-center rounded-xl bg-[#D99B2B]/[0.12]">
                  <feature.Icon
                    className="size-[18px] text-[#D99B2B]"
                    aria-hidden
                  />
                </span>
                <div className="flex-1">
                  <p className="font-display text-foreground mb-1 text-[14px]">
                    {feature.title}
                  </p>
                  <p className="text-muted-foreground text-[12px] leading-[18px]">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <GradientButton
          label="Voir les tarifs"
          onClick={() => router.push(ROUTES.premiumPricing)}
          className="mt-4"
        />
      </div>
    </div>
  );
}
