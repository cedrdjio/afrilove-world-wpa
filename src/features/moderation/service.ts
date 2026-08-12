import { db } from "@/services/supabase/browser";

/** Motifs de signalement (« Signaler »). */
export type ReportReason =
  "fake" | "inappropriate" | "harassment" | "spam" | "other";

export const REPORT_REASONS: { value: ReportReason; label: string }[] = [
  { value: "fake", label: "Faux profil" },
  { value: "inappropriate", label: "Contenu inapproprié" },
  { value: "harassment", label: "Harcèlement" },
  { value: "spam", label: "Spam / arnaque" },
  { value: "other", label: "Autre" },
];

/** Bloque un membre : il disparaît de la découverte et des messages (RLS). */
async function blockProfile(targetId: string): Promise<void> {
  const {
    data: { user },
  } = await db().auth.getUser();
  if (!user) throw new Error("Not authenticated");
  const { error } = await db()
    .from("blocks")
    .insert({ blocker_id: user.id, blocked_id: targetId });
  if (error && !error.message.includes("duplicate")) throw error;
}

/** Signale un membre à la modération. */
async function reportProfile(
  targetId: string,
  reason: ReportReason,
  details?: string,
): Promise<void> {
  const {
    data: { user },
  } = await db().auth.getUser();
  if (!user) throw new Error("Not authenticated");
  const { error } = await db()
    .from("reports")
    .insert({
      reporter_id: user.id,
      reported_id: targetId,
      reason,
      details: details ?? null,
    });
  if (error) throw error;
}

/** Profil bloqué par le membre courant (écran « Utilisateurs bloqués »). */
export interface BlockedProfile {
  id: string;
  firstName: string;
  avatarUrl: string | null;
  blockedAt: string;
}

async function fetchBlocked(): Promise<BlockedProfile[]> {
  const { data, error } = await db().rpc("get_my_blocked_profiles");
  if (error) throw error;
  return (data ?? []).map((r) => ({
    id: r.blocked_id,
    firstName: r.first_name ?? "",
    avatarUrl: r.avatar_url,
    blockedAt: r.blocked_at,
  }));
}

/** Débloque un membre : supprime la ligne `blocks` correspondante. */
async function unblockProfile(targetId: string): Promise<void> {
  const {
    data: { user },
  } = await db().auth.getUser();
  if (!user) throw new Error("Not authenticated");
  const { error } = await db()
    .from("blocks")
    .delete()
    .eq("blocker_id", user.id)
    .eq("blocked_id", targetId);
  if (error) throw error;
}

export const moderationService = {
  blockProfile,
  reportProfile,
  fetchBlocked,
  unblockProfile,
};
