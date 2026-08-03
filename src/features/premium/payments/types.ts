/**
 * Abstraction paiement — un contrat stable, plusieurs fournisseurs.
 *
 * L'app ne parle jamais directement à un fournisseur : elle demande à
 * `paymentService` de régler un plan et récupère un résultat normalisé.
 * CamerPay (mobile money Afrique centrale/ouest) est l'implémentation actuelle ;
 * Stripe, Google Play ou l'App Store se branchent comme fournisseurs
 * supplémentaires, sélectionnés par région, sans toucher aux écrans.
 */

export type PaymentOutcome =
  | "succeeded" // premium accordé (ou sur le point de l'être) côté serveur
  | "pending" // payé/laissé ouvert — le serveur confirmera sous peu
  | "canceled" // l'utilisateur a abandonné avant de payer
  | "failed"; // le fournisseur a rejeté ou le paiement a échoué

export interface PaymentResult {
  outcome: PaymentOutcome;
  /** Référence fournisseur (ex. transaction_uuid CamerPay), pour le support. */
  providerRef?: string;
}

/** Méthodes acceptées par CamerPay (cf. OpenAPI /api/payment/initiate). */
export type CheckoutMethod = "mtn_momo" | "orange_money" | "stripe" | "paypal";

export interface CheckoutInput {
  /** Correspond à `premium_plans.key` en base. */
  planKey: string;
  /** Méthode choisie : mobile money (détecté depuis le numéro), carte, PayPal. */
  paymentMethod: CheckoutMethod;
  /** Numéro Mobile Money du payeur (9 chiffres) — requis pour momo/orange. */
  phone?: string;
}

export interface PaymentProvider {
  /** Id stable, miroir de `subscriptions.provider` (ex. 'camerpay'). */
  readonly id: string;
  /** Ce fournisseur peut-il s'exécuter maintenant (appareil/région) ? */
  isAvailable(): Promise<boolean>;
  /** Exécute tout le checkout et résout une fois le résultat connu. */
  checkout(input: CheckoutInput): Promise<PaymentResult>;
}
