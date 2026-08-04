/**
 * Abstraction de paiement — un contrat stable, plusieurs fournisseurs.
 * Port de `premium/payments/types.ts` (mobile). L'app ne parle jamais
 * directement à un fournisseur : elle demande un paiement à `paymentService`
 * et reçoit un résultat normalisé. CamerPay (mobile money + carte/PayPal via
 * page hébergée) est la seule implémentation aujourd'hui.
 */

export type PaymentOutcome =
  | "succeeded" // premium accordé (ou sur le point de l'être) côté serveur
  | "pending" // payé / laissé ouvert — le serveur confirmera bientôt
  | "canceled" // l'utilisateur a abandonné avant de payer
  | "failed"; // le fournisseur a rejeté ou le paiement a échoué

export interface PaymentResult {
  outcome: PaymentOutcome;
  /** Référence côté fournisseur (transaction_uuid CamerPay), pour le support. */
  providerRef?: string;
}

/** Méthodes acceptées par CamerPay (cf. OpenAPI /api/payment/initiate). */
export type CheckoutMethod = "mtn_momo" | "orange_money" | "stripe" | "paypal";

export interface CheckoutInput {
  /** Correspond à `premium_plans.key` en base. */
  planKey: string;
  /** Méthode choisie : mobile money, carte via Stripe, ou PayPal. */
  paymentMethod: CheckoutMethod;
  /** Numéro Mobile Money du payeur (9 chiffres) — requis pour mtn/orange only. */
  phone?: string;
}

/**
 * Contexte web du paiement. Le web n'a pas d'`openAuthSessionAsync` (in-app
 * browser + deep link) : on ouvre une fenêtre CamerPay et on interroge notre
 * propre statut. La fenêtre DOIT être ouverte dans le geste utilisateur (sinon
 * bloquée) — l'écran l'ouvre donc et la passe ici ; `null` = repli redirection.
 */
export interface CheckoutContext {
  popup?: Window | null;
  /** Libellé du forfait, conservé pour la page de retour (repli redirection). */
  planLabel?: string;
}

export interface PaymentProvider {
  /** Identifiant stable, miroir de `subscriptions.provider`. */
  readonly id: string;
  /** Disponibilité du fournisseur dans le contexte courant. */
  isAvailable(): Promise<boolean>;
  /** Déroule le paiement complet et résout une fois l'issue connue. */
  checkout(
    supabase: SupabaseLike,
    input: CheckoutInput,
    ctx?: CheckoutContext,
  ): Promise<PaymentResult>;
}

/** Client Supabase (structurel) — évite un import circulaire vers le service. */
export type SupabaseLike = ReturnType<
  typeof import("@/services/supabase/client").createClient
>;
