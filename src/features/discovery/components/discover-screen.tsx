"use client";

import { useState } from "react";
import Link from "next/link";
import { m } from "framer-motion";
import { Flame, MapPin, SlidersHorizontal } from "lucide-react";

import { ROUTES } from "@/constants/routes";
import { useAuth } from "@/providers/auth-provider";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/layout/theme-toggle";

import { MatchOverlay } from "./match-overlay";
import { SwipeDeck } from "./swipe-deck";
import { RealSwipeDeck } from "./real-swipe-deck";

type Feed = "foryou" | "nearby";

/**
 * Écran de découverte (« 04 ») façon maquette PURELY : fond clair épuré qui
 * suit le thème (clair par défaut, sombre pilotable depuis les Réglages),
 * en-tête minimal (sélecteur « Pour toi / À proximité » + filtres uniquement),
 * deck de swipe et overlay de match. Le vivier est déjà borné par le rayon
 * géographique ; la vraie vue carte « À proximité » arrivera plus tard — pour
 * l'instant les deux onglets présentent le même vivier de proximité.
 */
export function DiscoverScreen() {
  const { isAuthenticated } = useAuth();
  const [feed, setFeed] = useState<Feed>("foryou");

  return (
    <div className="bg-background text-foreground relative flex min-h-dvh flex-col overflow-hidden px-5 pt-[max(1rem,env(safe-area-inset-top))] pb-28">
      {/* Halo de marque discret — fonctionne en clair comme en sombre. */}
      <div className="bg-accent/15 pointer-events-none absolute -top-20 -right-24 size-72 rounded-full blur-3xl" />
      <div className="bg-brand-400/10 pointer-events-none absolute top-1/3 -left-28 size-64 rounded-full blur-3xl" />

      {/* Barre du haut : marque à gauche, actions à droite (thème + filtres).
          Le sélecteur Pour toi / À proximité descend sur sa propre ligne. */}
      <header className="relative z-10 flex items-center justify-between gap-3">
        <span className="font-display text-xl font-extrabold tracking-tight">
          Découvrir
        </span>
        <div className="flex items-center gap-2">
          <ThemeToggle className="size-11" />
          <Link
            href={ROUTES.filters}
            aria-label="Filtres"
            className="border-border bg-card text-foreground shadow-soft hover:bg-muted focus-visible:ring-ring grid size-11 shrink-0 place-items-center rounded-full border transition-colors focus-visible:ring-2 focus-visible:outline-none active:scale-95"
          >
            <SlidersHorizontal className="size-5" aria-hidden />
          </Link>
        </div>
      </header>

      <div className="relative z-10 mt-4 flex justify-center">
        <FeedToggle value={feed} onChange={setFeed} />
      </div>

      <div className="relative z-10 mt-4 flex min-h-0 flex-1 flex-col">
        {isAuthenticated ? <RealSwipeDeck feed={feed} /> : <SwipeDeck />}
      </div>

      {!isAuthenticated && <MatchOverlay />}
    </div>
  );
}

/** Sélecteur segmenté avec pastille active glissante (layoutId), theme-aware. */
function FeedToggle({
  value,
  onChange,
}: {
  value: Feed;
  onChange: (feed: Feed) => void;
}) {
  const tabs = [
    { key: "foryou" as const, label: "Pour toi", Icon: Flame },
    { key: "nearby" as const, label: "À proximité", Icon: MapPin },
  ];

  return (
    <div className="bg-card/85 border-border shadow-soft relative flex items-center gap-1 rounded-[var(--radius-pill)] border p-1 backdrop-blur-md">
      {tabs.map(({ key, label, Icon }) => {
        const active = value === key;
        return (
          <button
            key={key}
            type="button"
            onClick={() => onChange(key)}
            aria-pressed={active}
            className={cn(
              "relative flex items-center gap-1.5 rounded-[var(--radius-pill)] px-5 py-2 text-[0.82rem] font-bold whitespace-nowrap transition-colors",
              active
                ? "text-primary-foreground"
                : "text-foreground/70 hover:text-foreground",
            )}
          >
            {active && (
              <m.span
                layoutId="feed-active"
                className="gradient-signature shadow-brand absolute inset-0 -z-10 rounded-[var(--radius-pill)]"
                transition={{ type: "spring", stiffness: 420, damping: 34 }}
                aria-hidden
              />
            )}
            <Icon className="size-4" aria-hidden />
            {label}
          </button>
        );
      })}
    </div>
  );
}
