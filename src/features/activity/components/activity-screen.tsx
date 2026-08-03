"use client";

import { m } from "framer-motion";
import { Check, Heart, Star, UserRound } from "lucide-react";

import { PageHeader } from "@/components/layout/page-header";
import { Avatar } from "@/components/ui/avatar";
import {
  DEMO_ACTIVITY,
  type ActivityGroup,
  type ActivityItem,
  type ActivityType,
} from "../data";

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
 * Flux d'activité / notifications (« 13 »). Regroupé par période, chaque entrée
 * porte une pastille typée (match, super like, message, vues).
 */
export function ActivityScreen() {
  const groups = ["today", "week"] as const;

  return (
    <div className="mx-auto w-full max-w-md px-5 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
      <PageHeader
        title="Activité"
        trailing={
          <button
            type="button"
            className="text-primary shrink-0 text-sm font-bold"
          >
            Tout lire
          </button>
        }
      />

      <div className="mt-6 space-y-2.5">
        {groups.map((group) => {
          const items = DEMO_ACTIVITY.filter((i) => i.group === group);
          if (items.length === 0) return null;
          return (
            <section key={group}>
              <h2 className="text-subtle-foreground font-display mt-4 mb-2 text-xs font-bold tracking-wide">
                {GROUP_LABELS[group]}
              </h2>
              <div className="space-y-2.5">
                {items.map((item, i) => (
                  <ActivityRow key={item.id} item={item} index={i} />
                ))}
              </div>
            </section>
          );
        })}
      </div>
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
            src={item.actor.photos[0]}
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
