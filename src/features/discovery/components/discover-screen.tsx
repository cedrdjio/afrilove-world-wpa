"use client";

import { useState } from "react";
import Link from "next/link";
import { m } from "framer-motion";
import { Flame, MapPin, SlidersHorizontal, Menu } from "lucide-react";

import { IconButton } from "@/components/ui/icon-button";
import { ROUTES } from "@/constants/routes";
import { useAuth } from "@/providers/auth-provider";
import { cn } from "@/lib/utils";

import { MatchOverlay } from "./match-overlay";
import { SwipeDeck } from "./swipe-deck";
import { RealSwipeDeck } from "./real-swipe-deck";

type Feed = "foryou" | "nearby";

/**
 * Écran de découverte immersif (« 04 »). Fond nuit premium (indépendant du
 * thème), en-tête épuré avec sélecteur segmenté « Pour toi / À proximité »,
 * deck de swipe et overlay de match. Le vivier est déjà borné par le rayon
 * géographique (filtres) ; la vue carte « À proximité » arrivera plus tard —
 * pour l'instant les deux onglets présentent le même vivier de proximité.
 */
export function DiscoverScreen() {
  const { isAuthenticated } = useAuth();
  const [feed, setFeed] = useState<Feed>("foryou");

  return (
    <div
      className="dark relative flex min-h-dvh flex-col overflow-hidden px-5 pt-[max(1rem,env(safe-area-inset-top))] pb-28 text-white"
      style={{
        background:
          "radial-gradient(120% 80% at 50% -8%, rgba(106,79,192,0.30) 0%, transparent 56%), linear-gradient(180deg,#17131f 0%,#100d17 100%)",
      }}
    >
      <div className="bg-accent/15 pointer-events-none absolute top-40 -right-24 size-72 rounded-full blur-3xl" />

      <header className="relative z-10 flex items-center justify-between gap-3">
        <IconButton tone="glassDark" shape="round" aria-label="Menu" asChild>
          <Link href={ROUTES.events}>
            <Menu className="size-5" aria-hidden />
          </Link>
        </IconButton>

        <FeedToggle value={feed} onChange={setFeed} />

        <IconButton tone="glassDark" shape="round" aria-label="Filtres" asChild>
          <Link href={ROUTES.filters}>
            <SlidersHorizontal className="size-5" aria-hidden />
          </Link>
        </IconButton>
      </header>

      <div className="relative z-10 mt-5 flex min-h-0 flex-1 flex-col">
        {isAuthenticated ? <RealSwipeDeck /> : <SwipeDeck />}
      </div>

      {!isAuthenticated && <MatchOverlay />}
    </div>
  );
}

/** Sélecteur segmenté en verre avec pastille active glissante (layoutId). */
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
    <div className="relative flex items-center gap-1 rounded-[var(--radius-pill)] border border-white/10 bg-white/5 p-1 backdrop-blur-md">
      {tabs.map(({ key, label, Icon }) => {
        const active = value === key;
        return (
          <button
            key={key}
            type="button"
            onClick={() => onChange(key)}
            aria-pressed={active}
            className={cn(
              "relative flex items-center gap-1.5 rounded-[var(--radius-pill)] px-3.5 py-2 text-[0.82rem] font-bold whitespace-nowrap transition-colors",
              active ? "text-white" : "text-white/45 hover:text-white/70",
            )}
          >
            {active && (
              <m.span
                layoutId="feed-active"
                className="absolute inset-0 -z-10 rounded-[var(--radius-pill)] border border-white/15 bg-white/12"
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
