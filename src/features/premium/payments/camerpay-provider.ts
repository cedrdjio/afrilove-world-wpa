import { db } from "@/services/supabase/browser";
import { logEvent } from "@/services/log";

import type { CheckoutInput, PaymentProvider, PaymentResult } from "./types";

// Le webhook payment-webhook, pas le navigateur, fait foi. Après ouverture de
// la page de paiement, on interroge notre propre ligne de transaction (lisible
// via RLS) jusqu'à ce que le serveur l'ait réglée. Les confirmations mobile
// money peuvent tarder quelques secondes.
const POLL_INTERVAL_MS = 2500;
const POLL_WINDOW_MS = 90_000; // fenêtre totale d'attente de confirmation
const POLL_GRACE_AFTER_CLOSE_MS = 12_000; // délai de grâce après fermeture

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

interface InitiateResponse {
  payUrl: string;
  transactionUuid: string;
  invoiceId: string;
}

async function initiate(input: CheckoutInput): Promise<InitiateResponse> {
  const { data, error } = await db().functions.invoke("payment-initiate", {
    body: {
      planKey: input.planKey,
      phone: input.phone ?? undefined,
      paymentMethod: input.paymentMethod,
    },
  });
  if (error) throw error;
  if (!data?.payUrl || !data?.transactionUuid) {
    throw new Error("Le paiement n'a pas pu être démarré.");
  }
  return data as InitiateResponse;
}

/**
 * Interroge la fonction Edge payment-status, qui revérifie auprès de CamerPay
 * et règle la transaction côté serveur — le premium s'active même si le webhook
 * n'a pas été configuré. Repli : lecture de notre propre ligne de transaction.
 */
async function fetchStatus(transactionUuid: string): Promise<string> {
  const supabase = db();
  const { data, error } = await supabase.functions.invoke("payment-status", {
    body: { transactionUuid },
  });
  if (!error && typeof data?.status === "string") return data.status;

  const { data: row } = await supabase
    .from("payment_transactions")
    .select("status")
    .eq("provider_uuid", transactionUuid)
    .maybeSingle();
  return row?.status ?? "pending";
}

export const camerpayProvider: PaymentProvider = {
  id: "camerpay",

  async isAvailable() {
    return true;
  },

  async checkout(input: CheckoutInput): Promise<PaymentResult> {
    let payUrl: string;
    let transactionUuid: string;
    try {
      ({ payUrl, transactionUuid } = await initiate(input));
    } catch (error) {
      logEvent(
        "error",
        "payment_initiate_failed",
        error instanceof Error ? error.message : String(error),
        { planKey: input.planKey, method: input.paymentMethod },
      );
      throw error;
    }
    logEvent("info", "payment_initiated", undefined, {
      planKey: input.planKey,
      method: input.paymentMethod,
      transactionUuid,
    });

    // Ouvre la page hébergée CamerPay dans une popup (repli : redirection même
    // onglet si la popup est bloquée). On ne peut pas lire l'URL de retour
    // cross-origin, donc le résultat vient du polling de payment-status.
    const popup =
      typeof window !== "undefined"
        ? window.open(payUrl, "camerpay", "width=480,height=720")
        : null;
    if (!popup && typeof window !== "undefined") {
      window.location.href = payUrl;
      return { outcome: "pending", providerRef: transactionUuid };
    }

    const deadline = Date.now() + POLL_WINDOW_MS;
    let closedAt: number | null = null;

    while (Date.now() < deadline) {
      const status = await fetchStatus(transactionUuid);
      if (status === "completed") {
        popup?.close();
        return finish("succeeded");
      }
      if (status === "failed" || status === "canceled") {
        popup?.close();
        return finish("failed");
      }

      // La popup fermée = l'utilisateur a terminé : on laisse un délai de grâce
      // (il a pu payer puis fermer) puis on tranche « annulé » si rien ne vient.
      if (popup?.closed) {
        if (closedAt === null) closedAt = Date.now();
        else if (Date.now() - closedAt > POLL_GRACE_AFTER_CLOSE_MS) {
          return finish("canceled");
        }
      }
      await sleep(POLL_INTERVAL_MS);
    }

    popup?.close();
    return finish("pending");

    function finish(outcome: PaymentResult["outcome"]): PaymentResult {
      logEvent(
        outcome === "failed" ? "warn" : "info",
        "payment_outcome",
        outcome,
        {
          planKey: input.planKey,
          method: input.paymentMethod,
          transactionUuid,
        },
      );
      return { outcome, providerRef: transactionUuid };
    }
  },
};
