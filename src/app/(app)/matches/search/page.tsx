"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { m } from "framer-motion";
import { Search as SearchIcon, X } from "lucide-react";

import { ScreenBackground } from "@/components/layout/screen-background";
import { Avatar } from "@/components/ui/avatar";
import { Spinner } from "@/components/ui/spinner";
import { EmptyState } from "@/components/feedback";
import { isRecentlyOnline } from "@/lib/presence";
import { useConversationsQuery } from "@/features/messaging/hooks/use-messaging";
import { usePresenceStore } from "@/features/presence/store";

/** Recherche parmi les matchs — port de `MatchesSearchScreen` (mobile). */
export default function MatchesSearchPage() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const conversationsQuery = useConversationsQuery();
  const onlineIds = usePresenceStore((s) => s.onlineIds);

  const results = useMemo(() => {
    const matches = conversationsQuery.data ?? [];
    if (!query.trim()) return matches;
    const needle = query.trim().toLowerCase();
    return matches.filter((m) =>
      m.partnerFirstName.toLowerCase().includes(needle),
    );
  }, [conversationsQuery.data, query]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col">
      <ScreenBackground theme="cream" />

      <div className="relative z-10 mx-auto flex min-h-dvh w-full max-w-md flex-1 flex-col px-6 pt-8">
        <div className="mb-4 flex items-center gap-3">
          <div className="border-border/70 bg-card/45 flex flex-1 items-center gap-2.5 rounded-2xl border-[1.5px] px-4 py-3.5">
            <SearchIcon
              className="text-muted-foreground size-4 shrink-0"
              aria-hidden
            />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Rechercher un match…"
              autoFocus
              className="text-foreground placeholder:text-muted-foreground/70 min-w-0 flex-1 bg-transparent text-[14px] outline-none"
            />
          </div>
          <button
            type="button"
            onClick={() => router.back()}
            aria-label="Fermer"
            className="border-border/70 bg-card/80 text-foreground grid size-11 place-items-center rounded-full border"
          >
            <X className="size-[18px]" aria-hidden />
          </button>
        </div>

        {conversationsQuery.isLoading ? (
          <div className="flex flex-1 items-center justify-center">
            <Spinner className="size-8" />
          </div>
        ) : results.length === 0 ? (
          <EmptyState
            icon={
              <SearchIcon
                className="text-primary size-8"
                strokeWidth={1.6}
                aria-hidden
              />
            }
            title="Aucun résultat"
            description={
              query.trim()
                ? `Aucun match ne correspond à « ${query} ».`
                : "Vous n'avez pas encore de match."
            }
          />
        ) : (
          <div className="flex-1 overflow-y-auto pb-8">
            {results.map((item, index) => (
              <m.button
                key={item.matchId}
                type="button"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(index, 8) * 0.045 }}
                onClick={() => router.push(`/chat/${item.matchId}`)}
                className="border-border/70 bg-card/45 mb-2 flex w-full items-center gap-3.5 rounded-2xl border-[1.5px] px-4 py-3.5 text-left"
              >
                <Avatar
                  src={item.partnerAvatarUrl ?? undefined}
                  seed={item.partnerFirstName}
                  size={48}
                  ringColor={
                    onlineIds.has(item.partnerId) ||
                    isRecentlyOnline(item.partnerLastActiveAt)
                      ? "#3ECf8E"
                      : undefined
                  }
                />
                <span className="min-w-0 flex-1">
                  <span className="font-display text-foreground mb-0.5 block text-[14px]">
                    {item.partnerFirstName}
                  </span>
                  <span className="text-muted-foreground block truncate text-[12px]">
                    {item.lastMessage ?? "Nouveau match"}
                  </span>
                </span>
              </m.button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
