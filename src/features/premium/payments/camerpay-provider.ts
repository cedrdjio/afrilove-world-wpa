import type {
  CheckoutContext,
  CheckoutInput,
  PaymentProvider,
  PaymentResult,
  SupabaseLike,
} from "./types";

/**
 * Fournisseur CamerPay — port web de `camerpayProvider` (mobile).
 *
 * Le mobile ouvre la page hébergée dans un in-app browser
 * (`openAuthSessionAsync`) et attend le retour par deep link, puis interroge
 * son propre statut. Le web n'a pas cet équivalent : on ouvre CamerPay dans une
 * **fenêtre** (ouverte dans le geste utilisateur par l'écran, passée ici) et on
 * interroge `payment-status` jusqu'à résolution — le webhook reste la source de
 * vérité. Si la fenêtre est bloquée, on retombe sur une **redirection pleine
 * page** + la page `/premium/callback` qui reprend le polling.
 */

/** Clé de reprise (repli redirection) lue par la page de retour. */
export const PENDING_PAYMENT_KEY = "afrilove.pendingPayment";

const POLL_INTERVAL_MS = 2500;
const POLL_WINDOW_OPEN_MS = 90_000; // fenêtre encore ouverte / retour effectué
const POLL_WINDOW_DISMISSED_MS = 12_000; // l'utilisateur a fermé la fenêtre

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

interface InitiateResponse {
  payUrl: string;
  transactionUuid: string;
  invoiceId: string;
}

async function initiate(
  supabase: SupabaseLike,
  input: CheckoutInput,
): Promise<InitiateResponse> {
  const { data, error } = await supabase.functions.invoke("payment-initiate", {
    // phone est absent pour Stripe/PayPal — CamerPay n'en a pas besoin.
    body: {
      planKey: input.planKey,
      phone: input.phone ?? undefined,
      paymentMethod: input.paymentMethod,
    },
  });
  if (error) throw error;
  const res = data as Partial<InitiateResponse> | null;
  if (!res?.payUrl || !res?.transactionUuid) {
    throw new Error("Le paiement n'a pas pu être démarré.");
  }
  return res as InitiateResponse;
}

/**
 * Interroge `payment-status`, qui revérifie auprès de CamerPay et règle la
 * transaction côté serveur — le premium s'active même si le webhook s'est
 * perdu. Repli : lecture de notre propre ligne `payment_transactions` (RLS).
 */
export async function fetchStatus(
  supabase: SupabaseLike,
  transactionUuid: string,
): Promise<string> {
  const { data, error } = await supabase.functions.invoke("payment-status", {
    body: { transactionUuid },
  });
  const status = (data as { status?: unknown } | null)?.status;
  if (!error && typeof status === "string") return status;

  const { data: row } = await supabase
    .from("payment_transactions")
    .select("status")
    .eq("provider_uuid", transactionUuid)
    .maybeSingle();
  return row?.status ?? "pending";
}

/** Sonde jusqu'à issue nette dans la fenêtre donnée ; `null` si toujours en attente. */
export async function pollUntilResolved(
  supabase: SupabaseLike,
  transactionUuid: string,
  windowMs: number,
): Promise<PaymentResult | null> {
  const deadline = Date.now() + windowMs;
  while (Date.now() < deadline) {
    const status = await fetchStatus(supabase, transactionUuid);
    if (status === "completed") {
      return { outcome: "succeeded", providerRef: transactionUuid };
    }
    if (status === "failed" || status === "canceled") {
      return { outcome: "failed", providerRef: transactionUuid };
    }
    await sleep(POLL_INTERVAL_MS);
  }
  return null;
}

async function pollWithPopup(
  supabase: SupabaseLike,
  transactionUuid: string,
  popup: Window,
): Promise<PaymentResult> {
  const deadline = Date.now() + POLL_WINDOW_OPEN_MS;
  while (Date.now() < deadline) {
    const status = await fetchStatus(supabase, transactionUuid);
    if (status === "completed") {
      return { outcome: "succeeded", providerRef: transactionUuid };
    }
    if (status === "failed" || status === "canceled") {
      return { outcome: "failed", providerRef: transactionUuid };
    }
    if (popup.closed) {
      // L'utilisateur a fermé la fenêtre. Il a pu payer puis fermer : courte
      // fenêtre de grâce, sinon on considère l'achat annulé.
      return (
        (await pollUntilResolved(
          supabase,
          transactionUuid,
          POLL_WINDOW_DISMISSED_MS,
        )) ?? { outcome: "canceled", providerRef: transactionUuid }
      );
    }
    await sleep(POLL_INTERVAL_MS);
  }
  return { outcome: "pending", providerRef: transactionUuid };
}

export const camerpayProvider: PaymentProvider = {
  id: "camerpay",

  async isAvailable() {
    return true;
  },

  async checkout(
    supabase: SupabaseLike,
    input: CheckoutInput,
    ctx?: CheckoutContext,
  ): Promise<PaymentResult> {
    const popup = ctx?.popup ?? null;

    let payUrl: string;
    let transactionUuid: string;
    try {
      ({ payUrl, transactionUuid } = await initiate(supabase, input));
    } catch (error) {
      popup?.close();
      throw error;
    }

    // Fenêtre disponible : on y charge CamerPay et on sonde jusqu'à l'issue.
    if (popup && !popup.closed) {
      try {
        popup.location.href = payUrl;
      } catch {
        // Certains navigateurs interdisent d'écrire location d'une popup
        // cross-origin déjà naviguée — on ouvre une nouvelle fenêtre.
        window.open(payUrl, "camerpay");
      }
      const result = await pollWithPopup(supabase, transactionUuid, popup);
      if (!popup.closed) popup.close();
      return result;
    }

    // Fenêtre bloquée → repli redirection pleine page ; la page /premium/callback
    // reprend le polling au retour.
    if (typeof window !== "undefined") {
      try {
        sessionStorage.setItem(
          PENDING_PAYMENT_KEY,
          JSON.stringify({ transactionUuid, planLabel: ctx?.planLabel ?? "" }),
        );
      } catch {
        // sessionStorage indisponible : le callback lira le statut au retour.
      }
      window.location.assign(payUrl);
    }
    return { outcome: "pending", providerRef: transactionUuid };
  },
};
