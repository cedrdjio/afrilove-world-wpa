"use client";

import { m } from "framer-motion";

import { useHaptics } from "@/hooks/use-haptics";
import {
  PLAN_TONE_STYLES,
  TONE_BY_PLAN_KEY,
  formatPrice,
  type PlanTone,
} from "@/features/premium/constants/plans";
import type { PremiumPlan } from "@/features/premium/service";

interface PricingCardProps {
  plan: PremiumPlan;
  onChoose: (plan: PremiumPlan) => void;
  badge?: string;
}

/**
 * Carte tarif de la landing premium — port de `PricingCard` (mobile). Branchée
 * sur `premium_plans` ; ne fait que remonter le choix (`onChoose`). L'achat réel
 * et le routage du résultat sont gérés par l'écran parent.
 */
export function PricingCard({ plan, onChoose, badge }: PricingCardProps) {
  const haptic = useHaptics();
  const toneKey: PlanTone = TONE_BY_PLAN_KEY[plan.key] ?? "gold";
  const tone = PLAN_TONE_STYLES[toneKey];

  return (
    <div
      className="relative rounded-2xl px-2.5 py-3"
      style={{
        backgroundColor: tone.bg,
        borderWidth: badge ? 1.5 : 1,
        borderColor: tone.border,
      }}
    >
      {badge ? (
        <span
          className="font-display absolute self-center rounded-full px-2.5 py-1 text-[8px] text-white"
          style={{
            top: -10,
            left: "50%",
            transform: "translateX(-50%)",
            backgroundColor: "#9B7EDE",
          }}
        >
          {badge}
        </span>
      ) : null}
      <p
        className="font-display mb-1.5 text-center text-[8.5px] tracking-wide"
        style={{ color: tone.text }}
      >
        {plan.label}
      </p>
      <p className="font-display mb-0.5 text-center text-[22px] text-white">
        {formatPrice(plan.priceCents, plan.currency)}
      </p>
      <p className="mb-2 truncate text-center text-[9px] text-white/[0.38]">
        {plan.description ?? `${plan.durationDays} jours`}
      </p>
      <m.button
        type="button"
        whileTap={{ scale: 0.95 }}
        onClick={() => {
          haptic("light");
          onChoose(plan);
        }}
        className="font-display w-full rounded-lg py-1.5 text-center text-[9px] text-white"
        style={{ backgroundColor: tone.cta }}
      >
        Choisir
      </m.button>
    </div>
  );
}
