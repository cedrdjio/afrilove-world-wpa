"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { m } from "framer-motion";
import { MoreHorizontal } from "lucide-react";

import { ScreenBackground } from "@/components/layout/screen-background";
import { GlowOrb } from "@/components/layout/glow-orb";
import { Avatar } from "@/components/ui/avatar";
import { CountBadge } from "@/components/ui/badges";
import { Spinner } from "@/components/ui/spinner";
import { EmptyState, ErrorState } from "@/components/feedback";
import { mapToAppError } from "@/lib/errors";
import { isRecentlyOnline } from "@/lib/presence";
import { useConversationsQuery } from "@/features/messaging/hooks/use-messaging";
import { formatConversationTime } from "@/features/messaging/utils/time";
import { ConversationActionSheet } from "@/features/messaging/components/conversation-action-sheet";
import { usePresenceStore } from "@/features/presence/store";
import type { Conversation } from "@/features/messaging/types";

export default function MessagesPage() {
  const router = useRouter();
  const conversationsQuery = useConversationsQuery();
  const onlineIds = usePresenceStore((s) => s.onlineIds);
  const [activeConversation, setActiveConversation] =
    useState<Conversation | null>(null);

  const conversations = conversationsQuery.data ?? [];

  return (
    <div className="relative flex flex-1 flex-col">
      <ScreenBackground theme="cream">
        <GlowOrb
          size={220}
          color="rgba(106,79,192,0.08)"
          top={-50}
          left={-50}
          duration={10}
        />
      </ScreenBackground>

      <div className="relative z-10 px-[22px] pt-8">
        <h1 className="font-display text-foreground mb-5 text-[30px]">
          Messages
        </h1>
      </div>

      {conversationsQuery.isLoading ? (
        <div className="relative z-10 flex flex-1 items-center justify-center">
          <Spinner className="size-8" />
        </div>
      ) : conversationsQuery.isError ? (
        <div className="relative z-10 flex flex-1 items-center justify-center px-6">
          <ErrorState
            error={mapToAppError(conversationsQuery.error)}
            onRetry={() => void conversationsQuery.refetch()}
          />
        </div>
      ) : conversations.length === 0 ? (
        <div className="relative z-10 flex flex-1 flex-col">
          <EmptyState
            title="Aucune conversation"
            description="Vos conversations avec vos matches apparaîtront ici."
          />
        </div>
      ) : (
        <div className="relative z-10 flex-1 px-[22px] pb-4">
          {conversations.map((item, index) => {
            const online =
              onlineIds.has(item.partnerId) ||
              isRecentlyOnline(item.partnerLastActiveAt);
            return (
              <m.div
                key={item.matchId}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(index, 8) * 0.05 }}
                className="border-border/70 bg-card/45 mb-2 flex items-center gap-3.5 rounded-2xl border-[1.5px] px-4 py-3.5"
              >
                <button
                  type="button"
                  onClick={() => router.push(`/chat/${item.matchId}`)}
                  className="flex min-w-0 flex-1 items-center gap-3.5 text-left"
                >
                  <Avatar
                    src={item.partnerAvatarUrl ?? undefined}
                    seed={item.partnerFirstName}
                    size={52}
                    ringColor={online ? "#3ECf8E" : undefined}
                  />
                  <span className="min-w-0 flex-1">
                    <span className="mb-1 flex justify-between gap-2">
                      <span className="font-display text-foreground truncate text-[14px]">
                        {item.partnerFirstName}
                      </span>
                      <span className="text-foreground/35 shrink-0 text-[11px] font-medium">
                        {formatConversationTime(
                          item.lastMessageAt ?? item.matchedAt,
                        )}
                      </span>
                    </span>
                    <span
                      className={`block truncate text-[12.5px] ${
                        item.unreadCount > 0
                          ? "text-foreground font-medium"
                          : "text-muted-foreground"
                      }`}
                    >
                      {item.lastMessage
                        ? `${item.lastMessageFromMe ? "Vous : " : ""}${item.lastMessage}`
                        : "Nouveau match — dites bonjour ! 👋"}
                    </span>
                  </span>
                </button>
                {item.unreadCount > 0 ? (
                  <CountBadge count={item.unreadCount} size={22} />
                ) : null}
                <button
                  type="button"
                  aria-label="Actions"
                  onClick={() => setActiveConversation(item)}
                  className="text-foreground/35 hover:text-foreground shrink-0 transition-colors"
                >
                  <MoreHorizontal className="size-[18px]" aria-hidden />
                </button>
              </m.div>
            );
          })}
        </div>
      )}

      {activeConversation ? (
        <ConversationActionSheet
          conversation={activeConversation}
          onClose={() => setActiveConversation(null)}
        />
      ) : null}
    </div>
  );
}
