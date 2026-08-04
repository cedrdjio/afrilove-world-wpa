import { type RealtimeChannel } from "@supabase/supabase-js";

import { type createClient } from "@/services/supabase/client";
import type { ChatMessage, Conversation } from "@/features/messaging/types";

type Client = ReturnType<typeof createClient>;

function mapMessage(row: {
  id: string;
  match_id: string;
  sender_id: string;
  content: string;
  created_at: string;
  read_at: string | null;
}): ChatMessage {
  return {
    id: row.id,
    matchId: row.match_id,
    senderId: row.sender_id,
    content: row.content,
    createdAt: row.created_at,
    readAt: row.read_at,
  };
}

export async function fetchConversations(
  supabase: Client,
  myId: string,
): Promise<Conversation[]> {
  const { data, error } = await supabase.rpc("get_my_conversations");
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

export async function fetchMessages(
  supabase: Client,
  matchId: string,
): Promise<ChatMessage[]> {
  const { data, error } = await supabase
    .from("messages")
    .select("id, match_id, sender_id, content, created_at, read_at")
    .eq("match_id", matchId)
    .order("created_at", { ascending: true })
    .limit(200);
  if (error) throw error;
  return (data ?? []).map(mapMessage);
}

export async function sendMessage(
  supabase: Client,
  matchId: string,
  senderId: string,
  content: string,
): Promise<ChatMessage> {
  const { data, error } = await supabase
    .from("messages")
    .insert({ match_id: matchId, sender_id: senderId, content })
    .select("id, match_id, sender_id, content, created_at, read_at")
    .single();
  if (error) throw error;
  return mapMessage(data);
}

export async function markConversationRead(
  supabase: Client,
  matchId: string,
): Promise<void> {
  const { error } = await supabase.rpc("mark_messages_read", {
    p_match_id: matchId,
  });
  if (error) throw error;
}

/**
 * Inserts live pour une conversation, via Supabase Realtime (la table
 * `messages` est dans la publication `supabase_realtime` ; la RLS s'applique
 * toujours à ce que chaque abonné reçoit). Renvoie le canal — l'appelant DOIT
 * `unsubscribe()` au démontage sous peine de fuite d'abonnements.
 */
export function subscribeToMessages(
  supabase: Client,
  matchId: string,
  onMessage: (message: ChatMessage) => void,
): RealtimeChannel {
  // Topic unique par abonnement : un topic fixe réutilise l'instance déjà
  // abonnée au remontage, et l'ajout du callback postgres_changes plante alors.
  const unique = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
  return supabase
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

export function unsubscribe(supabase: Client, channel: RealtimeChannel): void {
  void supabase.removeChannel(channel);
}
