import { type createClient } from "@/services/supabase/client";

type Client = ReturnType<typeof createClient>;

/**
 * Modération — port PARTIEL de `moderationService` (mobile), limité aux actions
 * dont la feuille d'actions de conversation a besoin au Jalon 9 : bloquer et
 * supprimer un match. Les signalements (`/reports/[id]`), la liste des profils
 * bloqués et le déblocage relèvent du Jalon 12.
 */

/** Bloquer masque les deux membres l'un pour l'autre partout (découverte,
 *  recherche, conversations, messages) — appliqué par les RLS/RPC en base. */
export async function blockUser(
  supabase: Client,
  blockerId: string,
  blockedId: string,
): Promise<void> {
  const { error } = await supabase
    .from("blocks")
    .upsert(
      { blocker_id: blockerId, blocked_id: blockedId },
      { onConflict: "blocker_id,blocked_id" },
    );
  if (error) throw error;
}

/** Unmatch = suppression de la ligne `matches` ; les messages disparaissent en cascade. */
export async function unmatch(
  supabase: Client,
  matchId: string,
): Promise<void> {
  const { error } = await supabase.from("matches").delete().eq("id", matchId);
  if (error) throw error;
}
