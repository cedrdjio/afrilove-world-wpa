"use client";

import { m } from "framer-motion";

interface GlowOrbProps {
  size: number;
  /** rgba(...) — l'alpha est l'intensité au cœur du halo. */
  color: string;
  top?: number;
  bottom?: number;
  left?: number;
  right?: number;
  delay?: number;
  duration?: number;
}

/**
 * Halo lumineux flottant — port de `GlowOrb` (mobile). Un vrai dégradé radial
 * qui s'estompe vers la transparence, dérivant lentement (respecte
 * prefers-reduced-motion via MotionConfig global).
 */
export function GlowOrb({
  size,
  color,
  top,
  bottom,
  left,
  right,
  delay = 0,
  duration = 9,
}: GlowOrbProps) {
  return (
    <m.span
      aria-hidden
      className="pointer-events-none absolute rounded-full"
      style={{
        width: size,
        height: size,
        top,
        bottom,
        left,
        right,
        background: `radial-gradient(circle at center, ${color} 0%, transparent 70%)`,
      }}
      initial={{ opacity: 0.75, scale: 1, x: 0, y: 0 }}
      animate={{
        opacity: [0.75, 1, 0.75],
        scale: [1, 1.1, 1],
        x: [0, 14, 0],
        y: [0, -10, 0],
      }}
      transition={{
        duration,
        delay,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    />
  );
}
