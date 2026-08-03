import { db } from "@/services/supabase/browser";
import type {
  DiscoveryCountry,
  DiscoveryFilters,
  DiscoveryProfile,
  SwipeAction,
} from "./types";

const DECK_SIZE = 25;

interface SearchProfilesRow {
  id: string;
  first_name: string | null;
  age: number;
  city: string | null;
  country: string | null;
  bio: string | null;
  is_verified: boolean;
  avatar_url: string | null;
  distance_km: number | null;
  compatibility: number;
  interest_names: string[] | null;
  last_active_at: string | null;
}

function mapRow(row: SearchProfilesRow): DiscoveryProfile {
  return {
    id: row.id,
    firstName: row.first_name ?? "",
    age: row.age,
    city: row.city,
    country: row.country,
    bio: row.bio,
    isVerified: row.is_verified,
    avatarUrl: row.avatar_url,
    distanceKm: row.distance_km,
    compatibility: row.compatibility,
    interestNames: row.interest_names ?? [],
    lastActiveAt: row.last_active_at ?? null,
  };
}

async function searchProfiles(
  filters: DiscoveryFilters,
): Promise<DiscoveryProfile[]> {
  const { data, error } = await db().rpc("search_profiles", {
    p_age_min: filters.ageMin,
    p_age_max: filters.ageMax,
    p_verified_only: filters.verifiedOnly,
    p_new_only: filters.mode === "new",
    p_online_recently: filters.mode === "online",
    p_interest_ids: filters.interestIds?.length
      ? filters.interestIds
      : undefined,
    p_scope: filters.scope,
    p_country:
      filters.scope === "country" ? (filters.country ?? undefined) : undefined,
    p_limit: DECK_SIZE,
  });
  if (error) throw error;
  return (data ?? []).map(mapRow);
}

/** Nombre de profils correspondant aux filtres — bouton « Voir N profils ». */
async function countProfiles(
  filters: Pick<
    DiscoveryFilters,
    "ageMin" | "ageMax" | "scope" | "country" | "verifiedOnly" | "interestIds"
  >,
): Promise<number> {
  const { data, error } = await db().rpc("count_search_profiles", {
    p_age_min: filters.ageMin,
    p_age_max: filters.ageMax,
    p_verified_only: filters.verifiedOnly,
    p_interest_ids: filters.interestIds?.length
      ? filters.interestIds
      : undefined,
    p_scope: filters.scope,
    p_country:
      filters.scope === "country" ? (filters.country ?? undefined) : undefined,
  });
  if (error) throw error;
  return data ?? 0;
}

/** Pays réellement représentés dans l'app — alimente le choix « pays précis ». */
async function fetchCountries(): Promise<DiscoveryCountry[]> {
  const { data, error } = await db().rpc("get_discovery_countries");
  if (error) throw error;
  return (data ?? []).map((row: { country: string; member_count: number }) => ({
    country: row.country,
    memberCount: row.member_count,
  }));
}

/**
 * Enregistre le swipe et signale s'il vient de compléter un like réciproque.
 * La ligne `matches` est créée par le trigger `sync_match_on_swipe` — on ne
 * fait qu'observer le résultat, un client ne peut donc jamais forger un match.
 */
async function swipe(
  swiperId: string,
  targetId: string,
  action: SwipeAction,
): Promise<{ isMatch: boolean }> {
  const supabase = db();
  const { error } = await supabase
    .from("swipes")
    .upsert(
      { swiper_id: swiperId, target_id: targetId, action },
      { onConflict: "swiper_id,target_id" },
    );
  if (error) throw error;

  if (action === "pass") return { isMatch: false };

  const [a, b] =
    swiperId < targetId ? [swiperId, targetId] : [targetId, swiperId];
  const { data: match, error: matchError } = await supabase
    .from("matches")
    .select("id")
    .eq("profile_a", a)
    .eq("profile_b", b)
    .maybeSingle();
  if (matchError) throw matchError;

  return { isMatch: Boolean(match) };
}

/** Recherche libre (nom / ville / pays) sur tout le vivier découvrable. */
async function searchByText(query: string): Promise<DiscoveryProfile[]> {
  const { data, error } = await db().rpc("search_profiles", {
    p_query: query,
    p_limit: 40,
  });
  if (error) throw error;
  return (data ?? []).map(mapRow);
}

export const discoveryService = {
  searchProfiles,
  countProfiles,
  fetchCountries,
  swipe,
  searchByText,
};
