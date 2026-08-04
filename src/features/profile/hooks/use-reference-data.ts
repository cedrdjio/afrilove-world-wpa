"use client";

import { useQuery } from "@tanstack/react-query";

import { type createClient } from "@/services/supabase/client";
import { useSupabase } from "@/providers/supabase-provider";
import { fetchInterests } from "@/features/onboarding/service";
import { useLifestyleCategories } from "@/features/onboarding/hooks/use-lifestyle-categories";
import {
  type ReferenceOption,
  type RelationshipGoalOption,
} from "@/features/profile/types";

type Client = ReturnType<typeof createClient>;

// Le catalogue (langues, religions, …) est géré au dashboard et change
// rarement : un long staleTime évite un refetch à chaque écran.
const CATALOG_STALE_TIME = 30 * 60 * 1000;

async function fetchSimpleCatalog(
  client: Client,
  table: "languages" | "religions" | "education_levels",
): Promise<ReferenceOption[]> {
  const { data, error } = await client
    .from(table)
    .select("id, key, label, sort_order")
    .order("sort_order");
  if (error) throw error;
  return (data ?? []).map((row) => ({
    id: row.id,
    key: row.key,
    label: row.label,
    sortOrder: row.sort_order,
  }));
}

async function fetchRelationshipGoals(
  client: Client,
): Promise<RelationshipGoalOption[]> {
  const { data, error } = await client
    .from("relationship_goals")
    .select("id, key, label, subtitle, sort_order")
    .order("sort_order");
  if (error) throw error;
  return (data ?? []).map((row) => ({
    id: row.id,
    key: row.key,
    label: row.label,
    subtitle: row.subtitle,
    sortOrder: row.sort_order,
  }));
}

export function useInterestsQuery() {
  const supabase = useSupabase();
  return useQuery({
    queryKey: ["interests"],
    queryFn: () => fetchInterests(supabase),
    staleTime: CATALOG_STALE_TIME,
  });
}

export function useLanguagesQuery() {
  const supabase = useSupabase();
  return useQuery({
    queryKey: ["languages"],
    queryFn: () => fetchSimpleCatalog(supabase, "languages"),
    staleTime: CATALOG_STALE_TIME,
  });
}

export function useReligionsQuery() {
  const supabase = useSupabase();
  return useQuery({
    queryKey: ["religions"],
    queryFn: () => fetchSimpleCatalog(supabase, "religions"),
    staleTime: CATALOG_STALE_TIME,
  });
}

export function useEducationLevelsQuery() {
  const supabase = useSupabase();
  return useQuery({
    queryKey: ["education-levels"],
    queryFn: () => fetchSimpleCatalog(supabase, "education_levels"),
    staleTime: CATALOG_STALE_TIME,
  });
}

export function useRelationshipGoalsQuery() {
  const supabase = useSupabase();
  return useQuery({
    queryKey: ["relationship-goals"],
    queryFn: () => fetchRelationshipGoals(supabase),
    staleTime: CATALOG_STALE_TIME,
  });
}

export { useLifestyleCategories };
