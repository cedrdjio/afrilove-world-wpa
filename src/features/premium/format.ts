/**
 * Formatage des prix des plans premium. Les montants viennent de la table
 * `premium_plans` (price_cents + currency). Les devises sans sous-unité
 * (XAF/XOF — francs CFA) sont affichées sans décimales.
 */
const ZERO_DECIMAL = new Set(["XAF", "XOF", "JPY", "KRW"]);

function toMajor(priceCents: number, currency: string): number {
  return ZERO_DECIMAL.has(currency) ? priceCents : priceCents / 100;
}

export function formatPlanPrice(priceCents: number, currency: string): string {
  const amount = toMajor(priceCents, currency);
  try {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency,
      maximumFractionDigits: ZERO_DECIMAL.has(currency) ? 0 : 2,
    }).format(amount);
  } catch {
    return `${amount} ${currency}`;
  }
}

/** Prix ramené au mois (arrondi) — pour le « / mois » des cartes tarif. */
export function formatPerMonth(
  priceCents: number,
  currency: string,
  durationDays: number,
): string {
  const months = Math.max(1, Math.round(durationDays / 30));
  const perMonthCents = priceCents / months;
  return formatPlanPrice(Math.round(perMonthCents), currency);
}
