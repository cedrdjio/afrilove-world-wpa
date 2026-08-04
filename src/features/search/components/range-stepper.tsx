"use client";

import { Minus, Plus } from "lucide-react";

function Stepper({
  value,
  onChange,
  min,
  max,
}: {
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
}) {
  return (
    <div className="flex items-center gap-4">
      <button
        type="button"
        onClick={() => onChange(Math.max(min, value - 1))}
        aria-label="Diminuer"
        className="border-border/60 bg-card/60 text-foreground grid size-10 place-items-center rounded-[16px] border"
      >
        <Minus className="size-4" aria-hidden />
      </button>
      <span className="font-display text-foreground w-12 text-center text-[22px]">
        {value}
      </span>
      <button
        type="button"
        onClick={() => onChange(Math.min(max, value + 1))}
        aria-label="Augmenter"
        className="border-border/60 bg-card/60 text-foreground grid size-10 place-items-center rounded-[16px] border"
      >
        <Plus className="size-4" aria-hidden />
      </button>
    </div>
  );
}

/** Double compteur borné (min/max) — port de `RangeStepper`. */
export function RangeStepper({
  min,
  max,
  low,
  high,
  onChange,
  unit,
}: {
  min: number;
  max: number;
  low: number;
  high: number;
  onChange: (low: number, high: number) => void;
  unit?: string;
}) {
  return (
    <div className="border-border/70 bg-card/45 flex items-center justify-between rounded-2xl border px-5 py-5">
      <Stepper
        value={low}
        onChange={(v) => onChange(Math.min(v, high), high)}
        min={min}
        max={max}
      />
      <span className="text-muted-foreground text-[12px] font-medium">
        {unit ?? "à"}
      </span>
      <Stepper
        value={high}
        onChange={(v) => onChange(low, Math.max(v, low))}
        min={min}
        max={max}
      />
    </div>
  );
}
