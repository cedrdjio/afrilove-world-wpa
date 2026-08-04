"use client";

import { use, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { m } from "framer-motion";
import { Send, Smile, MoreHorizontal, ArrowLeft } from "lucide-react";

import { ScreenBackground } from "@/components/layout/screen-background";
import { GlowOrb } from "@/components/layout/glow-orb";
import { Avatar } from "@/components/ui/avatar";
import { Spinner } from "@/components/ui/spinner";
import { useAuth } from "@/providers/auth-provider";
import { isRecentlyOnline } from "@/lib/presence";
import {
  useConversationsQuery,
  useMarkConversationRead,
  useMessagesQuery,
  useSendMessage,
} from "@/features/messaging/hooks/use-messaging";
import { useChatComposerStore } from "@/features/messaging/stores/composer-store";
import { formatMessageTime } from "@/features/messaging/utils/time";
import { usePresenceStore } from "@/features/presence/store";

export default function ChatPage({
  params,
}: {
  params: Promise<{ matchId: string }>;
}) {
  const { matchId } = use(params);
  const router = useRouter();
  const { user } = useAuth();
  const conversationsQuery = useConversationsQuery();
  const messagesQuery = useMessagesQuery(matchId);
  const sendMessage = useSendMessage(matchId);
  const [draft, setDraft] = useState("");
  const listRef = useRef<HTMLDivElement>(null);

  const conversation = conversationsQuery.data?.find(
    (c) => c.matchId === matchId,
  );
  const messages = messagesQuery.data ?? [];

  useMarkConversationRead(matchId, conversation?.unreadCount);

  // Emoji choisi dans la route dédiée → injecté au brouillon.
  const pendingEmoji = useChatComposerStore((s) => s.pendingEmoji);
  const setPendingEmoji = useChatComposerStore((s) => s.setPendingEmoji);
  const [lastEmoji, setLastEmoji] = useState<string | null>(null);
  if (pendingEmoji && pendingEmoji !== lastEmoji) {
    setLastEmoji(pendingEmoji);
    setDraft((current) => current + pendingEmoji);
    setPendingEmoji(null);
  }

  // Défilement en bas à chaque nouveau message.
  useEffect(() => {
    if (messages.length === 0) return;
    requestAnimationFrame(() => {
      listRef.current?.scrollTo({
        top: listRef.current.scrollHeight,
        behavior: "smooth",
      });
    });
  }, [messages.length]);

  const handleSend = () => {
    const content = draft.trim();
    if (!content || sendMessage.isPending) return;
    setDraft("");
    sendMessage.mutate(content, {
      onError: () => setDraft(content), // rendre le texte plutôt que le perdre
    });
  };

  const partnerName = conversation?.partnerFirstName ?? "";
  const onlineIds = usePresenceStore((s) => s.onlineIds);
  const online =
    (conversation ? onlineIds.has(conversation.partnerId) : false) ||
    isRecentlyOnline(conversation?.partnerLastActiveAt ?? null);

  return (
    <div className="fixed inset-0 z-40 flex flex-col">
      <ScreenBackground theme="cream">
        <GlowOrb
          size={200}
          color="rgba(106,79,192,0.08)"
          top={-40}
          right={-40}
          duration={9.5}
        />
      </ScreenBackground>

      {/* En-tête */}
      <header className="glass relative z-10 mx-auto flex w-full max-w-md items-center gap-3 rounded-none px-[18px] pt-10 pb-3">
        <button
          type="button"
          onClick={() => router.back()}
          aria-label="Retour"
          className="border-border/70 bg-card/80 text-foreground grid size-10 place-items-center rounded-[13px] border"
        >
          <ArrowLeft className="size-[17px]" strokeWidth={2} aria-hidden />
        </button>
        <Avatar
          src={conversation?.partnerAvatarUrl ?? undefined}
          seed={partnerName}
          size={48}
        />
        <div className="flex-1">
          <p className="font-display text-foreground mb-0.5 text-[16px]">
            {partnerName}
          </p>
          {online ? (
            <span className="flex items-center gap-1.5">
              <span className="bg-success size-1.5 rounded-full" />
              <span className="text-success text-[11px] font-medium">
                En ligne
              </span>
            </span>
          ) : null}
        </div>
        {conversation ? (
          <button
            type="button"
            onClick={() => router.push(`/profile/${conversation.partnerId}`)}
            aria-label="Voir le profil"
            className="text-foreground/35"
          >
            <MoreHorizontal className="size-[18px]" aria-hidden />
          </button>
        ) : null}
      </header>

      {/* Messages */}
      <div
        ref={listRef}
        className="relative z-10 mx-auto w-full max-w-md flex-1 overflow-y-auto px-[18px] py-4"
      >
        {messagesQuery.isLoading ? (
          <div className="flex h-full items-center justify-center">
            <Spinner className="size-8" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center pt-16">
            <p className="text-muted-foreground max-w-xs text-center text-[13px] leading-[20px]">
              C&apos;est un match avec {partnerName || "ce profil"} !<br />
              Envoyez le premier message. 💬
            </p>
          </div>
        ) : (
          messages.map((item) => {
            const fromMe = item.senderId === user?.id;
            return (
              <m.div
                key={item.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className={`mb-2.5 flex ${fromMe ? "justify-end" : "justify-start"}`}
              >
                {fromMe ? (
                  <div className="gradient-signature max-w-[77%] rounded-[18px] rounded-br-[5px] p-[13px]">
                    <p className="text-[13.5px] leading-[19px] text-white">
                      {item.content}
                    </p>
                    <p className="mt-1 text-right text-[9.5px] text-white/60">
                      {formatMessageTime(item.createdAt)}
                    </p>
                  </div>
                ) : (
                  <div className="flex max-w-[80%] items-end gap-2">
                    <Avatar
                      src={conversation?.partnerAvatarUrl ?? undefined}
                      seed={partnerName}
                      size={26}
                    />
                    <div className="border-border/70 bg-card/50 rounded-[18px] rounded-bl-[5px] border-[1.5px] p-3.5">
                      <p className="text-foreground text-[13.5px] leading-[19px]">
                        {item.content}
                      </p>
                      <p className="text-foreground/30 mt-1 text-[9.5px]">
                        {formatMessageTime(item.createdAt)}
                      </p>
                    </div>
                  </div>
                )}
              </m.div>
            );
          })
        )}
      </div>

      {/* Composeur */}
      <div className="glass relative z-10 mx-auto w-full max-w-md rounded-none">
        <div className="flex items-center gap-2.5 px-[18px] py-3.5 pb-6">
          <button
            type="button"
            onClick={() => router.push(`/chat/${matchId}/emoji-picker`)}
            aria-label="Emojis"
            className="text-foreground/35 shrink-0"
          >
            <Smile className="size-5" aria-hidden />
          </button>
          <div className="border-border/70 bg-card/70 flex-1 rounded-full border-[1.5px] px-[18px] py-2.5">
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="Écrire un message…"
              rows={1}
              maxLength={2000}
              className="text-foreground placeholder:text-muted-foreground/70 max-h-24 w-full resize-none bg-transparent text-[13px] outline-none"
            />
          </div>
          <button
            type="button"
            onClick={handleSend}
            disabled={!draft.trim() || sendMessage.isPending}
            aria-label="Envoyer"
            className="gradient-signature grid size-[46px] shrink-0 place-items-center rounded-full text-white disabled:opacity-50"
          >
            {sendMessage.isPending ? (
              <Spinner className="size-5 border-white/40 border-t-white" />
            ) : (
              <Send className="size-[18px]" aria-hidden />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
