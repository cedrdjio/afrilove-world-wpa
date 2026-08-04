"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { m } from "framer-motion";
import {
  ArrowLeft,
  Bell,
  Heart,
  MessageCircle,
  Star,
  ShieldCheck,
  Megaphone,
  type LucideIcon,
} from "lucide-react";

import { ScreenBackground } from "@/components/layout/screen-background";
import { GlowOrb } from "@/components/layout/glow-orb";
import { Chip } from "@/components/ui/chip";
import { Spinner } from "@/components/ui/spinner";
import { EmptyState, ErrorState } from "@/components/feedback";
import { mapToAppError } from "@/lib/errors";
import { ROUTES, dynamicRoutes } from "@/constants/routes";
import { formatConversationTime } from "@/features/messaging/utils/time";
import {
  useNotificationsQuery,
  useMarkAllNotificationsRead,
} from "@/features/notifications/hooks/use-notifications";
import type {
  AppNotification,
  NotificationType,
} from "@/features/notifications/types";

const FILTERS: { key: "all" | NotificationType; label: string }[] = [
  { key: "all", label: "Tous" },
  { key: "match", label: "Matches" },
  { key: "message", label: "Messages" },
  { key: "like", label: "Likes" },
  { key: "kyc", label: "Vérification" },
  { key: "admin", label: "Annonces" },
];

const TYPE_STYLE: Record<
  NotificationType,
  { Icon: LucideIcon; accent: string }
> = {
  match: { Icon: Heart, accent: "#6A4FC0" },
  message: { Icon: MessageCircle, accent: "#D99B2B" },
  like: { Icon: Star, accent: "#9B7EDE" },
  kyc: { Icon: ShieldCheck, accent: "#3ECf8E" },
  admin: { Icon: Megaphone, accent: "#8E8A99" },
};

/** Centre de notifications in-app — port de `NotificationsScreen` (mobile). */
export default function NotificationsPage() {
  const router = useRouter();
  const [filter, setFilter] = useState<"all" | NotificationType>("all");
  const notificationsQuery = useNotificationsQuery();
  const markAllRead = useMarkAllNotificationsRead();

  const notifications = notificationsQuery.data ?? [];
  const filtered =
    filter === "all"
      ? notifications
      : notifications.filter((n) => n.type === filter);
  const hasUnread = notifications.some((n) => !n.read);

  const openNotification = (notification: AppNotification) => {
    const matchId = notification.data.match_id;
    if (
      (notification.type === "message" || notification.type === "match") &&
      typeof matchId === "string"
    ) {
      router.push(dynamicRoutes.chat(matchId));
    } else if (notification.type === "kyc") {
      router.push(ROUTES.kycPending);
    }
  };

  return (
    <div className="relative flex min-h-dvh flex-col">
      <ScreenBackground theme="cream">
        <GlowOrb
          size={220}
          color="rgba(155,126,222,0.08)"
          bottom={-40}
          left={-40}
          duration={10}
        />
      </ScreenBackground>

      <div className="relative z-10 mx-auto flex w-full max-w-md flex-1 flex-col px-6 pt-8">
        <div className="mb-5 flex items-center justify-between">
          <button
            type="button"
            onClick={() => router.back()}
            aria-label="Retour"
            className="border-border/70 bg-card/80 text-foreground grid size-11 place-items-center rounded-full border"
          >
            <ArrowLeft className="size-[19px]" aria-hidden />
          </button>
          <h1 className="font-display text-foreground text-[22px]">
            Notifications
          </h1>
          {hasUnread ? (
            <button
              type="button"
              onClick={() => markAllRead.mutate()}
              disabled={markAllRead.isPending}
              className="bg-brand-500/10 text-brand-600 font-display rounded-full px-3.5 py-2 text-[10.5px] font-bold disabled:opacity-60"
            >
              {markAllRead.isPending ? "…" : "Tout lire"}
            </button>
          ) : (
            <span className="w-11" aria-hidden />
          )}
        </div>

        <div className="-mx-1 mb-5 flex gap-2 overflow-x-auto pb-1">
          {FILTERS.map((item) => (
            <div key={item.key} className="shrink-0">
              <Chip
                label={item.label}
                selected={filter === item.key}
                onClick={() => setFilter(item.key)}
                size="sm"
              />
            </div>
          ))}
        </div>

        {notificationsQuery.isLoading ? (
          <div className="flex flex-1 items-center justify-center">
            <Spinner className="size-8" />
          </div>
        ) : notificationsQuery.isError ? (
          <div className="flex flex-1 items-center justify-center">
            <ErrorState
              error={mapToAppError(notificationsQuery.error)}
              onRetry={() => void notificationsQuery.refetch()}
            />
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={
              <Bell
                className="text-primary size-8"
                strokeWidth={1.6}
                aria-hidden
              />
            }
            title="Aucune notification"
            description="Vous êtes à jour ! Revenez plus tard."
          />
        ) : (
          <div className="flex-1 overflow-y-auto pb-8">
            {filtered.map((item, index) => {
              // Un type inconnu (nouveau type serveur) retombe sur le style
              // « annonce » plutôt que de casser le rendu.
              const { Icon, accent } =
                TYPE_STYLE[item.type] ?? TYPE_STYLE.admin;
              return (
                <m.button
                  key={item.id}
                  type="button"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(index, 8) * 0.04 }}
                  onClick={() => openNotification(item)}
                  className={`border-border/80 bg-card/45 mb-2 flex w-full items-center gap-3 rounded-2xl border-[1.5px] px-4 py-3.5 text-left transition-opacity active:opacity-85 ${
                    item.read ? "opacity-70" : ""
                  }`}
                  style={
                    !item.read
                      ? { borderLeftWidth: 3.5, borderLeftColor: accent }
                      : undefined
                  }
                >
                  <span
                    className="grid size-[46px] shrink-0 place-items-center rounded-full"
                    style={{ backgroundColor: `${accent}1A` }}
                  >
                    <Icon
                      className="size-[22px]"
                      style={{ color: accent }}
                      aria-hidden
                    />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="text-foreground font-display mb-0.5 block text-[13px] leading-[17px]">
                      {item.title}
                    </span>
                    {item.body ? (
                      <span className="text-muted-foreground mb-0.5 block truncate text-[11.5px]">
                        {item.body}
                      </span>
                    ) : null}
                    <span className="text-foreground/40 block text-[11px]">
                      {formatConversationTime(item.createdAt)}
                    </span>
                  </span>
                </m.button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
