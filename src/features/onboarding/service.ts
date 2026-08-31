import { type createClient } from "@/services/supabase/client";
import { looksLikeContactInfo } from "@/features/messaging/contact-guard";
import { type OnboardingData } from "./types";

type Client = ReturnType<typeof createClient>;

export interface InterestOption {
  id: string;
  label: string;
  icon: string | null;
}
export interface CountryOption {
  key: string;
  label: string;
  emoji: string | null;
}

export async function fetchInterests(
  client: Client,
): Promise<InterestOption[]> {
  const { data, error } = await client
    .from("interests")
    .select("id, label, icon")
    .eq("is_active", true)
    .order("sort_order");
  if (error) throw error;
  return data ?? [];
}

export async function fetchCountries(client: Client): Promise<CountryOption[]> {
  const { data, error } = await client
    .from("countries")
    .select("key, label, emoji")
    .eq("is_active", true)
    .order("sort_order");
  if (error) throw error;
  return data ?? [];
}

/** Entrée générique d'un catalogue de référence (langues, religion…). */
export interface CatalogOption {
  id: string;
  label: string;
  subtitle?: string | null;
}

async function fetchCatalog(
  client: Client,
  table: "languages" | "religions" | "education_levels",
): Promise<CatalogOption[]> {
  const { data, error } = await client
    .from(table)
    .select("id, label")
    .eq("is_active", true)
    .order("sort_order");
  if (error) throw error;
  return data ?? [];
}

export const fetchLanguages = (c: Client) => fetchCatalog(c, "languages");
export const fetchReligions = (c: Client) => fetchCatalog(c, "religions");
export const fetchEducationLevels = (c: Client) =>
  fetchCatalog(c, "education_levels");

export async function fetchRelationshipGoals(
  client: Client,
): Promise<CatalogOption[]> {
  const { data, error } = await client
    .from("relationship_goals")
    .select("id, label, subtitle")
    .eq("is_active", true)
    .order("sort_order");
  if (error) throw error;
  return data ?? [];
}

/**
 * Écrit le profil final et marque l'onboarding terminé. `profile_completed`
 * est recalculé par trigger (bio + 3 intérêts + 2 photos + lifestyle…) —
 * il ne bascule à true que lorsque tous les critères sont réunis.
 */
export async function persistOnboarding(
  client: Client,
  userId: string,
  data: OnboardingData,
): Promise<void> {
  const displayName = data.displayName.trim();
  const privateName = data.privateName.trim();
  const profession = data.profession.trim();

  // Garde-fou : jamais de coordonnées en bio (numéro / pseudo de messagerie).
  if (looksLikeContactInfo(data.bio)) {
    throw new Error("BIO_CONTAINS_CONTACT");
  }

  const { error: profileError } = await client
    .from("profiles")
    .update({
      first_name: displayName || null,
      last_name: privateName || null,
      gender: data.gender,
      looking_for: data.lookingFor,
      birth_date: data.birthDate,
      country: data.country,
      city: data.city,
      height_cm: data.heightCm,
      profession: profession || null,
      education_level_id: data.educationLevelId,
      religion_id: data.religionId,
      relationship_goal_id: data.relationshipGoalId,
      bio: data.bio.trim(),
      smoking: data.smoking,
      drinking: data.drinking,
      gym_habit: data.gymHabit,
      has_pets: data.hasPets,
      wants_children: data.wantsChildren,
      onboarding_completed: true,
    })
    .eq("id", userId);
  if (profileError) throw profileError;

  // Remplace intégralement les sélections liées (idempotent).
  {
    const { error } = await client
      .from("profile_interests")
      .delete()
      .eq("profile_id", userId);
    if (error) throw error;
    if (data.interestIds.length > 0) {
      const { error: insError } = await client.from("profile_interests").insert(
        data.interestIds.map((interest_id) => ({
          profile_id: userId,
          interest_id,
        })),
      );
      if (insError) throw insError;
    }
  }
  {
    const { error } = await client
      .from("profile_languages")
      .delete()
      .eq("profile_id", userId);
    if (error) throw error;
    if (data.languageIds.length > 0) {
      const { error: insError } = await client.from("profile_languages").insert(
        data.languageIds.map((language_id) => ({
          profile_id: userId,
          language_id,
        })),
      );
      if (insError) throw insError;
    }
  }
}

/**
 * Téléverse une photo de profil via l'Edge Function `upload-photo` (écriture
 * S3 côté serveur). Nécessite que la fonction soit déployée avec ses secrets.
 */
export async function uploadProfilePhoto(
  client: Client,
  file: Blob,
  position: number,
): Promise<{ url: string }> {
  const { data, error } = await client.functions.invoke("upload-photo", {
    body: file,
    headers: {
      "x-upload-mode": "add",
      "x-upload-position": String(position),
      "Content-Type": "image/jpeg",
    },
  });
  if (error) throw error;
  return data as { url: string };
}
