"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeft, Phone, Plus, Send, Video } from "lucide-react";

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
}: {
  partner: ChatPartner;
  messages: ChatBubble[];
  matchTimeIso: string | null;
  typing?: boolean;
  onSend: (body: string) => void;
  disabled?: boolean;
}) {
  const router = useRouter();
  const haptic = useHaptics();
  const [draft, setDraft] = useState("");
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "end" });
  }, [messages.length, typing]);

  const send = () => {
    const body = draft.trim();
    if (!body || disabled) return;
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
        <IconButton
          tone="soft"
          size="sm"
          shape="square"
          aria-label="Appel audio"
        >
          <Phone className="size-5" aria-hidden />
        </IconButton>
        <IconButton
          tone="soft"
          size="sm"
          shape="square"
          aria-label="Appel vidéo"
        >
          <Video className="size-5" aria-hidden />
        </IconButton>
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

      {/* Composeur */}
      <div className="bg-background flex items-center gap-2.5 px-4 pt-3 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
        <IconButton tone="glass" shape="square" aria-label="Ajouter un média">
          <Plus className="size-5" aria-hidden />
        </IconButton>
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
  );
}
