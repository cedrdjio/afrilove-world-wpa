import { type createClient } from "@/services/supabase/client";

type Client = ReturnType<typeof createClient>;

/**
 * Droits & compteurs du compte — port partiel de `premiumService` (mobile),
 * limité à la LECTURE dont la Découverte et Mes Matches ont besoin au Jalon 8
 * (compteur de swipes, limites gratuites, « qui vous a aimé »). Les forfaits,
 * le paiement CamerPay et le déverrouillage relèvent du Jalon 11.
 */
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

export async function fetchEntitlements(
  supabase: Client,
): Promise<Entitlements> {
  const { data, error } = await supabase.rpc("get_my_entitlements");
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

/** Vide pour les comptes non-premium (appliqué dans la RPC elle-même). */
export async function fetchLikers(supabase: Client): Promise<LikerProfile[]> {
  const { data, error } = await supabase.rpc("get_my_likers");
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
