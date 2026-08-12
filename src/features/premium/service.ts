import { db } from "@/services/supabase/browser";

import { paymentService } from "./payments";
import type { CheckoutInput, PaymentResult } from "./payments";

export interface PremiumPlan {
  key: string;
  label: string;
  description: string | null;
  priceCents: number;
  currency: string;
  durationDays: number;
  sortOrder: number;
}

export interface Entitlements {
  isPremium: boolean;
  premiumUntil: string | null;
  planLabel: string | null;
  likesUsedToday: number;
  /** null = illimité */
  likesLimit: number | null;
  superLikesUsedToday: number;
  superLikesLimit: number;
  likersCount: number;
  swipesUsedToday: number;
  /** null = illimité (premium) */
  swipesLimit: number | null;
  favoritesCount: number;
  /** null = illimité (premium) */
  favoritesLimit: number | null;
}

export interface LikerProfile {
  id: string;
  firstName: string;
  avatarUrl: string | null;
  city: string | null;
  isVerified: boolean;
  action: "like" | "super_like";
  likedAt: string;
}

export interface FavoriteProfile extends LikerProfile {
  isMatched: boolean;
}

async function fetchPlans(): Promise<PremiumPlan[]> {
  const { data, error } = await db()
    .from("premium_plans")
    .select(
      "key, label, description, price_cents, currency, duration_days, sort_order",
    )
    .eq("is_active", true)
    .order("sort_order");
  if (error) throw error;
  return (data ?? []).map((row) => ({
    key: row.key,
    label: row.label,
    description: row.description,
    priceCents: row.price_cents,
    currency: row.currency,
    durationDays: row.duration_days,
    sortOrder: row.sort_order,
  }));
}

async function fetchEntitlements(): Promise<Entitlements> {
  const { data, error } = await db().rpc("get_my_entitlements");
  if (error) throw error;
  const row = data?.[0];
  return {
    isPremium: row?.is_premium ?? false,
    premiumUntil: row?.premium_until ?? null,
    planLabel: row?.plan_label ?? null,
    likesUsedToday: row?.likes_used_today ?? 0,
    likesLimit: row?.likes_limit ?? null,
    superLikesUsedToday: row?.super_likes_used_today ?? 0,
    superLikesLimit: row?.super_likes_limit ?? 0,
    likersCount: row?.likers_count ?? 0,
    swipesUsedToday: row?.swipes_used_today ?? 0,
    swipesLimit: row?.swipes_limit ?? null,
    favoritesCount: row?.favorites_count ?? 0,
    favoritesLimit: row?.favorites_limit ?? null,
  };
}

/**
 * Achat réel : ouvre le checkout du fournisseur actif (CamerPay aujourd'hui)
 * et résout un résultat normalisé. Le premium est accordé côté serveur par le
 * webhook du fournisseur ; l'appelant route sur `outcome`.
 */
async function purchasePlan(input: CheckoutInput): Promise<PaymentResult> {
  return paymentService.checkout(input);
}

async function fetchFavorites(): Promise<FavoriteProfile[]> {
  const { data, error } = await db().rpc("get_my_favorites");
  if (error) throw error;
  return (data ?? []).map((row) => ({
    id: row.profile_id,
    firstName: row.first_name ?? "",
    avatarUrl: row.avatar_url,
    city: row.city,
    isVerified: row.is_verified,
    action: row.action as "like" | "super_like",
    likedAt: row.liked_at,
    isMatched: row.is_matched,
  }));
}

/** Vide pour les comptes non-premium (imposé par la RPC elle-même). */
async function fetchLikers(): Promise<LikerProfile[]> {
  const { data, error } = await db().rpc("get_my_likers");
  if (error) throw error;
  return (data ?? []).map((row) => ({
    id: row.profile_id,
    firstName: row.first_name ?? "",
    avatarUrl: row.avatar_url,
    city: row.city,
    isVerified: row.is_verified,
    action: row.action as "like" | "super_like",
    likedAt: row.liked_at,
  }));
}

export const premiumService = {
  fetchPlans,
  fetchEntitlements,
  purchasePlan,
  fetchFavorites,
  fetchLikers,
};
