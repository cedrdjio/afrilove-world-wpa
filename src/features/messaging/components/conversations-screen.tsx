"use client";

import Link from "next/link";
import { m } from "framer-motion";
import { Bell, Search } from "lucide-react";

import { Avatar } from "@/components/ui/avatar";
import { IconButton } from "@/components/ui/icon-button";
import { ROUTES } from "@/constants/routes";
import { useAuth } from "@/providers/auth-provider";
import { usePresenceStore } from "@/features/presence/store";
import { formatConversationTime } from "@/utils/format";

import {
  DEMO_CONVERSATIONS,
  DEMO_NEW_MATCHES,
} from "@/features/messaging/data";
import { useConversationsQuery } from "../hooks";
import { isRecentlyOnline } from "../presence-utils";

const EASE = [0.23, 1, 0.32, 1] as const;

/** Ligne d'affichage unifiée (données réelles ou démo). */
interface Row {
  id: string;
  href: string;
  firstName: string;
  avatarUrl: string | null;
  online: boolean;
  lastPreview: string;
  lastAt: string | null;
  unread: number;
  hasMessages: boolean;
}

/**
 * Liste des conversations (« 09 Messages »). Carrousel « nouveaux matchs »
 * (matchs sans message) + fils de discussion. Branché sur `get_my_conversations`
 * (+ présence Realtime) ; l'aperçu non authentifié retombe sur la démo.
 */
export function ConversationsScreen() {
  const { isAuthenticated } = useAuth();
  const { data, isLoading } = useConversationsQuery();
  const onlineIds = usePresenceStore((s) => s.onlineIds);

  const rows: Row[] = isAuthenticated
    ? (data ?? []).map((c) => ({
        id: c.matchId,
        href: `${ROUTES.messages}/${c.matchId}`,
        firstName: c.partnerFirstName,
        avatarUrl: c.partnerAvatarUrl,
        online:
          onlineIds.has(c.partnerId) || isRecentlyOnline(c.partnerLastActiveAt),
        lastPreview: c.lastMessage ?? "Vous avez matché — dites bonjour 👋",
        lastAt: c.lastMessageAt ?? c.matchedAt,
        unread: c.unreadCount,
        hasMessages: Boolean(c.lastMessage),
      }))
    : DEMO_CONVERSATIONS.map((c) => ({
        id: c.id,
        href: `${ROUTES.messages}/${c.id}`,
        firstName: c.peer.firstName,
        avatarUrl: c.peer.photos[0],
        online: c.peer.online,
        lastPreview: c.lastPreview,
        lastAt: c.lastAt,
        unread: c.unread,
        hasMessages: true,
      }));

  const newMatches = isAuthenticated
    ? rows
        .filter((r) => !r.hasMessages)
        .map((r) => ({
          id: r.id,
          href: r.href,
          firstName: r.firstName,
          avatarUrl: r.avatarUrl,
        }))
    : DEMO_NEW_MATCHES.map((p) => ({
        id: p.id,
        href: `${ROUTES.messages}/${p.id}`,
        firstName: p.firstName,
        avatarUrl: p.photos[0] as string | null,
      }));
  const threads = isAuthenticated ? rows.filter((r) => r.hasMessages) : rows;

  const showEmpty = isAuthenticated && !isLoading && rows.length === 0;

  return (
    <div className="mx-auto w-full max-w-md px-5 pt-[max(1.25rem,env(safe-area-inset-top))] pb-28">
      <header className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-extrabold">Messages</h1>
        <div className="flex items-center gap-2.5">
          <IconButton tone="glass" aria-label="Activité" asChild>
            <Link href={ROUTES.activity}>
              <Bell className="size-5" aria-hidden />
            </Link>
          </IconButton>
          <IconButton tone="glass" aria-label="Rechercher">
            <Search className="size-5" aria-hidden />
          </IconButton>
        </div>
      </header>

      {newMatches.length > 0 && (
        <section className="mt-6" aria-label="Nouveaux matchs">
          <h2 className="text-muted-foreground font-display text-sm font-bold">
            Nouveaux matchs
          </h2>
          <div className="no-scrollbar -mx-5 mt-3.5 flex gap-4 overflow-x-auto px-5">
            {newMatches.map((peer) => (
              <Link
                key={peer.id}
                href={peer.href}
                className="flex shrink-0 flex-col items-center gap-1.5"
              >
                <Avatar
                  src={peer.avatarUrl}
                  alt={peer.firstName}
                  size={64}
                  ring
                />
                <span className="text-xs font-semibold">{peer.firstName}</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {showEmpty ? (
        <div className="mt-16 flex flex-col items-center text-center">
          <span className="glass grid size-16 place-items-center rounded-full">
            <Bell className="text-muted-foreground size-7" aria-hidden />
          </span>
          <p className="text-muted-foreground mt-4 max-w-[16rem] text-sm">
            Pas encore de match. Likez des profils pour démarrer une
            conversation.
          </p>
          <Link
            href={ROUTES.discover}
            className="gradient-signature mt-5 rounded-[var(--radius-pill)] px-6 py-2.5 text-sm font-bold text-white"
          >
            Découvrir
          </Link>
        </div>
      ) : (
        <m.section
          initial="hidden"
          animate="show"
          variants={{ show: { transition: { staggerChildren: 0.05 } } }}
          className="mt-6 flex flex-col gap-2.5"
          aria-label="Conversations"
        >
          {threads.map((conv) => (
            <m.div
              key={conv.id}
              variants={{
                hidden: { opacity: 0, y: 10 },
                show: {
                  opacity: 1,
                  y: 0,
                  transition: { ease: EASE, duration: 0.35 },
                },
              }}
            >
              <Link
                href={conv.href}
                className="glass flex items-center gap-3 rounded-[var(--radius-lg)] p-3 transition-transform active:scale-[0.99]"
              >
                <Avatar
                  src={conv.avatarUrl}
                  alt={conv.firstName}
                  size={54}
                  rounded="lg"
                  online={conv.online}
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="font-display truncate font-bold">
                      {conv.firstName}
                    </span>
                    <span className="text-subtle-foreground shrink-0 text-xs">
                      {conv.lastAt ? formatConversationTime(conv.lastAt) : ""}
                    </span>
                  </div>
                  <p
                    className={
                      conv.unread > 0
                        ? "text-muted-foreground mt-0.5 truncate text-sm"
                        : "text-subtle-foreground mt-0.5 truncate text-sm"
                    }
                  >
                    {conv.lastPreview}
                  </p>
                </div>
                {conv.unread > 0 && (
                  <span className="gradient-signature grid size-[22px] shrink-0 place-items-center rounded-full text-xs font-bold text-white">
                    {conv.unread}
                  </span>
                )}
              </Link>
            </m.div>
          ))}
        </m.section>
      )}
    </div>
  );
}
