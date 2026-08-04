/**
 * Styles visuels des cartes tarifs — port de `premium/constants/plans.ts`
 * (mobile). Les données (libellé, prix, durée) viennent de `premium_plans`,
 * jamais d'ici. Toute la gamme reste dans la charte lavande.
 */
export type PlanTone = "neutral" | "blue" | "red" | "orange" | "green" | "gold";

// Les clés correspondent exactement à `premium_plans.key` en base.
export const TONE_BY_PLAN_KEY: Record<string, PlanTone> = {
  discovery_1d: "blue",
  week_7d: "red",
  month_1m: "orange",
  quarter_3m: "green",
  year_1y: "gold",
};

/** Clé du plan mis en avant avec le badge « Meilleur ». */
export const BEST_PLAN_KEY = "year_1y";

/** Plan présélectionné par défaut sur l'écran tarifs. */
export const DEFAULT_PLAN_KEY = "month_1m";

/** Peg FCFA fixe (BEAC) — miroir de l'edge function, pour afficher le montant. */
export const EUR_TO_XAF = 655.957;

export const PLAN_TONE_STYLES: Record<
  PlanTone,
  { bg: string; border: string; text: string; cta: string }
> = {
  neutral: {
    bg: "rgba(255,255,255,0.1)",
    border: "rgba(255,255,255,0.18)",
    text: "rgba(255,255,255,0.5)",
    cta: "rgba(255,255,255,0.14)",
  },
  blue: {
    bg: "rgba(195,177,225,0.12)",
    border: "rgba(195,177,225,0.3)",
    text: "#C3B1E1",
    cta: "rgba(195,177,225,0.3)",
  },
  red: {
    bg: "rgba(169,143,216,0.16)",
    border: "rgba(169,143,216,0.34)",
    text: "#A98FD8",
    cta: "rgba(169,143,216,0.38)",
  },
  orange: {
    bg: "rgba(155,126,222,0.2)",
    border: "rgba(155,126,222,0.4)",
    text: "#B9A2E8",
    cta: "rgba(155,126,222,0.42)",
  },
  green: {
    bg: "rgba(139,105,214,0.22)",
    border: "rgba(139,105,214,0.42)",
    text: "#8B69D6",
    cta: "rgba(139,105,214,0.45)",
  },
  gold: {
    bg: "rgba(155,126,222,0.28)",
    border: "rgba(155,126,222,0.55)",
    text: "#9B7EDE",
    cta: "rgba(155,126,222,0.5)",
  },
};

/** Prix lisible : « 9,99€ » / « 5000 XAF ». Port des helpers d'écran mobile. */
export function formatPrice(cents: number, currency: string): string {
  const amount = cents / 100;
  const symbol = currency === "EUR" ? "€" : ` ${currency}`;
  return `${Number.isInteger(amount) ? amount : amount.toFixed(2)}${symbol}`;
}

/** Durée lisible : « 24 heures » / « 7 jours » / « 3 mois » / « 1 an ». */
export function durationLabel(days: number): string {
  if (days === 1) return "24 heures";
  if (days < 30) return `${days} jours`;
  if (days < 365) return `${Math.round(days / 30)} mois`;
  return "1 an";
}

/** Montant XAF (FCFA) affiché à partir des cents EUR du forfait. */
export function amountXafFromCents(priceCents: number): number {
  return Math.round((priceCents / 100) * EUR_TO_XAF);
}

/** Format FCFA groupé : « 6 550 FCFA ». */
export function formatXaf(amount: number): string {
  return amount.toLocaleString("fr-FR");
}
