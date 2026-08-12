import { db } from "@/services/supabase/browser";
import { DISTANCE_MAX_KM } from "./filters-store";
import type {
  DiscoveryCountry,
  DiscoveryFilters,
  DiscoveryProfile,
  SwipeAction,
} from "./types";

const DECK_SIZE = 25;

/** N'impose une distance que si le curseur est sous le plafond. */
function distanceParam(maxDistanceKm?: number): number | undefined {
  if (maxDistanceKm == null || maxDistanceKm >= DISTANCE_MAX_KM)
    return undefined;
  return maxDistanceKm;
}

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
    p_max_distance_km: distanceParam(filters.maxDistanceKm),
    p_limit: DECK_SIZE,
  });
  if (error) throw error;
  return (data ?? []).map(mapRow);
}

/** Nombre de profils correspondant aux filtres — bouton « Voir N profils ». */
async function countProfiles(
  filters: Pick<
    DiscoveryFilters,
    | "ageMin"
    | "ageMax"
    | "scope"
    | "country"
    | "verifiedOnly"
    | "interestIds"
    | "maxDistanceKm"
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
    p_max_distance_km: distanceParam(filters.maxDistanceKm),
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
): Promise<{ isMatch: boolean; matchId: string | null }> {
  const supabase = db();
  const { error } = await supabase
    .from("swipes")
    .upsert(
      { swiper_id: swiperId, target_id: targetId, action },
      { onConflict: "swiper_id,target_id" },
    );
  if (error) throw error;

  if (action === "pass") return { isMatch: false, matchId: null };

  const [a, b] =
    swiperId < targetId ? [swiperId, targetId] : [targetId, swiperId];
  const { data: match, error: matchError } = await supabase
    .from("matches")
    .select("id")
    .eq("profile_a", a)
    .eq("profile_b", b)
    .maybeSingle();
  if (matchError) throw matchError;

  return { isMatch: Boolean(match), matchId: match?.id ?? null };
}

/** Un centre d'intérêt affichable — libellé + nom d'icône Lucide (table `interests`). */
export interface ProfileInterest {
  label: string;
  icon: string | null;
}

/** Fiche publique détaillée d'un profil (« 05 »), via `get_public_profile`. */
export interface PublicProfileView {
  id: string;
  firstName: string;
  age: number;
  photos: string[];
  verified: boolean;
  /** Actif à l'instant (dernier heartbeat < 5 min) → badge « En temps réel ». */
  online: boolean;
  gender: string | null;
  city: string | null;
  country: string | null;
  distanceKm: number | null;
  heightCm: number | null;
  bio: string | null;
  profession: string | null;
  /** Libellés résolus des catalogues de référence (null si non renseigné). */
  education: string | null;
  religion: string | null;
  /** Modes de vie (valeurs d'énum brutes ; résolues en libellés côté vue). */
  smoking: string | null;
  drinking: string | null;
  gymHabit: string | null;
  hasPets: string | null;
  wantsChildren: string | null;
  interests: ProfileInterest[];
  languages: string[];
  lastActiveAt: string | null;
}

/** Seuil de présence « temps réel » : dernier signe de vie il y a moins de 5 min. */
const ONLINE_WINDOW_MS = 5 * 60_000;

function isOnline(lastActiveAt: string | null): boolean {
  if (!lastActiveAt) return false;
  return Date.now() - new Date(lastActiveAt).getTime() < ONLINE_WINDOW_MS;
}

async function fetchPublicProfile(
  id: string,
): Promise<PublicProfileView | null> {
  const supabase = db();
  const { data, error } = await supabase.rpc("get_public_profile", {
    p_profile_id: id,
  });
  if (error) throw error;
  const row = data?.[0];
  if (!row) return null;

  let interests: ProfileInterest[] = [];
  const ids = row.interest_ids ?? [];
  if (ids.length) {
    const { data: rows } = await supabase
      .from("interests")
      .select("id, label, icon, sort_order")
      .in("id", ids)
      .order("sort_order");
    interests = (rows ?? []).map((r) => ({ label: r.label, icon: r.icon }));
  }

  // Langues — libellés ordonnés depuis le catalogue de référence.
  let languages: string[] = [];
  const languageIds = row.language_ids ?? [];
  if (languageIds.length) {
    const { data: rows } = await supabase
      .from("languages")
      .select("id, label, sort_order")
      .in("id", languageIds)
      .order("sort_order");
    languages = (rows ?? []).map((r) => r.label);
  }

  // Religion / niveau d'études — un seul libellé chacun (résolu à la volée).
  const [education, religion] = await Promise.all([
    resolveCatalogLabel(supabase, "education_levels", row.education_level_id),
    resolveCatalogLabel(supabase, "religions", row.religion_id),
  ]);

  const lastActiveAt = row.last_active_at ?? null;
  return {
    id: row.id,
    firstName: row.first_name ?? "",
    age: row.age,
    photos: row.photo_urls ?? [],
    verified: row.is_verified,
    online: isOnline(lastActiveAt),
    gender: row.gender ?? null,
    city: row.city,
    country: row.country,
    distanceKm: row.distance_km,
    heightCm: row.height_cm ?? null,
    bio: row.bio,
    profession: row.profession,
    education,
    religion,
    smoking: row.smoking ?? null,
    drinking: row.drinking ?? null,
    gymHabit: row.gym_habit ?? null,
    hasPets: row.has_pets ?? null,
    wantsChildren: row.wants_children ?? null,
    interests,
    languages,
    lastActiveAt,
  };
}

/** Résout le libellé d'une entrée de catalogue (religion, études). */
async function resolveCatalogLabel(
  supabase: ReturnType<typeof db>,
  table: "religions" | "education_levels",
  id: string | null | undefined,
): Promise<string | null> {
  if (!id) return null;
  const { data } = await supabase
    .from(table)
    .select("label")
    .eq("id", id)
    .maybeSingle();
  return data?.label ?? null;
}

/** Journalise une vue de profil (alimente les stats « vues »). */
async function recordView(id: string): Promise<void> {
  const { error } = await db().rpc("record_profile_view", { p_profile_id: id });
  if (error) throw error;
}

/** Centre d'intérêt sélectionnable dans les filtres. */
export interface InterestOption {
  id: string;
  label: string;
  icon: string | null;
}

/** Liste des centres d'intérêt actifs (filtres Découverte). */
async function fetchInterests(): Promise<InterestOption[]> {
  const { data, error } = await db()
    .from("interests")
    .select("id, label, icon")
    .eq("is_active", true)
    .order("sort_order");
  if (error) throw error;
  return data ?? [];
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
  fetchPublicProfile,
  recordView,
  searchByText,
  fetchInterests,
};
