import { camerpayProvider } from "./camerpay-provider";
import type { CheckoutInput, PaymentProvider, PaymentResult } from "./types";

/**
 * Registre des fournisseurs. Ajouter un fournisseur (Stripe, Google Play,
 * App Store) = une ligne ici + son fichier d'implémentation, rien d'autre ne
 * bouge. L'ordre compte : `selectProvider` prend le premier disponible.
 */
const PROVIDERS: PaymentProvider[] = [camerpayProvider];

async function selectProvider(): Promise<PaymentProvider> {
  for (const provider of PROVIDERS) {
    if (await provider.isAvailable()) return provider;
  }
  throw new Error("Aucun moyen de paiement n'est disponible pour le moment.");
}

async function checkout(input: CheckoutInput): Promise<PaymentResult> {
  const provider = await selectProvider();
  return provider.checkout(input);
}

export const paymentService = {
  checkout,
  selectProvider,
};
