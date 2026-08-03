import { db } from "@/services/supabase/browser";

/** Statistiques du profil connecté (« Mon profil »). */
export interface ProfileStats {
  views: number;
  likes: number;
  matches: number;
  /** Taux de match (0–100), déjà calculé côté serveur. */
  matchRate: number;
}

async function fetchStats(): Promise<ProfileStats> {
  const { data, error } = await db().rpc("get_my_profile_stats");
  if (error) throw error;
  const row = data?.[0];
  return {
    views: row?.views_count ?? 0,
    likes: row?.likes_received ?? 0,
    matches: row?.matches_count ?? 0,
    matchRate: row?.match_rate ?? 0,
  };
}

export const profileService = {
  fetchStats,
};
