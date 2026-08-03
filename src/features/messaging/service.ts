import type { RealtimeChannel } from "@supabase/supabase-js";

import { db } from "@/services/supabase/browser";

/** Une ligne de la liste des conversations — un match et son dernier message. */
export interface ConversationListItem {
  matchId: string;
  matchedAt: string;
  partnerId: string;
  partnerFirstName: string;
  partnerAvatarUrl: string | null;
  partnerIsVerified: boolean;
  partnerLastActiveAt: string | null;
  lastMessage: string | null;
  lastMessageAt: string | null;
  lastMessageFromMe: boolean;
  unreadCount: number;
}

export interface LiveMessage {
  id: string;
  matchId: string;
  senderId: string;
  content: string;
  createdAt: string;
  readAt: string | null;
}

function mapMessage(row: {
  id: string;
  match_id: string;
  sender_id: string;
  content: string;
  created_at: string;
  read_at: string | null;
}): LiveMessage {
  return {
    id: row.id,
    matchId: row.match_id,
    senderId: row.sender_id,
    content: row.content,
    createdAt: row.created_at,
    readAt: row.read_at,
  };
}

async function fetchConversations(
  myId: string,
): Promise<ConversationListItem[]> {
  const { data, error } = await db().rpc("get_my_conversations");
  if (error) throw error;

  return (data ?? []).map((row) => ({
    matchId: row.match_id,
    matchedAt: row.matched_at,
    partnerId: row.partner_id,
    partnerFirstName: row.partner_first_name ?? "",
    partnerAvatarUrl: row.partner_avatar_url,
    partnerIsVerified: row.partner_is_verified,
    partnerLastActiveAt: row.partner_last_active_at,
    lastMessage: row.last_message,
    lastMessageAt: row.last_message_at,
    lastMessageFromMe: row.last_message_sender_id === myId,
    unreadCount: row.unread_count,
  }));
}

async function fetchMessages(matchId: string): Promise<LiveMessage[]> {
  const { data, error } = await db()
    .from("messages")
    .select("id, match_id, sender_id, content, created_at, read_at")
    .eq("match_id", matchId)
    .order("created_at", { ascending: true })
    .limit(200);
  if (error) throw error;
  return (data ?? []).map(mapMessage);
}

async function sendMessage(
  matchId: string,
  senderId: string,
  content: string,
): Promise<LiveMessage> {
  const { data, error } = await db()
    .from("messages")
    .insert({ match_id: matchId, sender_id: senderId, content })
    .select("id, match_id, sender_id, content, created_at, read_at")
    .single();
  if (error) throw error;
  return mapMessage(data);
}

async function markConversationRead(matchId: string): Promise<void> {
  const { error } = await db().rpc("mark_messages_read", {
    p_match_id: matchId,
  });
  if (error) throw error;
}

/**
 * Inserts en direct pour une conversation, via Supabase Realtime (la table
 * `messages` est dans la publication `supabase_realtime` ; la RLS s'applique
 * toujours). Renvoie le canal — l'appelant DOIT `removeChannel()` au démontage
 * ou la socket fuit des abonnements.
 */
function subscribeToMessages(
  matchId: string,
  onMessage: (message: LiveMessage) => void,
): RealtimeChannel {
  // Topic unique par abonnement : un topic fixe réutiliserait une instance déjà
  // abonnée et l'ajout du callback postgres_changes planterait.
  const unique = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
  return db()
    .channel(`messages:${matchId}:${unique}`)
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "messages",
        filter: `match_id=eq.${matchId}`,
      },
      (payload) => {
        onMessage(mapMessage(payload.new as Parameters<typeof mapMessage>[0]));
      },
    )
    .subscribe();
}

function unsubscribe(channel: RealtimeChannel): void {
  db()
    .removeChannel(channel)
    .catch(() => {});
}

export const messagingService = {
  fetchConversations,
  fetchMessages,
  sendMessage,
  markConversationRead,
  subscribeToMessages,
  unsubscribe,
};
