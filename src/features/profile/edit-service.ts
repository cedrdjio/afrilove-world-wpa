import { db } from "@/services/supabase/browser";
import type {
  Drinking,
  Gender,
  GymHabit,
  HasPets,
  LookingFor,
  Smoking,
  WantsChildren,
} from "@/features/onboarding/types";

/**
 * Modèle éditable du profil connecté — miroir des champs saisis à
 * l'onboarding, réutilisé par l'écran « Modifier mon profil ». On ne touche
 * jamais à `onboarding_completed` : l'édition suppose l'onboarding déjà fait.
 */
export interface EditableProfile {
  displayName: string;
  privateName: string;
  profession: string;
  city: string | null;
  country: string | null;
  heightCm: number | null;
  bio: string;
  gender: Gender | null;
  lookingFor: LookingFor | null;
  smoking: Smoking | null;
  drinking: Drinking | null;
  gymHabit: GymHabit | null;
  hasPets: HasPets | null;
  wantsChildren: WantsChildren | null;
  educationLevelId: string | null;
  religionId: string | null;
  relationshipGoalId: string | null;
  interestIds: string[];
  languageIds: string[];
}

async function fetchEditableProfile(userId: string): Promise<EditableProfile> {
  const supabase = db();
  const { data, error } = await supabase
    .from("profiles")
    .select(
      "first_name,last_name,profession,city,country,height_cm,bio,gender,looking_for,smoking,drinking,gym_habit,has_pets,wants_children,education_level_id,religion_id,relationship_goal_id",
    )
    .eq("id", userId)
    .single();
  if (error) throw error;

  const [interests, languages] = await Promise.all([
    supabase
      .from("profile_interests")
      .select("interest_id")
      .eq("profile_id", userId),
    supabase
      .from("profile_languages")
      .select("language_id")
      .eq("profile_id", userId),
  ]);
  if (interests.error) throw interests.error;
  if (languages.error) throw languages.error;

  return {
    displayName: data.first_name ?? "",
    privateName: data.last_name ?? "",
    profession: data.profession ?? "",
    city: data.city,
    country: data.country,
    heightCm: data.height_cm,
    bio: data.bio ?? "",
    gender: (data.gender as Gender | null) ?? null,
    lookingFor: (data.looking_for as LookingFor | null) ?? null,
    smoking: (data.smoking as Smoking | null) ?? null,
    drinking: (data.drinking as Drinking | null) ?? null,
    gymHabit: (data.gym_habit as GymHabit | null) ?? null,
    hasPets: (data.has_pets as HasPets | null) ?? null,
    wantsChildren: (data.wants_children as WantsChildren | null) ?? null,
    educationLevelId: data.education_level_id,
    religionId: data.religion_id,
    relationshipGoalId: data.relationship_goal_id,
    interestIds: (interests.data ?? []).map((r) => r.interest_id),
    languageIds: (languages.data ?? []).map((r) => r.language_id),
  };
}

async function saveEditableProfile(
  userId: string,
  form: EditableProfile,
): Promise<void> {
  const supabase = db();

  const { error } = await supabase
    .from("profiles")
    .update({
      first_name: form.displayName.trim() || null,
      last_name: form.privateName.trim() || null,
      profession: form.profession.trim() || null,
      city: form.city,
      country: form.country,
      height_cm: form.heightCm,
      bio: form.bio.trim(),
      gender: form.gender,
      looking_for: form.lookingFor,
      smoking: form.smoking,
      drinking: form.drinking,
      gym_habit: form.gymHabit,
      has_pets: form.hasPets,
      wants_children: form.wantsChildren,
      education_level_id: form.educationLevelId,
      religion_id: form.religionId,
      relationship_goal_id: form.relationshipGoalId,
    })
    .eq("id", userId);
  if (error) throw error;

  // Remplace intégralement les sélections liées (idempotent) — le trigger
  // `recompute_profile_completed` recalcule ensuite l'état de complétude.
  await replaceInterests(userId, form.interestIds);
  await replaceLanguages(userId, form.languageIds);
}

async function replaceInterests(userId: string, ids: string[]): Promise<void> {
  const supabase = db();
  const del = await supabase
    .from("profile_interests")
    .delete()
    .eq("profile_id", userId);
  if (del.error) throw del.error;
  if (ids.length === 0) return;
  const ins = await supabase
    .from("profile_interests")
    .insert(ids.map((interest_id) => ({ profile_id: userId, interest_id })));
  if (ins.error) throw ins.error;
}

async function replaceLanguages(userId: string, ids: string[]): Promise<void> {
  const supabase = db();
  const del = await supabase
    .from("profile_languages")
    .delete()
    .eq("profile_id", userId);
  if (del.error) throw del.error;
  if (ids.length === 0) return;
  const ins = await supabase
    .from("profile_languages")
    .insert(ids.map((language_id) => ({ profile_id: userId, language_id })));
  if (ins.error) throw ins.error;
}

export const profileEditService = {
  fetchEditableProfile,
  saveEditableProfile,
};
