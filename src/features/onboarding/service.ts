import { type createClient } from "@/services/supabase/client";
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
  const { error: profileError } = await client
    .from("profiles")
    .update({
      gender: data.gender,
      looking_for: data.lookingFor,
      birth_date: data.birthDate,
      country: data.country,
      city: data.city,
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

  // Remplace intégralement la sélection d'intérêts (idempotent).
  const { error: delError } = await client
    .from("profile_interests")
    .delete()
    .eq("profile_id", userId);
  if (delError) throw delError;

  if (data.interestIds.length > 0) {
    const { error: insError } = await client.from("profile_interests").insert(
      data.interestIds.map((interestId) => ({
        profile_id: userId,
        interest_id: interestId,
      })),
    );
    if (insError) throw insError;
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
