"use client";

import { m } from "framer-motion";

import { ScreenBackground } from "@/components/layout/screen-background";
import { Logo } from "@/components/brand/logo";

/**
 * Chargement plein écran de marque — port de `FullScreenLoader` (mobile).
 * Le mobile joue un Lottie « hearts-loader » ; on reproduit ici un cœur qui
 * bat + un anneau lavande tournant, sans dépendance Lottie (parité visuelle
 * revisitée au Jalon 13 si besoin). Respecte `prefers-reduced-motion` via le
 * `MotionConfig` global.
 */
export function FullScreenLoader({
  label = "Chargement…",
}: {
  label?: string;
}) {
  return (
    <div className="relative grid min-h-dvh place-items-center" role="status">
      <ScreenBackground theme="cream" />
      <div className="relative z-10 flex flex-col items-center gap-6">
        <Logo size="lg" showWordmark={false} />
        <m.span
          aria-hidden
          className="border-brand-300 border-t-primary inline-block size-8 rounded-full border-[3px]"
          animate={{ rotate: 360 }}
          transition={{ duration: 0.9, repeat: Infinity, ease: "linear" }}
        />
        <span className="text-muted-foreground font-display text-[12px] font-semibold">
          {label}
        </span>
      </div>
    </div>
  );
}
