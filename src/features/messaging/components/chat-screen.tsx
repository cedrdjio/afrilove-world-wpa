"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeft, Send, Smile, Sparkles } from "lucide-react";

import { Avatar } from "@/components/ui/avatar";
import { IconButton } from "@/components/ui/icon-button";
import { ROUTES } from "@/constants/routes";
import { useHaptics } from "@/hooks/use-haptics";
import { cn } from "@/lib/utils";
import { formatClockTime } from "@/utils/format";

export interface ChatBubble {
  id: string;
  mine: boolean;
  body: string;
  sentAt: string;
}

export interface ChatPartner {
  id: string;
  firstName: string;
  avatarUrl: string | null;
  online: boolean;
}

/**
 * Fil de discussion (« 07 Messagerie ») — présentation pure. En-tête
 * interlocuteur (présence), bulles alignées, indicateur de saisie, composeur.
 * Les données (réelles via Supabase Realtime, ou démo) sont fournies par le
 * conteneur parent ; l'envoi passe par `onSend`.
 */
export function ChatScreen({
  partner,
  messages,
  matchTimeIso,
  typing = false,
  onSend,
  disabled = false,
  remainingMessages = null,
}: {
  partner: ChatPartner;
  messages: ChatBubble[];
  matchTimeIso: string | null;
  typing?: boolean;
  onSend: (body: string) => void;
  disabled?: boolean;
  /** Messages gratuits restants dans cette conversation. null = illimité (premium). */
  remainingMessages?: number | null;
}) {
  const router = useRouter();
  const haptic = useHaptics();
  const [draft, setDraft] = useState("");
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "end" });
  }, [messages.length, typing]);

  const limitReached = remainingMessages !== null && remainingMessages <= 0;
  const lowOnMessages =
    remainingMessages !== null &&
    remainingMessages > 0 &&
    remainingMessages <= 3;

  const send = () => {
    const body = draft.trim();
    if (!body || disabled || limitReached) return;
    haptic("light");
    onSend(body);
    setDraft("");
  };

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col">
      {/* En-tête */}
      <header className="glass sticky top-0 z-20 flex items-center gap-3 px-4 py-2.5 pt-[max(0.625rem,env(safe-area-inset-top))]">
        <IconButton
          tone="ghost"
          size="sm"
          aria-label="Retour"
          onClick={() => router.back()}
        >
          <ChevronLeft className="size-6" aria-hidden />
        </IconButton>
        <Link
          href={`${ROUTES.discover}/${partner.id}`}
          className="flex min-w-0 flex-1 items-center gap-3"
        >
          <Avatar
            src={partner.avatarUrl}
            alt={partner.firstName}
            size={44}
            online={partner.online}
          />
          <div className="min-w-0">
            <div className="font-display truncate font-bold">
              {partner.firstName}
            </div>
            <div
              className={cn(
                "text-xs font-semibold",
                partner.online ? "text-success" : "text-subtle-foreground",
              )}
            >
              {partner.online ? "En ligne" : "Hors ligne"}
            </div>
          </div>
        </Link>
        {/* Les appels audio/vidéo ne sont pas proposés à ce stade — boutons
            volontairement retirés de l'en-tête. */}
      </header>

      {/* Fil */}
      <div className="flex flex-1 flex-col gap-3 overflow-y-auto px-5 py-5">
        {matchTimeIso && (
          <p className="text-subtle-foreground text-center text-xs font-semibold">
            MATCH · {formatClockTime(matchTimeIso)}
          </p>
        )}
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={cn(
              "max-w-[78%] px-4 py-2.5 text-sm leading-snug",
              msg.mine
                ? "gradient-signature shadow-brand self-end rounded-[22px_22px_7px_22px] text-white"
                : "glass text-foreground self-start rounded-[22px_22px_22px_7px]",
            )}
          >
            {msg.body}
          </div>
        ))}
        {typing && (
          <div className="glass flex items-center gap-1.5 self-start rounded-[22px_22px_22px_7px] px-4 py-3.5">
            {[0, 0.2, 0.4].map((delay) => (
              <span
                key={delay}
                className="bg-accent size-2 animate-bounce rounded-full"
                style={{ animationDelay: `${delay}s` }}
              />
            ))}
          </div>
        )}
        <div ref={endRef} />
      </div>

      {/* Composeur (ou invite premium quand la limite gratuite est atteinte) */}
      {limitReached ? (
        <div className="bg-background px-4 pt-3 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
          <Link
            href={ROUTES.premium}
            className="gradient-signature shadow-brand flex items-center gap-3 rounded-[var(--radius-lg)] px-4 py-3.5 text-white active:scale-[0.99]"
          >
            <Sparkles className="size-5 shrink-0 fill-white" aria-hidden />
            <span className="flex-1 text-sm leading-tight font-semibold">
              Limite gratuite atteinte (5 messages). Passe Premium pour discuter
              sans limite.
            </span>
            <span className="text-primary font-display rounded-[var(--radius-pill)] bg-white px-3 py-1.5 text-xs font-bold">
              Passer Premium
            </span>
          </Link>
        </div>
      ) : (
        <div className="bg-background relative px-4 pt-3 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
          {lowOnMessages && (
            <p className="text-subtle-foreground mb-2 text-center text-xs font-semibold">
              Il te reste {remainingMessages} message
              {remainingMessages! > 1 ? "s" : ""} gratuit
              {remainingMessages! > 1 ? "s" : ""}
            </p>
          )}
          <div className="flex items-center gap-2.5">
            <EmojiPicker
              onPick={(emoji) => {
                setDraft((d) => d + emoji);
                haptic("light");
              }}
            />
            <label className="sr-only" htmlFor="chat-input">
              Écris un message
            </label>
            <input
              id="chat-input"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  send();
                }
              }}
              placeholder="Écris un message…"
              className="glass text-foreground placeholder:text-subtle-foreground focus-visible:ring-ring h-12 flex-1 rounded-[var(--radius-pill)] px-5 text-sm outline-none focus-visible:ring-2"
            />
            <IconButton
              tone="gradient"
              shape="round"
              aria-label="Envoyer"
              onClick={send}
              disabled={!draft.trim() || disabled}
            >
              <Send className="size-5" aria-hidden />
            </IconButton>
          </div>
        </div>
      )}
    </div>
  );
}

/** Palette d'emojis courants, insérés dans le message (aucune dépendance externe). */
const EMOJIS = [
  "😀",
  "😁",
  "😂",
  "🤣",
  "😊",
  "😍",
  "🥰",
  "😘",
  "😉",
  "😎",
  "🤗",
  "🤩",
  "😇",
  "🙃",
  "😅",
  "😳",
  "🥺",
  "😢",
  "😭",
  "😤",
  "😴",
  "🤔",
  "🙌",
  "👏",
  "🙏",
  "👍",
  "👎",
  "👊",
  "🤝",
  "💪",
  "🔥",
  "✨",
  "🎉",
  "❤️",
  "🧡",
  "💛",
  "💚",
  "💙",
  "💜",
  "💖",
  "💕",
  "💘",
  "😻",
  "🌹",
  "🌸",
  "☀️",
  "🌙",
  "⭐",
  "🍀",
  "🥂",
];

function EmojiPicker({ onPick }: { onPick: (emoji: string) => void }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      {open && (
        <>
          <button
            type="button"
            aria-label="Fermer"
            className="fixed inset-0 z-30 cursor-default"
            onClick={() => setOpen(false)}
          />
          <div className="glass absolute bottom-14 left-0 z-40 grid w-[16.5rem] grid-cols-8 gap-1 rounded-[var(--radius-lg)] p-2 shadow-lg">
            {EMOJIS.map((emoji) => (
              <button
                key={emoji}
                type="button"
                onClick={() => onPick(emoji)}
                className="hover:bg-muted grid size-8 place-items-center rounded-md text-lg transition-colors"
              >
                {emoji}
              </button>
            ))}
          </div>
        </>
      )}
      <IconButton
        tone="glass"
        shape="square"
        aria-label="Emojis"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <Smile className="size-5" aria-hidden />
      </IconButton>
    </div>
  );
}
