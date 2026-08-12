/**
 * Clés des plans = `premium_plans.key` en base — c'est ce qui part dans l'achat
 * réel (usePurchasePlan → CamerPay). Les données (libellé, prix, durée) viennent
 * toujours de la table, jamais d'ici.
 */
export type PlanTone = "neutral" | "blue" | "red" | "orange" | "green" | "gold";

export const TONE_BY_PLAN_KEY: Record<string, PlanTone> = {
  discovery_1d: "blue",
  week_7d: "red",
  month_1m: "orange",
  quarter_3m: "green",
  year_1y: "gold",
};

/** Clé du plan mis en avant avec le badge « Meilleur ». */
export const BEST_PLAN_KEY = "year_1y";
