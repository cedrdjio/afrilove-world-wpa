"use client";

import Link from "next/link";
import { Loader2 } from "lucide-react";

import { ROUTES } from "@/constants/routes";
import { useAuth } from "@/providers/auth-provider";
import { usePresenceStore } from "@/features/presence/store";
import { useEntitlements } from "@/features/premium/hooks";

/** Messages gratuits autorisés par conversation (avant invitation à passer Premium). */
const FREE_MESSAGES_PER_CONVERSATION = 5;

import { findConversation } from "@/features/messaging/data";
import {
  useConversationsQuery,
  useMarkConversationRead,
  useMessagesQuery,
  useSendMessage,
} from "../hooks";
import { isRecentlyOnline } from "../presence-utils";
import { ChatScreen, type ChatBubble } from "./chat-screen";

/**
 * Conteneur du chat : résout les données réelles (Supabase Realtime) pour un
 * membre connecté, ou les données de démo pour l'aperçu design. L'UI reste
 * identique (`ChatScreen` présentationnel).
 */
export function ChatContainer({ id }: { id: string }) {
  const { isAuthenticated, user } = useAuth();

  if (isAuthenticated && user) {
    return <LiveChat matchId={id} userId={user.id} />;
  }
  return <DemoChat id={id} />;
}

function LiveChat({ matchId, userId }: { matchId: string; userId: string }) {
  const { data: messages } = useMessagesQuery(matchId);
  const { data: conversations, isLoading: convLoading } =
    useConversationsQuery();
  const onlineIds = usePresenceStore((s) => s.onlineIds);

  const { data: entitlements } = useEntitlements();
  const conv = conversations?.find((c) => c.matchId === matchId);
  useMarkConversationRead(matchId, conv?.unreadCount);
  const sendMessage = useSendMessage(matchId);

  if (!conv && convLoading) {
    return (
      <div className="grid min-h-dvh place-items-center">
        <Loader2 className="text-muted-foreground size-6 animate-spin" />
      </div>
    );
  }

  if (!conv) {
    return <NotFoundConversation />;
  }

  const bubbles: ChatBubble[] = (messages ?? []).map((m) => ({
    id: m.id,
    mine: m.senderId === userId,
    body: m.content,
    sentAt: m.createdAt,
  }));

  // Limite gratuite : 5 messages envoyés par conversation. Les abonnés (premium)
  // ne sont jamais bloqués. On compte uniquement les messages émis par le membre.
  const sentByMe = bubbles.filter((b) => b.mine).length;
  const remainingMessages = entitlements?.isPremium
    ? null
    : Math.max(0, FREE_MESSAGES_PER_CONVERSATION - sentByMe);

  return (
    <ChatScreen
      partner={{
        id: conv.partnerId,
        firstName: conv.partnerFirstName,
        avatarUrl: conv.partnerAvatarUrl,
        online:
          onlineIds.has(conv.partnerId) ||
          isRecentlyOnline(conv.partnerLastActiveAt),
      }}
      messages={bubbles}
      matchTimeIso={conv.matchedAt}
      onSend={(body) => sendMessage.mutate(body)}
      disabled={sendMessage.isPending}
      remainingMessages={remainingMessages}
    />
  );
}

function DemoChat({ id }: { id: string }) {
  const conversation = findConversation(id);
  if (!conversation) return <NotFoundConversation />;

  const bubbles: ChatBubble[] = conversation.messages.map((m) => ({
    id: m.id,
    mine: m.authorId === "me",
    body: m.body,
    sentAt: m.sentAt,
  }));

  return (
    <ChatScreen
      partner={{
        id: conversation.peer.id,
        firstName: conversation.peer.firstName,
        avatarUrl: conversation.peer.photos[0],
        online: conversation.peer.online,
      }}
      messages={bubbles}
      matchTimeIso={conversation.messages[0]?.sentAt ?? conversation.lastAt}
      typing={conversation.peer.online}
      // Aperçu design : l'envoi réel exige une session.
      onSend={() => {}}
      disabled
    />
  );
}

function NotFoundConversation() {
  return (
    <div className="mx-auto grid min-h-dvh max-w-md place-items-center px-6 text-center">
      <div>
        <p className="text-muted-foreground text-sm">
          Cette conversation est introuvable.
        </p>
        <Link
          href={ROUTES.messages}
          className="gradient-signature mt-5 inline-block rounded-[var(--radius-pill)] px-6 py-2.5 text-sm font-bold text-white"
        >
          Retour aux messages
        </Link>
      </div>
    </div>
  );
}
