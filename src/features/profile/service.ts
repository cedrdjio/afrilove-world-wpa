import { type createClient } from "@/services/supabase/client";
import { type Database } from "@/types/database";
import { type Profile, type ProfilePhoto } from "./types";

type Client = ReturnType<typeof createClient>;
type ProfileUpdate = Database["public"]["Tables"]["profiles"]["Update"];

const PROFILE_SELECT = `
  *,
  profile_photos (id, url, position, is_primary),
  profile_interests (interest_id),
  profile_languages (language_id)
`;

/* eslint-disable @typescript-eslint/no-explicit-any */
// PostgREST's embedded-relation select string isn't representable in the
// generated Database types, so the raw row is normalized here into the strict
// `Profile` shape (port de `mapProfileRow`).
function mapProfileRow(row: any): Profile {
  return {
    id: row.id,
    email: row.email ?? null,
    firstName: row.first_name ?? null,
    lastName: row.last_name ?? null,
    gender: row.gender ?? null,
    lookingFor: row.looking_for ?? null,
    birthDate: row.birth_date ?? null,
    bio: row.bio ?? null,
    heightCm: row.height_cm ?? null,
    profession: row.profession ?? null,
    country: row.country ?? null,
    city: row.city ?? null,
    latitude: row.latitude ?? null,
    longitude: row.longitude ?? null,
    avatarUrl: row.avatar_url ?? null,
    educationLevelId: row.education_level_id ?? null,
    religionId: row.religion_id ?? null,
    relationshipGoalId: row.relationship_goal_id ?? null,
    smoking: row.smoking ?? null,
    drinking: row.drinking ?? null,
    gymHabit: row.gym_habit ?? null,
    hasPets: row.has_pets ?? null,
    wantsChildren: row.wants_children ?? null,
    onboardingCompleted: row.onboarding_completed ?? false,
    profileCompleted: row.profile_completed ?? false,
    accountStatus: (row.account_status as Profile["accountStatus"]) ?? "active",
    statusReason: row.status_reason ?? null,
    isVerified: row.is_verified ?? false,
    lastActiveAt: row.last_active_at ?? null,
    locationUpdatedAt: row.location_updated_at ?? null,
    photos: (row.profile_photos ?? [])
      .map((p: any) => ({
        id: p.id,
        url: p.url,
        position: p.position,
        isPrimary: p.is_primary,
      }))
      .sort(
        (a: { position: number }, b: { position: number }) =>
          a.position - b.position,
      ),
    interestIds: (row.profile_interests ?? []).map((i: any) => i.interest_id),
    languageIds: (row.profile_languages ?? []).map((l: any) => l.language_id),
    createdAt: row.created_at ?? "",
    updatedAt: row.updated_at ?? "",
  };
}

export async function fetchOwnProfile(
  client: Client,
  userId: string,
): Promise<Profile> {
  const { data, error } = await client
    .from("profiles")
    .select(PROFILE_SELECT)
    .eq("id", userId)
    .single();
  if (error) throw error;
  return mapProfileRow(data);
}

/**
 * Profil d'un autre membre via le RPC `get_public_profile` — la RLS de
 * `profiles` est owner-only. Le RPC expose une liste de colonnes filtrée (pas
 * d'e-mail ni de coordonnées, âge au lieu de la date) et seulement les profils
 * actifs et complets. Port de `fetchPublicProfile`.
 */
export async function fetchPublicProfile(
  client: Client,
  profileId: string,
): Promise<Profile> {
  const { data, error } = await client.rpc("get_public_profile", {
    p_profile_id: profileId,
  });
  if (error) throw error;
  const row = (data as any[])?.[0];
  if (!row) throw new Error("Profil introuvable ou indisponible.");

  // 1er janvier de (annéeCourante - âge) redonne exactement `age`, ce qui
  // permet au pipeline d'affichage partagé de fonctionner sans la vraie date.
  const syntheticBirthDate =
    row.age != null ? `${new Date().getFullYear() - row.age}-01-01` : null;

  return {
    id: row.id,
    email: null,
    firstName: row.first_name ?? null,
    lastName: null,
    gender: row.gender ?? null,
    lookingFor: null,
    birthDate: syntheticBirthDate,
    bio: row.bio ?? null,
    heightCm: row.height_cm ?? null,
    profession: row.profession ?? null,
    country: row.country ?? null,
    city: row.city ?? null,
    latitude: null,
    longitude: null,
    avatarUrl: row.avatar_url ?? null,
    educationLevelId: row.education_level_id ?? null,
    religionId: row.religion_id ?? null,
    relationshipGoalId: null,
    smoking: (row.smoking as Profile["smoking"]) ?? null,
    drinking: (row.drinking as Profile["drinking"]) ?? null,
    gymHabit: (row.gym_habit as Profile["gymHabit"]) ?? null,
    hasPets: (row.has_pets as Profile["hasPets"]) ?? null,
    wantsChildren: (row.wants_children as Profile["wantsChildren"]) ?? null,
    onboardingCompleted: true,
    profileCompleted: true,
    accountStatus: "active",
    statusReason: null,
    isVerified: row.is_verified ?? false,
    lastActiveAt: row.last_active_at ?? null,
    locationUpdatedAt: null,
    distanceKm: row.distance_km ?? null,
    photos: (row.photo_urls ?? []).map((url: string, index: number) => ({
      id: url,
      url,
      position: index,
      isPrimary: index === 0,
    })),
    interestIds: row.interest_ids ?? [],
    languageIds: row.language_ids ?? [],
    createdAt: "",
    updatedAt: "",
  };
}
/* eslint-enable @typescript-eslint/no-explicit-any */

export async function updateProfile(
  client: Client,
  userId: string,
  patch: ProfileUpdate,
): Promise<void> {
  const { error } = await client
    .from("profiles")
    .update(patch)
    .eq("id", userId);
  if (error) throw error;
}

/** Remplace intégralement la sélection d'intérêts (idempotent). */
export async function setInterests(
  client: Client,
  userId: string,
  interestIds: string[],
): Promise<void> {
  const { error: delError } = await client
    .from("profile_interests")
    .delete()
    .eq("profile_id", userId);
  if (delError) throw delError;
  if (interestIds.length === 0) return;
  const { error: insError } = await client.from("profile_interests").insert(
    interestIds.map((interestId) => ({
      profile_id: userId,
      interest_id: interestId,
    })),
  );
  if (insError) throw insError;
}

/** Remplace intégralement la sélection de langues (idempotent). */
export async function setLanguages(
  client: Client,
  userId: string,
  languageIds: string[],
): Promise<void> {
  const { error: delError } = await client
    .from("profile_languages")
    .delete()
    .eq("profile_id", userId);
  if (delError) throw delError;
  if (languageIds.length === 0) return;
  const { error: insError } = await client.from("profile_languages").insert(
    languageIds.map((languageId) => ({
      profile_id: userId,
      language_id: languageId,
    })),
  );
  if (insError) throw insError;
}

/**
 * Écriture d'une photo via l'Edge Function `upload-photo` (écriture S3 côté
 * serveur ; la fonction dérive le profil du JWT). Mode `add` ou `replace`.
 */
export async function uploadPhoto(
  client: Client,
  input:
    | { mode: "add"; file: Blob; position: number }
    | { mode: "replace"; file: Blob; photoId: string },
): Promise<ProfilePhoto> {
  const headers: Record<string, string> = {
    "x-upload-mode": input.mode,
    "Content-Type": "image/jpeg",
  };
  if (input.mode === "add")
    headers["x-upload-position"] = String(input.position);
  else headers["x-upload-photo-id"] = input.photoId;

  const { data, error } = await client.functions.invoke("upload-photo", {
    body: input.file,
    headers,
  });
  if (error) throw error;
  const row = data as {
    id: string;
    url: string;
    position: number;
    is_primary: boolean;
  };
  return {
    id: row.id,
    url: row.url,
    position: row.position,
    isPrimary: row.is_primary,
  };
}

export async function deletePhoto(
  client: Client,
  photoId: string,
): Promise<void> {
  const { error } = await client
    .from("profile_photos")
    .delete()
    .eq("id", photoId);
  if (error) throw error;
}

/**
 * Persiste un ré-ordonnancement complet ; la première photo devient la
 * principale (donc l'avatar, via trigger). Séquentiel : le trigger
 * `is_primary` touche les lignes voisines (risque de blocage en parallèle).
 */
export async function reorderPhotos(
  client: Client,
  photos: ProfilePhoto[],
): Promise<void> {
  for (const [index, photo] of photos.entries()) {
    const { error } = await client
      .from("profile_photos")
      .update({ position: index, is_primary: index === 0 })
      .eq("id", photo.id);
    if (error) throw error;
  }
}

export interface ProfileStats {
  viewsCount: number;
  likesReceived: number;
  matchesCount: number;
  matchRate: number;
}

/** Vues / likes reçus / matches / taux — calculés par `get_my_profile_stats`. */
export async function fetchProfileStats(client: Client): Promise<ProfileStats> {
  const { data, error } = await client.rpc("get_my_profile_stats");
  if (error) throw error;
  const row = (data as any[])?.[0]; // eslint-disable-line @typescript-eslint/no-explicit-any
  return {
    viewsCount: row?.views_count ?? 0,
    likesReceived: row?.likes_received ?? 0,
    matchesCount: row?.matches_count ?? 0,
    matchRate: row?.match_rate ?? 0,
  };
}

/** Alimente le compteur « Vues » — best effort, jamais bloquant. */
export async function recordProfileView(
  client: Client,
  profileId: string,
): Promise<void> {
  const { error } = await client.rpc("record_profile_view", {
    p_profile_id: profileId,
  });
  if (error) throw error;
}
