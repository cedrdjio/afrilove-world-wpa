"use client";

import { useRouter } from "next/navigation";
import {
  X,
  Heart,
  Eye,
  Star,
  Zap,
  Globe2,
  Crown,
  BadgeCheck,
} from "lucide-react";

import { ScreenBackground } from "@/components/layout/screen-background";
import { GlowOrb } from "@/components/layout/glow-orb";
import { Spinner } from "@/components/ui/spinner";
import { ROUTES } from "@/constants/routes";
import { BEST_PLAN_KEY } from "@/features/premium/constants/plans";
import { PricingCard } from "@/features/premium/components/pricing-card";
import { usePremiumPlans } from "@/features/premium/hooks/use-premium";
import { useEntitlements } from "@/features/premium/hooks/use-entitlements";
import type { PremiumPlan } from "@/features/premium/service";

const FEATURES = [
  { Icon: Heart, label: "Likes et swipes illimités" },
  { Icon: Eye, label: "Voir qui vous a aimé" },
  { Icon: Star, label: "Super Like × 5 / jour" },
  { Icon: Zap, label: "Favoris illimités" },
  { Icon: Globe2, label: "Filtres avancés" },
];

/** Landing Premium — port de `PremiumLandingScreen` (mobile). */
export default function PremiumLandingPage() {
  const router = useRouter();
  const plansQuery = usePremiumPlans();
  const entitlements = useEntitlements();

  const plans = plansQuery.data ?? [];
  const isPremium = entitlements.data?.isPremium ?? false;

  const handleChoose = (plan: PremiumPlan) => {
    router.push(
      `${ROUTES.premiumCheckout}?plan=${plan.key}&label=${encodeURIComponent(plan.label)}`,
    );
  };

  return (
    <div className="relative min-h-dvh">
      <ScreenBackground theme="deep">
        <GlowOrb
          size={300}
          color="rgba(155,126,222,0.18)"
          top={90}
          left={45}
          duration={9}
        />
      </ScreenBackground>

      <div className="relative z-10 mx-auto w-full max-w-md px-6 pt-14 pb-8">
        <button
          type="button"
          onClick={() => router.back()}
          aria-label="Fermer"
          className="mb-[18px] ml-auto grid size-[38px] place-items-center rounded-full border border-white/20 bg-white/[0.12] text-white/55"
        >
          <X className="size-4" aria-hidden />
        </button>

        <div className="mb-[26px] flex flex-col items-center">
          <Crown
            className="mb-3 size-10 text-[#D99B2B]"
            strokeWidth={1.6}
            aria-hidden
          />
          <h1 className="font-display text-center text-[38px] leading-none font-black text-white">
            AfriLove
            <br />
            <span className="text-[#D99B2B]">Premium</span>
          </h1>
          {!isPremium ? (
            <span className="font-display mt-3 rounded-full border border-[#D99B2B]/40 bg-[#D99B2B]/[0.22] px-4 py-2 text-[11px] text-[#D99B2B]">
              7 jours gratuits
            </span>
          ) : null}
        </div>

        {isPremium ? (
          <div className="mb-[18px] flex items-center gap-3 rounded-2xl border border-[#D99B2B]/40 bg-[#D99B2B]/[0.16] px-4 py-3.5">
            <BadgeCheck
              className="size-[18px] shrink-0 text-[#D99B2B]"
              strokeWidth={2.2}
              aria-hidden
            />
            <div className="flex-1">
              <p className="font-display mb-0.5 text-[12px] text-[#D99B2B]">
                Premium actif — {entitlements.data?.planLabel ?? ""}
              </p>
              <p className="text-[11.5px] leading-[16px] text-white/60">
                Valable jusqu&apos;au{" "}
                {entitlements.data?.premiumUntil
                  ? new Date(entitlements.data.premiumUntil).toLocaleDateString(
                      "fr-FR",
                    )
                  : "—"}
                . Un nouvel achat prolonge cette durée.
              </p>
            </div>
          </div>
        ) : null}

        <div className="mb-[18px] flex flex-col gap-3.5 rounded-3xl border border-white/[0.18] bg-white/[0.1] p-5">
          {FEATURES.map((feature) => (
            <div key={feature.label} className="flex items-center gap-3.5">
              <span className="grid size-[30px] place-items-center rounded-lg bg-[#D99B2B]/[0.22]">
                <feature.Icon
                  className="size-[15px] text-[#9B7EDE]"
                  aria-hidden
                />
              </span>
              <span className="font-display text-[13px] font-semibold text-white/90">
                {feature.label}
              </span>
            </div>
          ))}
        </div>

        {isPremium ? (
          <p className="font-display mb-2.5 text-[11.5px] text-white/50">
            Prolonger ou changer de forfait
          </p>
        ) : null}

        {plansQuery.isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Spinner className="size-8 border-white/30 border-t-white" />
          </div>
        ) : (
          <div className="mb-3.5 grid grid-cols-3 gap-1.5">
            {plans.map((plan) => (
              <PricingCard
                key={plan.key}
                plan={plan}
                onChoose={handleChoose}
                badge={plan.key === BEST_PLAN_KEY ? "Meilleur" : undefined}
              />
            ))}
          </div>
        )}

        <button
          type="button"
          onClick={() => router.push(ROUTES.premiumFeatures)}
          className="font-display mb-3 block w-full text-center text-[11px] text-white/50 uppercase"
        >
          Comparer tous les forfaits
        </button>

        <p className="text-center text-[10px] text-white/25">
          www.afriloveworld.com · +33 6 98 89 19 75
        </p>
      </div>
    </div>
  );
}
