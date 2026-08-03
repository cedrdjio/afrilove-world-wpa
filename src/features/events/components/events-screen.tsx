"use client";

import { m } from "framer-motion";
import { Calendar, MapPin } from "lucide-react";

import { Avatar } from "@/components/ui/avatar";
import { IconButton } from "@/components/ui/icon-button";
import { DEMO_NEW_MATCHES } from "@/features/messaging/data";
import { cn } from "@/lib/utils";

import { DEMO_EVENTS } from "../data";

/**
 * Sorties communautaires (« 16 »). Carte « à la une » + liste d'événements
 * avec pastille de date et bouton « Rejoindre ».
 */
export function EventsScreen() {
  const attendees = DEMO_NEW_MATCHES.slice(0, 3);

  return (
    <div className="mx-auto w-full max-w-md px-5 pt-[max(1.25rem,env(safe-area-inset-top))] pb-[max(1.5rem,env(safe-area-inset-bottom))]">
      <header className="flex items-start justify-between">
        <div>
          <h1 className="font-display text-2xl font-extrabold">Sorties</h1>
          <p className="text-muted-foreground mt-0.5 flex items-center gap-1 text-sm">
            <MapPin className="text-accent size-3.5" aria-hidden />
            Communauté · Paris
          </p>
        </div>
        <IconButton tone="glass" aria-label="Calendrier">
          <Calendar className="size-5" aria-hidden />
        </IconButton>
      </header>

      <m.article
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.23, 1, 0.32, 1] }}
        className="from-brand-700 to-brand-500 shadow-brand relative mt-6 h-48 overflow-hidden rounded-[var(--radius-lg)] bg-gradient-to-br p-5 text-white"
      >
        <div className="absolute inset-0 bg-[radial-gradient(300px_200px_at_80%_20%,rgba(255,255,255,0.25),transparent_70%)]" />
        <span className="relative rounded-[var(--radius-pill)] bg-white/20 px-3 py-1.5 text-xs font-bold backdrop-blur-md">
          À LA UNE
        </span>
        <div className="absolute inset-x-5 bottom-5">
          <h2 className="font-display text-2xl leading-tight font-extrabold">
            Soirée Afrobeat
            <br />& Amapiano
          </h2>
          <div className="mt-2.5 flex items-center gap-2">
            <div className="flex -space-x-2.5">
              {attendees.map((peer) => (
                <Avatar
                  key={peer.id}
                  src={peer.photos[0]}
                  alt={peer.firstName}
                  size={28}
                  className="ring-2 ring-white"
                />
              ))}
            </div>
            <span className="text-sm font-semibold">+42 participants</span>
          </div>
        </div>
      </m.article>

      <div className="mt-4 space-y-3">
        {DEMO_EVENTS.map((event, i) => (
          <m.div
            key={event.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + i * 0.06, duration: 0.35 }}
            className="glass flex items-center gap-3.5 rounded-[var(--radius-lg)] p-3.5"
          >
            <div
              className={cn(
                "grid size-14 shrink-0 place-items-center rounded-[var(--radius-md)] bg-gradient-to-br text-white",
                event.accent,
              )}
            >
              <span className="font-display text-lg leading-none font-extrabold">
                {event.day}
              </span>
              <span className="text-[10px] font-semibold">{event.month}</span>
            </div>
            <div className="min-w-0 flex-1">
              <div className="font-display truncate font-bold">
                {event.title}
              </div>
              <div className="text-muted-foreground mt-0.5 truncate text-xs">
                {event.when} · {event.place}
              </div>
            </div>
            <button
              type="button"
              className="bg-accent/15 text-primary font-display shrink-0 rounded-[var(--radius-pill)] px-3.5 py-2 text-sm font-bold active:scale-95"
            >
              Rejoindre
            </button>
          </m.div>
        ))}
      </div>
    </div>
  );
}
