"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { m } from "framer-motion";
import { Check, Crown, X } from "lucide-react";

import { useHaptics } from "@/hooks/use-haptics";
import { cn } from "@/lib/utils";

/**
 * Écran d'abonnement Premium (« 15 »). Architecture prête pour brancher Stripe /
 * Mobile Money : chaque `Plan` porte un `id` de tarif, la sélection est isolée
 * dans un état local, et le CTA appellera l'edge function `payment-initiate`.
 */
interface Plan {
  id: string;
  label: string;
  price: string;
  popular?: boolean;
}

const PLANS: Plan[] = [
  { id: "monthly", label: "1 mois", price: "14,99€" },
  { id: "biannual", label: "6 mois", price: "8,99€", popular: true },
  { id: "annual", label: "12 mois", price: "6,49€" },
];

const PERKS = [
  "Likes illimités chaque jour",
  "Vois qui t'a déjà liké",
  "1 boost + 5 super likes par semaine",
];

export function PremiumScreen() {
  const router = useRouter();
  const haptic = useHaptics();
  const [selected, setSelected] = useState("biannual");
  const plan = PLANS.find((p) => p.id === selected) ?? PLANS[1]!;

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
            Afrilove Premium
          </h1>
          <p className="mt-2 text-sm text-white/70">Rencontre sans limites</p>
        </div>

        <ul className="mt-9 flex flex-col gap-3">
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

        <div className="mt-9 grid grid-cols-3 gap-3">
          {PLANS.map((p) => {
            const active = p.id === selected;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => {
                  haptic("light");
                  setSelected(p.id);
                }}
                aria-pressed={active}
                className={cn(
                  "relative rounded-[var(--radius-lg)] border py-4 text-center transition-all",
                  active
                    ? "gradient-signature shadow-brand scale-105 border-white"
                    : "border-white/20 bg-white/10",
                )}
              >
                {p.popular && (
                  <span className="text-primary font-display absolute -top-2.5 left-1/2 -translate-x-1/2 rounded-full bg-white px-2.5 py-0.5 text-[10px] font-extrabold whitespace-nowrap">
                    POPULAIRE
                  </span>
                )}
                <div className="font-display text-sm font-bold">{p.label}</div>
                <div className="font-display mt-1.5 text-xl font-extrabold">
                  {p.price}
                </div>
                <div className="mt-0.5 text-[11px] text-white/60">/ mois</div>
              </button>
            );
          })}
        </div>

        <div className="flex-1" />

        <button
          type="button"
          onClick={() => haptic("success")}
          className="font-display text-primary flex h-14 items-center justify-center rounded-[var(--radius-pill)] bg-white text-[1.05rem] font-bold shadow-xl active:scale-[0.98]"
        >
          Continuer — {plan.price}/mois
        </button>
        <p className="mt-3.5 text-center text-xs text-white/60">
          Sans engagement · résiliable à tout moment
        </p>
      </m.div>
    </div>
  );
}
