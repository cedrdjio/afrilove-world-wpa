"use client";

import { cn } from "@/lib/utils";

/**
 * Curseur simple accessible (natif `input[type=range]` stylé) : piste lavande,
 * remplissage dégradé, pouce blanc bordé. Clavier/lecteur d'écran natifs.
 */
export function Slider({
  min,
  max,
  value,
  onChange,
  ariaLabel,
  className,
}: {
  min: number;
  max: number;
  value: number;
  onChange: (value: number) => void;
  ariaLabel: string;
  className?: string;
}) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <input
      type="range"
      min={min}
      max={max}
      value={value}
      aria-label={ariaLabel}
      onChange={(e) => onChange(Number(e.target.value))}
      className={cn("af-range h-6 w-full", className)}
      style={{ "--af-fill": `${pct}%` } as React.CSSProperties}
    />
  );
}

/**
 * Curseur double (tranche d'âge). Deux `input[type=range]` superposés ; le
 * remplissage dégradé matérialise l'intervalle sélectionné.
 */
export function RangeSlider({
  min,
  max,
  valueMin,
  valueMax,
  onChange,
  ariaLabelMin,
  ariaLabelMax,
}: {
  min: number;
  max: number;
  valueMin: number;
  valueMax: number;
  onChange: (min: number, max: number) => void;
  ariaLabelMin: string;
  ariaLabelMax: string;
}) {
  const span = max - min;
  const left = ((valueMin - min) / span) * 100;
  const right = ((valueMax - min) / span) * 100;

  return (
    <div className="relative h-6">
      <div className="bg-accent/20 absolute top-1/2 h-1.5 w-full -translate-y-1/2 rounded-full" />
      <div
        className="gradient-signature absolute top-1/2 h-1.5 -translate-y-1/2 rounded-full"
        style={{ left: `${left}%`, right: `${100 - right}%` }}
      />
      <input
        type="range"
        min={min}
        max={max}
        value={valueMin}
        aria-label={ariaLabelMin}
        onChange={(e) =>
          onChange(Math.min(Number(e.target.value), valueMax - 1), valueMax)
        }
        className="af-range af-range--bare pointer-events-none absolute inset-0 h-6 w-full"
      />
      <input
        type="range"
        min={min}
        max={max}
        value={valueMax}
        aria-label={ariaLabelMax}
        onChange={(e) =>
          onChange(valueMin, Math.max(Number(e.target.value), valueMin + 1))
        }
        className="af-range af-range--bare pointer-events-none absolute inset-0 h-6 w-full"
      />
    </div>
  );
}
