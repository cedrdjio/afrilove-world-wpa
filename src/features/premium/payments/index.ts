import { camerpayProvider } from "./camerpay-provider";
import type {
  CheckoutContext,
  CheckoutInput,
  PaymentProvider,
  PaymentResult,
  SupabaseLike,
} from "./types";

/**
 * Registre des fournisseurs. Ajouter Google Play / App Store / Stripe natif se
 * fait ici en une ligne + le fichier d'implémentation — rien d'autre ne bouge.
 * L'ordre compte : `selectProvider` prend le premier disponible.
 */
const PROVIDERS: PaymentProvider[] = [camerpayProvider];

async function selectProvider(): Promise<PaymentProvider> {
  for (const provider of PROVIDERS) {
    if (await provider.isAvailable()) return provider;
  }
  throw new Error("Aucun moyen de paiement n'est disponible pour le moment.");
}

async function checkout(
  supabase: SupabaseLike,
  input: CheckoutInput,
  ctx?: CheckoutContext,
): Promise<PaymentResult> {
  const provider = await selectProvider();
  return provider.checkout(supabase, input, ctx);
}

export const paymentService = { checkout, selectProvider };

export { camerpayProvider } from "./camerpay-provider";
export type {
  PaymentProvider,
  PaymentResult,
  PaymentOutcome,
  CheckoutInput,
  CheckoutContext,
  CheckoutMethod,
} from "./types";
