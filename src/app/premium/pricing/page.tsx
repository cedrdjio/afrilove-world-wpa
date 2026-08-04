"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { m } from "framer-motion";
import { Crown, Check, ArrowLeft, BadgeCheck } from "lucide-react";

import { ScreenBackground } from "@/components/layout/screen-background";
import { GradientButton } from "@/components/ui/gradient-button";
import { Spinner } from "@/components/ui/spinner";
import { useHaptics } from "@/hooks/use-haptics";
import { ROUTES } from "@/constants/routes";
import {
  BEST_PLAN_KEY,
  DEFAULT_PLAN_KEY,
  durationLabel,
  formatPrice,
} from "@/features/premium/constants/plans";
import { usePremiumPlans } from "@/features/premium/hooks/use-premium";
import { useEntitlements } from "@/features/premium/hooks/use-entitlements";

const FEATURES = [
  "Likes illimités chaque jour",
  "Vois qui t'a déjà liké",
  "Super likes et filtres avancés",
];

/** Écran tarifs — port de `PremiumPricingScreen` (fond nuit, cartes sélectionnables). */
export default function PremiumPricingPage() {
  const router = useRouter();
  const haptic = useHaptics();
  const plansQuery = usePremiumPlans();
  const entitlements = useEntitlements();
  const [selected, setSelected] = useState<string | null>(null);

  const plans = plansQuery.data ?? [];
  const selectedKey =
    selected ??
    plans.find((p) => p.key === DEFAULT_PLAN_KEY)?.key ??
    plans[0]?.key ??
    null;
  const selectedPlan = plans.find((p) => p.key === selectedKey) ?? null;

  const handleContinue = () => {
    if (!selectedPlan) return;
    haptic("light");
    router.push(
      `${ROUTES.premiumCheckout}?plan=${selectedPlan.key}&label=${encodeURIComponent(selectedPlan.label)}`,
    );
  };

  return (
    <div className="relative flex min-h-dvh flex-col">
      <ScreenBackground theme="deep" />

      <div className="relative z-10 mx-auto flex w-full max-w-md flex-1 flex-col px-6 pt-14 pb-6">
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => router.back()}
            aria-label="Retour"
            className="grid size-11 place-items-center rounded-full border border-white/20 bg-white/[0.12] text-white"
          >
            <ArrowLeft className="size-[19px]" aria-hidden />
          </button>
          <span className="w-11" aria-hidden />
        </div>

        <div className="flex-1 overflow-y-auto">
          <m.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="flex flex-col items-center pt-2"
          >
            <span className="gradient-signature mb-4 grid size-[72px] place-items-center rounded-3xl shadow-[0_12px_26px_rgba(155,126,222,0.45)]">
              <Crown
                className="size-8 text-white"
                strokeWidth={1.8}
                aria-hidden
              />
            </span>
            <h1 className="font-display mb-1 text-[28px] text-white">
              AfriLove Premium
            </h1>
            <p className="mb-6 text-[13px] text-white/60">
              Rencontre sans limites
            </p>
          </m.div>

          <div className="mb-6 flex flex-col gap-2.5">
            {FEATURES.map((feature) => (
              <div key={feature} className="flex items-center gap-3">
                <span className="grid size-6 place-items-center rounded-full bg-[#D99B2B]/25">
                  <Check
                    className="size-[13px] text-[#E8C25A]"
                    strokeWidth={3}
                    aria-hidden
                  />
                </span>
                <span className="text-[13.5px] font-medium text-white/85">
                  {feature}
                </span>
              </div>
            ))}
          </div>

          {entitlements.data?.isPremium ? (
            <div className="mb-3.5 flex items-center gap-2 rounded-[18px] border border-white/15 bg-white/[0.07] px-4 py-3">
              <BadgeCheck
                className="size-[15px] shrink-0 text-[#E8C25A]"
                strokeWidth={2.4}
                aria-hidden
              />
              <p className="flex-1 text-[12px] leading-[17px] text-white/85">
                Premium actif ({entitlements.data.planLabel}) jusqu&apos;au{" "}
                {entitlements.data.premiumUntil
                  ? new Date(entitlements.data.premiumUntil).toLocaleDateString(
                      "fr-FR",
                    )
                  : "—"}
                . Un nouvel achat prolonge cette durée.
              </p>
            </div>
          ) : null}

          {plansQuery.isLoading ? (
            <div className="flex items-center justify-center py-14">
              <Spinner className="size-8 border-white/30 border-t-white" />
            </div>
          ) : (
            <div className="flex flex-wrap justify-center gap-2.5">
              {plans.map((plan) => {
                const isSelected = plan.key === selectedKey;
                const isBest = plan.key === BEST_PLAN_KEY;
                return (
                  <button
                    key={plan.key}
                    type="button"
                    onClick={() => {
                      haptic("light");
                      setSelected(plan.key);
                    }}
                    className="relative flex w-[31%] flex-col items-center rounded-[20px] px-2 pt-4 pb-3.5"
                    style={{
                      backgroundColor: isSelected
                        ? "rgba(155,126,222,0.22)"
                        : "rgba(255,255,255,0.07)",
                      borderWidth: 1.5,
                      borderColor: isSelected
                        ? "#D99B2B"
                        : "rgba(255,255,255,0.16)",
                      boxShadow: isSelected
                        ? "0 8px 18px rgba(155,126,222,0.4)"
                        : "none",
                    }}
                  >
                    {isBest ? (
                      <span
                        className="font-display absolute rounded-full px-2.5 py-1 text-[8px] text-white"
                        style={{
                          top: -10,
                          left: "50%",
                          transform: "translateX(-50%)",
                          backgroundColor: "#D99B2B",
                        }}
                      >
                        Meilleure offre
                      </span>
                    ) : null}
                    <span className="font-display mb-1.5 text-[10px] text-white/60">
                      {durationLabel(plan.durationDays)}
                    </span>
                    <span className="font-display mb-0.5 text-[21px] text-white">
                      {formatPrice(plan.priceCents, plan.currency)}
                    </span>
                    <span className="text-center text-[9px] leading-[13px] text-white/[0.42]">
                      {plan.label}
                    </span>
                  </button>
                );
              })}
            </div>
          )}

          <p className="mt-5 text-center text-[10.5px] leading-[15px] text-white/[0.35]">
            Sans engagement · les achats prolongent la durée Premium en cours.
            <br />
            www.afriloveworld.com · +33 6 98 89 19 75
          </p>
        </div>

        <GradientButton
          label={
            selectedPlan
              ? `Continuer — ${formatPrice(selectedPlan.priceCents, selectedPlan.currency)}`
              : "Continuer"
          }
          disabled={!selectedPlan}
          onClick={handleContinue}
          className="mt-3.5"
        />
      </div>
    </div>
  );
}
