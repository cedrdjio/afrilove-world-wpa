"use client";

import { m } from "framer-motion";
import { Check, Heart, Star, UserRound } from "lucide-react";

import { PageHeader } from "@/components/layout/page-header";
import { Avatar } from "@/components/ui/avatar";
import { useAuth } from "@/providers/auth-provider";
import { formatTimeAgo, isToday } from "@/utils/format";

import {
  DEMO_ACTIVITY,
  type ActivityGroup,
  type ActivityItem,
  type ActivityType,
} from "../data";
import { useNotifications, useMarkAllNotificationsRead } from "../hooks";

const GROUP_LABELS: Record<ActivityGroup, string> = {
  today: "AUJOURD'HUI",
  week: "CETTE SEMAINE",
};

const BADGE: Record<
  ActivityType,
  { className: string; icon: React.ReactNode }
> = {
  match: {
    className: "gradient-signature",
    icon: <Heart className="size-3 fill-white text-white" aria-hidden />,
  },
  superlike: {
    className: "bg-warning",
    icon: <Star className="size-3 fill-white text-white" aria-hidden />,
  },
  message: {
    className: "bg-success",
    icon: <Check className="size-3 text-white" strokeWidth={3} aria-hidden />,
  },
  views: {
    className: "gradient-signature",
    icon: <UserRound className="size-3 text-white" aria-hidden />,
  },
};

/**
 * Flux d'activité / notifications (« 13 »). Données réelles (`notifications`)
 * pour un membre connecté, démo pour l'aperçu. La présentation (regroupement
 * par période, pastilles typées) reste identique.
 */
export function ActivityScreen() {
  const { isAuthenticated } = useAuth();
  if (isAuthenticated) return <RealActivity />;
  return <ActivityView items={DEMO_ACTIVITY} onReadAll={undefined} />;
}

function RealActivity() {
  const { data } = useNotifications();
  const markAll = useMarkAllNotificationsRead();

  const items: ActivityItem[] = (data ?? []).map((n) => ({
    id: n.id,
    type: n.type,
    ...(n.avatarUrl
      ? { actor: { firstName: n.title, photo: n.avatarUrl } }
      : {}),
    lead: n.title,
    text: n.body ? ` ${n.body}` : "",
    time: formatTimeAgo(n.createdAt),
    group: isToday(n.createdAt) ? "today" : "week",
  }));

  const hasUnread = (data ?? []).some((n) => n.readAt === null);

  return (
    <ActivityView
      items={items}
      onReadAll={hasUnread ? () => markAll.mutate() : undefined}
    />
  );
}

function ActivityView({
  items,
  onReadAll,
}: {
  items: ActivityItem[];
  onReadAll: (() => void) | undefined;
}) {
  const groups = ["today", "week"] as const;

  return (
    <div className="mx-auto w-full max-w-md px-5 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
      <PageHeader
        title="Activité"
        trailing={
          onReadAll ? (
            <button
              type="button"
              onClick={onReadAll}
              className="text-primary shrink-0 text-sm font-bold"
            >
              Tout lire
            </button>
          ) : undefined
        }
      />

      {items.length === 0 ? (
        <EmptyActivity />
      ) : (
        <div className="mt-6 space-y-2.5">
          {groups.map((group) => {
            const groupItems = items.filter((i) => i.group === group);
            if (groupItems.length === 0) return null;
            return (
              <section key={group}>
                <h2 className="text-subtle-foreground font-display mt-4 mb-2 text-xs font-bold tracking-wide">
                  {GROUP_LABELS[group]}
                </h2>
                <div className="space-y-2.5">
                  {groupItems.map((item, i) => (
                    <ActivityRow key={item.id} item={item} index={i} />
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}

function EmptyActivity() {
  return (
    <div className="mt-24 flex flex-col items-center text-center">
      <span className="bg-accent/15 grid size-16 place-items-center rounded-full">
        <Heart className="text-primary size-8" aria-hidden />
      </span>
      <p className="font-display mt-4 text-lg font-bold">
        Rien de neuf pour l&apos;instant
      </p>
      <p className="text-muted-foreground mt-1 max-w-xs text-sm">
        Tes matchs, likes et messages apparaîtront ici.
      </p>
    </div>
  );
}

function ActivityRow({ item, index }: { item: ActivityItem; index: number }) {
  const badge = BADGE[item.type];
  return (
    <m.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      className="glass flex items-center gap-3 rounded-[var(--radius-md)] p-3.5"
    >
      <div className="relative shrink-0">
        {item.actor ? (
          <Avatar
            src={item.actor.photo}
            alt={item.actor.firstName}
            size={48}
            rounded="lg"
          />
        ) : (
          <span className="gradient-signature grid size-12 place-items-center rounded-[var(--radius-md)]">
            <UserRound className="size-6 text-white" aria-hidden />
          </span>
        )}
        <span
          className={`border-card absolute -right-1 -bottom-1 grid size-6 place-items-center rounded-full border-2 ${badge.className}`}
        >
          {badge.icon}
        </span>
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm leading-snug">
          <b className="font-display">{item.lead}</b>
          {item.text}
        </p>
        <p className="text-subtle-foreground mt-0.5 text-xs">{item.time}</p>
      </div>
    </m.div>
  );
}
