"use client";

import { Suspense, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import {
  ArrowLeft,
  Smartphone,
  CheckCircle2,
  ShieldCheck,
  CreditCard,
  Wallet,
  type LucideIcon,
} from "lucide-react";

import { ScreenBackground } from "@/components/layout/screen-background";
import { GradientButton } from "@/components/ui/gradient-button";
import { Spinner } from "@/components/ui/spinner";
import { mapToAppError } from "@/lib/errors";
import { ROUTES } from "@/constants/routes";
import {
  amountXafFromCents,
  formatXaf,
} from "@/features/premium/constants/plans";
import {
  usePremiumPlans,
  usePurchasePlan,
} from "@/features/premium/hooks/use-premium";
import {
  detectOperator,
  normalizeCmPhone,
} from "@/features/premium/payments/mobile-money";
import type { CheckoutMethod } from "@/features/premium/payments";

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

/** Ouvre la fenêtre CamerPay dans le geste utilisateur (sinon bloquée). */
function openCamerpayWindow(): Window | null {
  if (typeof window === "undefined") return null;
  return window.open(
    "about:blank",
    "camerpay",
    "popup,width=480,height=760,noopener=no",
  );
}

function CheckoutContent() {
  const router = useRouter();
  const params = useSearchParams();
  const planKey = params.get("plan") ?? "";
  const labelParam = params.get("label") ?? undefined;

  const plansQuery = usePremiumPlans();
  const purchase = usePurchasePlan();
  const purchaseError = purchase.error ? mapToAppError(purchase.error) : null;

  const [method, setMethod] = useState<MethodChoice>("momo");
  const [phone, setPhone] = useState("");

  const plan = useMemo(
    () => (plansQuery.data ?? []).find((p) => p.key === planKey) ?? null,
    [plansQuery.data, planKey],
  );
  const planLabel = plan?.label ?? labelParam ?? "Premium";
  const amountXaf = plan ? amountXafFromCents(plan.priceCents) : null;
  const operator = detectOperator(phone);
  const digits = normalizeCmPhone(phone);
  const showPhoneError = method === "momo" && digits.length >= 9 && !operator;
  const canPay =
    !!plan && !purchase.isPending && (method !== "momo" || !!operator);

  const handlePay = () => {
    if (!plan || purchase.isPending) return;
    let paymentMethod: CheckoutMethod;
    let momoPhone: string | undefined;
    if (method === "momo") {
      if (!operator) return;
      paymentMethod = operator.paymentMethod;
      momoPhone = normalizeCmPhone(phone);
    } else {
      paymentMethod = method;
    }

    // Ouvrir la fenêtre MAINTENANT (geste utilisateur), avant l'appel async.
    const popup = openCamerpayWindow();

    purchase.mutate(
      {
        input: { planKey: plan.key, paymentMethod, phone: momoPhone },
        ctx: { popup, planLabel },
      },
      {
        onSuccess: (result) => {
          if (result.outcome === "succeeded") {
            router.replace(
              `${ROUTES.premiumSuccess}?plan=${encodeURIComponent(planLabel)}`,
            );
          } else if (result.outcome === "pending") {
            toast("Paiement en cours", {
              description:
                "Finalisez le paiement puis revenez. Votre accès Premium s'activera dès confirmation.",
            });
            router.replace(ROUTES.discover);
          } else if (result.outcome === "failed") {
            router.replace(ROUTES.premiumFailed);
          }
          // 'canceled' → l'utilisateur a fermé la fenêtre : on reste sur l'écran.
        },
        onError: () => router.replace(ROUTES.premiumFailed),
      },
    );
  };

  return (
    <div className="relative flex min-h-dvh flex-col">
      <ScreenBackground theme="deep" />

      <div className="relative z-10 mx-auto flex w-full max-w-md flex-1 flex-col px-6 pt-14 pb-7">
        <button
          type="button"
          onClick={() => router.back()}
          aria-label="Retour"
          className="grid size-11 place-items-center rounded-full border border-white/20 bg-white/[0.12] text-white"
        >
          <ArrowLeft className="size-[19px]" aria-hidden />
        </button>

        <div className="mt-6 mb-7">
          <h1 className="font-display mb-1 text-[26px] text-white">Paiement</h1>
          <p className="text-[13px] leading-[19px] text-white/55">
            Forfait {planLabel}
            {amountXaf != null ? ` · ${formatXaf(amountXaf)} FCFA` : ""}
          </p>
        </div>

        <div className="mb-6 flex items-center justify-between rounded-2xl border border-white/[0.14] bg-white/[0.07] px-4 py-4">
          <span className="text-[13px] text-white/70">Montant à payer</span>
          <span className="font-display text-[22px] text-white">
            {amountXaf != null ? `${formatXaf(amountXaf)} FCFA` : "—"}
          </span>
        </div>

        <p className="font-display mb-2 text-[11.5px] font-semibold text-white/50">
          Méthode de paiement
        </p>
        <div className="mb-5 flex flex-col gap-2.5">
          {METHOD_OPTIONS.map(({ key, label, sublabel, Icon }) => {
            const selected = method === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => setMethod(key)}
                className="flex items-center gap-3 rounded-2xl border-[1.5px] px-4 py-3.5 text-left"
                style={{
                  borderColor: selected ? "#D99B2B" : "rgba(255,255,255,0.14)",
                  backgroundColor: selected
                    ? "rgba(255,255,255,0.1)"
                    : "rgba(255,255,255,0.05)",
                }}
              >
                <span
                  className="grid size-10 place-items-center rounded-xl"
                  style={{
                    backgroundColor: selected
                      ? "rgba(212,175,55,0.16)"
                      : "rgba(255,255,255,0.08)",
                  }}
                >
                  <Icon
                    className="size-[18px]"
                    style={{
                      color: selected ? "#D99B2B" : "rgba(255,255,255,0.6)",
                    }}
                    strokeWidth={2}
                    aria-hidden
                  />
                </span>
                <span className="flex-1">
                  <span className="font-display block text-[13.5px] text-white">
                    {label}
                  </span>
                  <span className="block text-[11.5px] text-white/45">
                    {sublabel}
                  </span>
                </span>
                {selected ? (
                  <CheckCircle2
                    className="size-[18px] text-[#D99B2B]"
                    strokeWidth={2.4}
                    aria-hidden
                  />
                ) : (
                  <span className="size-[18px] rounded-full border-[1.5px] border-white/25" />
                )}
              </button>
            );
          })}
        </div>

        {method === "momo" ? (
          <>
            <p className="font-display mb-2 text-[11.5px] font-semibold text-white/50">
              Numéro Mobile Money
            </p>
            <div
              className="flex items-center gap-2.5 rounded-2xl border-[1.5px] px-4 py-3.5"
              style={{
                borderColor: showPhoneError
                  ? "rgba(194,69,69,0.55)"
                  : operator
                    ? "#D99B2B"
                    : "rgba(255,255,255,0.16)",
                backgroundColor: "rgba(255,255,255,0.07)",
              }}
            >
              <span className="text-[14px] text-white/45">+237</span>
              <Smartphone className="size-4 text-white/40" aria-hidden />
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="6 XX XX XX XX"
                inputMode="tel"
                maxLength={17}
                className="min-w-0 flex-1 bg-transparent text-[15px] text-white outline-none placeholder:text-white/28"
              />
              {operator ? (
                <CheckCircle2
                  className="size-[18px] text-[#D99B2B]"
                  strokeWidth={2.4}
                  aria-hidden
                />
              ) : null}
            </div>

            {operator ? (
              <div className="mt-2 flex items-center gap-1.5">
                <span className="size-1.5 rounded-full bg-[#D99B2B]" />
                <span className="text-[12px] font-medium text-[#D99B2B]">
                  {operator.label} détecté
                </span>
              </div>
            ) : showPhoneError ? (
              <p className="mt-2 text-[12px] text-[#F04A6E]">
                Numéro invalide. Utilisez un numéro MTN (650-654, 67x, 68x) ou
                Orange (655-659, 69x).
              </p>
            ) : (
              <p className="mt-2 text-[12px] text-white/35">
                Vous validerez le paiement sur votre téléphone.
              </p>
            )}
          </>
        ) : (
          <p className="text-[12px] leading-[18px] text-white/40">
            {method === "stripe"
              ? "Vous saisirez votre carte sur la page de paiement sécurisée CamerPay (Visa, Mastercard)."
              : "Vous serez redirigé vers PayPal pour finaliser le paiement en toute sécurité."}
          </p>
        )}

        {purchaseError ? (
          <p className="mt-4 rounded-2xl border border-[#F04A6E]/40 bg-[#F04A6E]/10 px-4 py-3 text-[12.5px] text-[#F04A6E]">
            {purchaseError.message}
          </p>
        ) : null}

        <div className="min-h-6 flex-1" />

        <div className="mb-3 flex items-center justify-center gap-1.5">
          <ShieldCheck
            className="size-[13px] text-white/40"
            strokeWidth={2}
            aria-hidden
          />
          <span className="text-[11px] text-white/40">
            Paiement sécurisé via CamerPay
          </span>
        </div>

        {purchase.isPending ? (
          <div className="flex flex-col items-center rounded-2xl bg-white/[0.08] py-4">
            <Spinner className="size-6 border-white/30 border-t-white" />
            <p className="mt-2 text-[12px] text-white/55">
              Suivez les instructions de paiement…
            </p>
          </div>
        ) : (
          <GradientButton
            label={
              amountXaf != null ? `Payer ${formatXaf(amountXaf)} FCFA` : "Payer"
            }
            disabled={!canPay}
            onClick={handlePay}
          />
        )}
      </div>
    </div>
  );
}

/** Écran paiement — port de `PremiumCheckoutScreen` (mobile). */
export default function PremiumCheckoutPage() {
  return (
    <Suspense fallback={null}>
      <CheckoutContent />
    </Suspense>
  );
}
