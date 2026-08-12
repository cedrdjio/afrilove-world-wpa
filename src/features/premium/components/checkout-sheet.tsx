"use client";

import { useMemo, useState } from "react";
import { m } from "framer-motion";
import {
  Check,
  CreditCard,
  Loader2,
  Smartphone,
  Wallet,
  X,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { toast } from "sonner";

import { cn } from "@/lib/utils";
import { detectOperator, formatCmPhone } from "../payments";
import type { CheckoutMethod } from "../payments";
import { usePurchasePlan } from "../hooks";
import { formatPlanPrice } from "../format";
import type { PremiumPlan } from "../service";

/** Méthode choisie dans l'UI (le mobile money résout ensuite l'opérateur). */
type MethodChoice = "momo" | "stripe" | "paypal";

const METHOD_OPTIONS: {
  key: MethodChoice;
  label: string;
  sublabel: string;
  Icon: LucideIcon;
}[] = [
  {
    key: "momo",
    label: "Mobile Money",
    sublabel: "MTN MoMo · Orange Money",
    Icon: Smartphone,
  },
  {
    key: "stripe",
    label: "Carte bancaire",
    sublabel: "Visa · Mastercard",
    Icon: CreditCard,
  },
  { key: "paypal", label: "PayPal", sublabel: "Compte PayPal", Icon: Wallet },
];

/**
 * Feuille de paiement (« premium/checkout »). Trois méthodes en parité avec le
 * jalon mobile : Mobile Money (MTN / Orange, avec saisie du numéro), carte
 * bancaire (Stripe) et PayPal. Toutes passent par la même page hébergée
 * CamerPay (`payment-initiate`) ; carte et PayPal ne demandent aucun numéro.
 * L'issue (`succeeded`/`pending`/`failed`/`canceled`) est traduite clairement.
 */
export function CheckoutSheet({
  plan,
  onClose,
  onSuccess,
}: {
  plan: PremiumPlan;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [method, setMethod] = useState<MethodChoice>("momo");
  const [phone, setPhone] = useState("");
  const purchase = usePurchasePlan();

  const operator = useMemo(() => detectOperator(phone), [phone]);
  const price = formatPlanPrice(plan.priceCents, plan.currency);
  const canPay =
    !purchase.isPending && (method !== "momo" || Boolean(operator));

  const pay = () => {
    let paymentMethod: CheckoutMethod;
    let momoPhone: string | undefined;
    if (method === "momo") {
      if (!operator) return;
      paymentMethod = operator.paymentMethod;
      momoPhone = phone.replace(/\D/g, "");
    } else {
      paymentMethod = method;
    }

    purchase.mutate(
      { planKey: plan.key, paymentMethod, phone: momoPhone },
      {
        onSuccess: (result) => {
          if (result.outcome === "succeeded") {
            toast.success("Bienvenue en Premium ! 🎉");
            onSuccess();
          } else if (result.outcome === "pending") {
            toast("Paiement en cours de confirmation…", {
              description: "Votre Premium s'activera dès validation.",
            });
            onClose();
          } else if (result.outcome === "canceled") {
            toast("Paiement annulé.");
          } else {
            toast.error("Le paiement a échoué. Réessayez.");
          }
        },
        onError: () =>
          toast.error("Le paiement n'a pas pu démarrer. Réessayez."),
      },
    );
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-end justify-center">
      <button
        type="button"
        aria-label="Fermer"
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
      />
      <m.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 30, stiffness: 300 }}
        className="text-foreground bg-background relative z-10 max-h-[92vh] w-full max-w-md overflow-y-auto rounded-t-[var(--radius-xl)] px-6 pt-5 pb-[max(1.5rem,env(safe-area-inset-bottom))]"
      >
        <div className="mx-auto mb-4 h-1.5 w-10 rounded-full bg-black/15 dark:bg-white/20" />
        <div className="flex items-center justify-between">
          <h2 className="font-display text-xl font-extrabold">Paiement</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fermer"
            className="text-muted-foreground grid size-9 place-items-center rounded-full"
          >
            <X className="size-5" aria-hidden />
          </button>
        </div>

        <div className="bg-muted mt-3 flex items-center justify-between rounded-[var(--radius-lg)] p-4">
          <span className="text-sm font-semibold">{plan.label}</span>
          <span className="font-display text-lg font-extrabold">{price}</span>
        </div>

        <p className="text-muted-foreground mt-5 mb-2 text-sm font-semibold">
          Méthode de paiement
        </p>
        <div
          role="radiogroup"
          aria-label="Méthode de paiement"
          className="flex flex-col gap-2.5"
        >
          {METHOD_OPTIONS.map(({ key, label, sublabel, Icon }) => {
            const selected = method === key;
            return (
              <button
                key={key}
                type="button"
                role="radio"
                aria-checked={selected}
                onClick={() => setMethod(key)}
                className={cn(
                  "flex items-center gap-3 rounded-[var(--radius-lg)] border px-4 py-3.5 text-left transition-colors",
                  selected
                    ? "border-primary bg-primary/5"
                    : "border-border bg-card hover:bg-muted",
                )}
              >
                <span
                  className={cn(
                    "grid size-10 shrink-0 place-items-center rounded-[var(--radius-sm)]",
                    selected
                      ? "bg-primary/15 text-primary"
                      : "bg-muted text-muted-foreground",
                  )}
                >
                  <Icon className="size-5" aria-hidden />
                </span>
                <span className="flex-1">
                  <span className="block text-sm font-bold">{label}</span>
                  <span className="text-muted-foreground block text-xs">
                    {sublabel}
                  </span>
                </span>
                <span
                  className={cn(
                    "grid size-5 shrink-0 place-items-center rounded-full border-2 transition-colors",
                    selected
                      ? "border-primary bg-primary text-white"
                      : "border-muted-foreground/40",
                  )}
                >
                  {selected && (
                    <Check className="size-3" strokeWidth={4} aria-hidden />
                  )}
                </span>
              </button>
            );
          })}
        </div>

        {method === "momo" ? (
          <>
            <label className="mt-5 block text-sm font-semibold" htmlFor="momo">
              Numéro Mobile Money
            </label>
            <div className="mt-2 flex items-center gap-2">
              <span className="text-muted-foreground text-sm font-bold">
                +237
              </span>
              <div className="border-input focus-within:ring-ring flex flex-1 items-center gap-2 rounded-[var(--radius-pill)] border px-4 focus-within:ring-2">
                <Smartphone
                  className="text-muted-foreground size-4"
                  aria-hidden
                />
                <input
                  id="momo"
                  value={formatCmPhone(phone)}
                  onChange={(e) => setPhone(e.target.value)}
                  inputMode="tel"
                  autoComplete="tel"
                  placeholder="6 XX XX XX XX"
                  className="h-12 flex-1 bg-transparent text-sm outline-none"
                />
              </div>
            </div>
            <p className="mt-2 h-5 text-xs font-semibold">
              {operator ? (
                <span className="text-success">{operator.label} détecté</span>
              ) : phone.length > 0 ? (
                <span className="text-muted-foreground">
                  Numéro MTN ou Orange Money valide attendu
                </span>
              ) : null}
            </p>
          </>
        ) : (
          <p className="text-muted-foreground mt-5 text-sm leading-relaxed">
            {method === "stripe"
              ? "Vous saisirez votre carte sur la page de paiement sécurisée CamerPay (Visa, Mastercard)."
              : "Vous serez redirigé vers PayPal pour finaliser le paiement en toute sécurité."}
          </p>
        )}

        <button
          type="button"
          onClick={pay}
          disabled={!canPay}
          className="gradient-signature shadow-brand font-display mt-5 flex h-14 w-full items-center justify-center gap-2 rounded-[var(--radius-pill)] font-bold text-white disabled:opacity-50"
        >
          {purchase.isPending ? (
            <>
              <Loader2 className="size-5 animate-spin" aria-hidden />
              Confirmation…
            </>
          ) : (
            `Payer ${price}`
          )}
        </button>
        <p className="text-muted-foreground mt-3 text-center text-xs">
          Paiement sécurisé via CamerPay · sans engagement
        </p>
      </m.div>
    </div>
  );
}
