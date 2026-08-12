import { db } from "@/services/supabase/browser";

import type { ActivityType } from "./data";

/** Notification normalisée depuis la table `notifications`. */
export interface NotificationItem {
  id: string;
  type: ActivityType;
  title: string;
  body: string | null;
  avatarUrl: string | null;
  createdAt: string;
  readAt: string | null;
}

/** Le `type` en base est libre ; on le range dans une des pastilles connues. */
function toActivityType(raw: string): ActivityType {
  const t = raw.toLowerCase();
  if (t.includes("match")) return "match";
  if (t.includes("super")) return "superlike";
  if (t.includes("message") || t.includes("chat")) return "message";
  if (t.includes("view") || t.includes("vue") || t.includes("like"))
    return "views";
  return "views";
}

function readString(data: unknown, ...keys: string[]): string | null {
  if (!data || typeof data !== "object") return null;
  const rec = data as Record<string, unknown>;
  for (const key of keys) {
    const value = rec[key];
    if (typeof value === "string" && value.length > 0) return value;
  }
  return null;
}

async function fetchNotifications(): Promise<NotificationItem[]> {
  const { data, error } = await db()
    .from("notifications")
    .select("id, type, title, body, data, read_at, created_at")
    .order("created_at", { ascending: false })
    .limit(50);
  if (error) throw error;
  return (data ?? []).map((row) => ({
    id: row.id,
    type: toActivityType(row.type),
    title: row.title,
    body: row.body,
    avatarUrl: readString(row.data, "avatar_url", "avatarUrl", "photo"),
    createdAt: row.created_at,
    readAt: row.read_at,
  }));
}

/** Marque toutes les notifications non lues du membre comme lues. */
async function markAllRead(): Promise<void> {
  const {
    data: { user },
  } = await db().auth.getUser();
  if (!user) return;
  const { error } = await db()
    .from("notifications")
    .update({ read_at: new Date().toISOString() })
    .eq("profile_id", user.id)
    .is("read_at", null);
  if (error) throw error;
}

export const activityService = {
  fetchNotifications,
  markAllRead,
};
