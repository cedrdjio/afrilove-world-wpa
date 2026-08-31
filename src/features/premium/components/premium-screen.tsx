"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, m } from "framer-motion";
import { Check, Crown, Gift, Loader2, Sparkles, X } from "lucide-react";

import { useAuth } from "@/providers/auth-provider";
import { useHaptics } from "@/hooks/use-haptics";
import { cn } from "@/lib/utils";

import { usePremiumPlans, useEntitlements } from "../hooks";
import { formatPlanPrice, formatPerMonth } from "../format";
import { BEST_PLAN_KEY } from "../constants";
import type { PremiumPlan } from "../service";
import { CheckoutSheet } from "./checkout-sheet";

/**
 * Écran d'abonnement Premium (« 15 »). Branché de bout en bout : plans réels
 * (`premium_plans`), droits courants (`get_my_entitlements`) et achat Mobile
 * Money via `CheckoutSheet`. Un aperçu statique reste servi hors connexion.
 */
const PERKS = [
  "Likes illimités chaque jour",
  "Vois qui t'a déjà liké",
  "Favoris illimités",
  "1 boost + 5 super likes par semaine",
];

/** Modèle d'affichage d'un plan, indépendant de la source (réel ou démo). */
interface PlanCard {
  key: string;
  label: string;
  priceLabel: string;
  perMonthLabel: string | null;
  popular: boolean;
}

const DEMO_PLANS: PlanCard[] = [
  {
    key: "month_1m",
    label: "1 mois",
    priceLabel: "14,99 €",
    perMonthLabel: null,
    popular: false,
  },
  {
    key: "quarter_3m",
    label: "3 mois",
    priceLabel: "26,99 €",
    perMonthLabel: "8,99 € / mois",
    popular: true,
  },
  {
    key: "year_1y",
    label: "12 mois",
    priceLabel: "77,88 €",
    perMonthLabel: "6,49 € / mois",
    popular: false,
  },
];

function toPlanCard(plan: PremiumPlan): PlanCard {
  return {
    key: plan.key,
    label: plan.label,
    priceLabel: formatPlanPrice(plan.priceCents, plan.currency),
    perMonthLabel:
      plan.durationDays > 31
        ? `${formatPerMonth(plan.priceCents, plan.currency, plan.durationDays)} / mois`
        : null,
    popular: plan.key === BEST_PLAN_KEY,
  };
}

const DATE_FMT = new Intl.DateTimeFormat("fr-FR", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

export function PremiumScreen() {
  const router = useRouter();
  const haptic = useHaptics();
  const { isAuthenticated, profile } = useAuth();

  // Modèle « offert aux femmes » : elles ne voient jamais l'option de paiement.
  const isWoman = isAuthenticated && profile?.gender === "femme";

  const { data: realPlans, isLoading: plansLoading } = usePremiumPlans();
  const { data: entitlements } = useEntitlements();

  const plans = useMemo<PlanCard[]>(() => {
    if (!isAuthenticated) return DEMO_PLANS;
    return (realPlans ?? []).map(toPlanCard);
  }, [isAuthenticated, realPlans]);

  const defaultKey =
    plans.find((p) => p.popular)?.key ?? plans[0]?.key ?? BEST_PLAN_KEY;
  const [selected, setSelected] = useState<string | null>(null);
  const activeKey = selected ?? defaultKey;

  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const selectedPlan = (realPlans ?? []).find((p) => p.key === activeKey);
  const selectedCard = plans.find((p) => p.key === activeKey);

  const isPremium = entitlements?.isPremium ?? false;
  const loading = isAuthenticated && plansLoading;

  const openCheckout = () => {
    haptic("success");
    if (isAuthenticated && selectedPlan) setCheckoutOpen(true);
  };

  return (
    <div
      className="dark relative flex min-h-dvh flex-col overflow-hidden px-6 pt-[max(1.25rem,env(safe-area-inset-top))] pb-[max(1.5rem,env(safe-area-inset-bottom))] text-white"
      style={{
        background:
          "linear-gradient(160deg,#2E2440 0%,#4A3C7A 62%,#6A4FC0 125%)",
      }}
    >
      <div className="bg-accent/40 pointer-events-none absolute top-24 left-1/2 size-[400px] -translate-x-1/2 rounded-full blur-3xl" />

      <div className="relative z-10 flex justify-end">
        <button
          type="button"
          onClick={() => router.back()}
          aria-label="Fermer"
          className="grid size-11 place-items-center rounded-[var(--radius-md)] border border-white/20 bg-white/10 backdrop-blur-lg"
        >
          <X className="size-5" aria-hidden />
        </button>
      </div>

      <m.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
        className="relative z-10 flex flex-1 flex-col"
      >
        <div className="mt-4 text-center">
          <m.span
            animate={{ y: [0, -12, 0] }}
            transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
            className="from-brand-400 to-brand-500 shadow-brand inline-grid size-20 place-items-center rounded-[var(--radius-lg)] bg-gradient-to-br"
          >
            <Crown className="size-10 fill-white text-white" aria-hidden />
          </m.span>
          <h1 className="font-display mt-4 text-3xl font-extrabold">
            AfriLove Premium
          </h1>
          <p className="mt-2 text-sm text-white/70">Rencontre sans limites</p>
        </div>

        {isPremium ? (
          <PremiumActive until={entitlements?.premiumUntil ?? null} />
        ) : isWoman ? (
          <PremiumOffered />
        ) : (
          <>
            <ul className="mt-9 flex flex-col gap-3">
              {PERKS.map((perk) => (
                <li
                  key={perk}
                  className="flex items-center gap-3 text-[0.95rem]"
                >
                  <span className="grid size-6 shrink-0 place-items-center rounded-full bg-white/15">
                    <Check
                      className="text-brand-300 size-4"
                      strokeWidth={3}
                      aria-hidden
                    />
                  </span>
                  {perk}
                </li>
              ))}
            </ul>

            {loading ? (
              <div className="mt-9 grid h-40 place-items-center">
                <Loader2 className="size-6 animate-spin text-white/70" />
              </div>
            ) : (
              <div className="mt-9 flex flex-col gap-3">
                {plans.map((p) => {
                  const active = p.key === activeKey;
                  return (
                    <button
                      key={p.key}
                      type="button"
                      onClick={() => {
                        haptic("light");
                        setSelected(p.key);
                      }}
                      aria-pressed={active}
                      className={cn(
                        "relative flex items-center justify-between rounded-[var(--radius-lg)] border px-5 py-4 text-left transition-all",
                        active
                          ? "gradient-signature shadow-brand border-white"
                          : "border-white/20 bg-white/10",
                      )}
                    >
                      {p.popular && (
                        <span className="text-primary font-display absolute -top-2.5 left-5 rounded-full bg-white px-2.5 py-0.5 text-[10px] font-extrabold whitespace-nowrap">
                          MEILLEUR PRIX
                        </span>
                      )}
                      <div>
                        <div className="font-display text-base font-bold">
                          {p.label}
                        </div>
                        {p.perMonthLabel && (
                          <div className="mt-0.5 text-[12px] text-white/70">
                            {p.perMonthLabel}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-display text-xl font-extrabold">
                          {p.priceLabel}
                        </span>
                        <span
                          className={cn(
                            "grid size-5 shrink-0 place-items-center rounded-full border-2 transition-colors",
                            active
                              ? "border-white bg-white"
                              : "border-white/40",
                          )}
                        >
                          {active && (
                            <Check
                              className="text-primary size-3"
                              strokeWidth={4}
                              aria-hidden
                            />
                          )}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            <div className="min-h-6 flex-1" />

            <button
              type="button"
              onClick={openCheckout}
              disabled={loading || plans.length === 0}
              className="font-display text-primary flex h-14 items-center justify-center gap-2 rounded-[var(--radius-pill)] bg-white text-[1.05rem] font-bold shadow-xl active:scale-[0.98] disabled:opacity-60"
            >
              <Sparkles className="size-5" aria-hidden />
              {selectedCard
                ? `Passer Premium · ${selectedCard.priceLabel}`
                : "Passer Premium"}
            </button>
            <p className="mt-3.5 text-center text-xs text-white/60">
              Paiement Mobile Money · sans engagement · résiliable à tout moment
            </p>
          </>
        )}
      </m.div>

      <AnimatePresence>
        {checkoutOpen && selectedPlan && (
          <CheckoutSheet
            plan={selectedPlan}
            onClose={() => setCheckoutOpen(false)}
            onSuccess={() => {
              setCheckoutOpen(false);
              router.back();
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

/**
 * Vue « Premium offert » — servie aux femmes : aucune option de paiement, les
 * avantages sont présentés comme offerts (modèle freemium femmes gratuit).
 */
function PremiumOffered() {
  return (
    <div className="mt-9 flex flex-1 flex-col">
      <div className="rounded-[var(--radius-lg)] border border-white/20 bg-white/10 p-6 text-center backdrop-blur-lg">
        <span className="from-brand-400 to-brand-500 shadow-brand mx-auto grid size-12 place-items-center rounded-full bg-gradient-to-br">
          <Gift className="size-6 text-white" aria-hidden />
        </span>
        <p className="font-display mt-3 text-lg font-extrabold">
          Premium offert
        </p>
        <p className="mt-1 text-sm text-white/70">
          Sur AfriLove, les femmes profitent des avantages Premium sans rien
          payer.
        </p>
      </div>

      <ul className="mt-6 flex flex-col gap-3">
        {PERKS.map((perk) => (
          <li key={perk} className="flex items-center gap-3 text-[0.95rem]">
            <span className="grid size-6 shrink-0 place-items-center rounded-full bg-white/15">
              <Check
                className="text-brand-300 size-4"
                strokeWidth={3}
                aria-hidden
              />
            </span>
            {perk}
          </li>
        ))}
      </ul>

      <div className="min-h-6 flex-1" />
      <p className="text-center text-xs text-white/60">
        Aucun paiement requis · profite de tout, librement
      </p>
    </div>
  );
}

function PremiumActive({ until }: { until: string | null }) {
  const untilLabel = until ? DATE_FMT.format(new Date(until)) : null;
  return (
    <div className="mt-9 flex flex-1 flex-col">
      <div className="rounded-[var(--radius-lg)] border border-white/20 bg-white/10 p-6 text-center backdrop-blur-lg">
        <span className="from-brand-400 to-brand-500 shadow-brand mx-auto grid size-12 place-items-center rounded-full bg-gradient-to-br">
          <Sparkles className="size-6 text-white" aria-hidden />
        </span>
        <p className="font-display mt-3 text-lg font-extrabold">
          Vous êtes Premium
        </p>
        {untilLabel && (
          <p className="mt-1 text-sm text-white/70">
            Actif jusqu&apos;au {untilLabel}
          </p>
        )}
      </div>

      <ul className="mt-6 flex flex-col gap-3">
        {PERKS.map((perk) => (
          <li key={perk} className="flex items-center gap-3 text-[0.95rem]">
            <span className="grid size-6 shrink-0 place-items-center rounded-full bg-white/15">
              <Check
                className="text-brand-300 size-4"
                strokeWidth={3}
                aria-hidden
              />
            </span>
            {perk}
          </li>
        ))}
      </ul>
    </div>
  );
}
