/**
 * Types de la messagerie — port de `modules/messaging/types/messaging.ts`
 * (mobile). `isRecentlyOnline` vit dans `@/lib/presence` (partagé avec la
 * Découverte). Backend Supabase partagé (`get_my_conversations`, table
 * `messages` en publication Realtime, `mark_messages_read`).
 */

/** Une ligne de la liste des conversations — un match + son dernier message. */
export interface Conversation {
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

export interface ChatMessage {
  id: string;
  matchId: string;
  senderId: string;
  content: string;
  createdAt: string;
  readAt: string | null;
}
