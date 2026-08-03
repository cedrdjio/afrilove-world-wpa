"use client";

import { useMemo, useState } from "react";
import { m } from "framer-motion";
import { Loader2, Smartphone, X } from "lucide-react";
import { toast } from "sonner";

import { detectOperator, formatCmPhone } from "../payments";
import { usePurchasePlan } from "../hooks";
import { formatPlanPrice } from "../format";
import type { PremiumPlan } from "../service";

/**
 * Feuille de paiement Mobile Money (« premium/checkout »). Saisie du numéro,
 * détection de l'opérateur (MTN / Orange) et achat réel via CamerPay. L'issue
 * (`succeeded`/`pending`/`failed`/`canceled`) est traduite en retour clair.
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
  const [phone, setPhone] = useState("");
  const purchase = usePurchasePlan();

  const operator = useMemo(() => detectOperator(phone), [phone]);
  const price = formatPlanPrice(plan.priceCents, plan.currency);

  const pay = () => {
    if (!operator) return;
    purchase.mutate(
      {
        planKey: plan.key,
        paymentMethod: operator.paymentMethod,
        phone: phone.replace(/\D/g, ""),
      },
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
        className="text-foreground bg-background relative z-10 w-full max-w-md rounded-t-[var(--radius-xl)] px-6 pt-5 pb-[max(1.5rem,env(safe-area-inset-bottom))]"
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

        <label className="mt-5 block text-sm font-semibold" htmlFor="momo">
          Numéro Mobile Money
        </label>
        <div className="mt-2 flex items-center gap-2">
          <span className="text-muted-foreground text-sm font-bold">+237</span>
          <div className="border-input focus-within:ring-ring flex flex-1 items-center gap-2 rounded-[var(--radius-pill)] border px-4 focus-within:ring-2">
            <Smartphone className="text-muted-foreground size-4" aria-hidden />
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

        <button
          type="button"
          onClick={pay}
          disabled={!operator || purchase.isPending}
          className="gradient-signature shadow-brand font-display mt-4 flex h-14 w-full items-center justify-center gap-2 rounded-[var(--radius-pill)] font-bold text-white disabled:opacity-50"
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
