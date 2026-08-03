"use client";

import Link from "next/link";
import { m } from "framer-motion";
import { Bell, Search } from "lucide-react";

import { Avatar } from "@/components/ui/avatar";
import { IconButton } from "@/components/ui/icon-button";
import { ROUTES } from "@/constants/routes";
import {
  DEMO_CONVERSATIONS,
  DEMO_NEW_MATCHES,
} from "@/features/messaging/data";
import { formatConversationTime } from "@/utils/format";

const EASE = [0.23, 1, 0.32, 1] as const;

/**
 * Liste des conversations (« 09 Messages »). Carrousel « nouveaux matchs » +
 * liste des fils. Chaque ligne mène vers le chat correspondant.
 */
export function ConversationsScreen() {
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

      <section className="mt-6" aria-label="Nouveaux matchs">
        <h2 className="text-muted-foreground font-display text-sm font-bold">
          Nouveaux matchs
        </h2>
        <div className="no-scrollbar -mx-5 mt-3.5 flex gap-4 overflow-x-auto px-5">
          {DEMO_NEW_MATCHES.map((peer) => (
            <Link
              key={peer.id}
              href={`${ROUTES.messages}/${peer.id}`}
              className="flex shrink-0 flex-col items-center gap-1.5"
            >
              <Avatar
                src={peer.photos[0]}
                alt={peer.firstName}
                size={64}
                ring
              />
              <span className="text-xs font-semibold">{peer.firstName}</span>
            </Link>
          ))}
        </div>
      </section>

      <m.section
        initial="hidden"
        animate="show"
        variants={{ show: { transition: { staggerChildren: 0.05 } } }}
        className="mt-6 flex flex-col gap-2.5"
        aria-label="Conversations"
      >
        {DEMO_CONVERSATIONS.map((conv) => (
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
              href={`${ROUTES.messages}/${conv.id}`}
              className="glass flex items-center gap-3 rounded-[var(--radius-lg)] p-3 transition-transform active:scale-[0.99]"
            >
              <Avatar
                src={conv.peer.photos[0]}
                alt={conv.peer.firstName}
                size={54}
                rounded="lg"
                online={conv.peer.online}
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline justify-between gap-2">
                  <span className="font-display truncate font-bold">
                    {conv.peer.firstName}
                  </span>
                  <span className="text-subtle-foreground shrink-0 text-xs">
                    {formatConversationTime(conv.lastAt)}
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
    </div>
  );
}
