"use client";

import Link from "next/link";
import { SlidersHorizontal, Menu } from "lucide-react";

import { IconButton } from "@/components/ui/icon-button";
import { ROUTES } from "@/constants/routes";

import { MatchOverlay } from "./match-overlay";
import { SwipeDeck } from "./swipe-deck";

/**
 * Écran de découverte immersif (« 04 »). Fond nuit constant (indépendant du
 * thème clair/sombre) pour la lisibilité des cartes photo, en-tête en verre,
 * deck de swipe et overlay de match.
 */
export function DiscoverScreen() {
  return (
    <div
      className="dark relative flex min-h-dvh flex-col overflow-hidden px-5 pt-[max(1rem,env(safe-area-inset-top))] pb-28 text-white"
      style={{
        background:
          "linear-gradient(158deg,#2E2440 0%,#3B2C5C 52%,#4A3C7A 100%)",
      }}
    >
      <div className="bg-accent/30 pointer-events-none absolute top-32 -right-24 size-72 rounded-full blur-3xl" />
      <div className="bg-primary/30 pointer-events-none absolute bottom-24 -left-24 size-64 rounded-full blur-3xl" />

      <header className="relative z-10 flex items-center justify-between">
        <IconButton tone="glassDark" aria-label="Menu" asChild>
          <Link href={ROUTES.events}>
            <Menu className="size-5" aria-hidden />
          </Link>
        </IconButton>
        <div className="text-center">
          <h1 className="font-display text-xl font-extrabold">Découvrir</h1>
          <p className="text-xs text-white/60">Paris · rayon 12 km</p>
        </div>
        <IconButton tone="glassDark" aria-label="Filtres" asChild>
          <Link href={ROUTES.filters}>
            <SlidersHorizontal className="size-5" aria-hidden />
          </Link>
        </IconButton>
      </header>

      <div className="relative z-10 mt-5 flex min-h-0 flex-1 flex-col">
        <SwipeDeck />
      </div>

      <MatchOverlay />
    </div>
  );
}
