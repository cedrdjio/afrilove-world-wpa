"use client";

import {
  useCallback,
  useRef,
  type PointerEvent as ReactPointerEvent,
} from "react";

import { useHaptics } from "@/hooks/use-haptics";

const TRACK_H = 5;

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function ratioToValue(ratio: number, min: number, max: number, step: number) {
  const raw = min + ratio * (max - min);
  return clamp(Math.round(raw / step) * step, min, max);
}

function Thumb({
  ratio,
  onPointerDown,
  label,
  value,
  min,
  max,
}: {
  ratio: number;
  onPointerDown: (e: ReactPointerEvent) => void;
  label: string;
  value: number;
  min: number;
  max: number;
}) {
  return (
    <span
      role="slider"
      tabIndex={0}
      aria-label={label}
      aria-valuenow={value}
      aria-valuemin={min}
      aria-valuemax={max}
      onPointerDown={onPointerDown}
      className="border-primary focus-visible:ring-ring absolute top-1/2 size-6 -translate-x-1/2 -translate-y-1/2 cursor-grab touch-none rounded-full border-[2.5px] bg-white shadow-[0_3px_8px_rgba(106,79,192,0.35)] focus-visible:ring-2 focus-visible:outline-none active:cursor-grabbing"
      style={{ left: `${ratio * 100}%` }}
    />
  );
}

interface SliderProps {
  min: number;
  max: number;
  step?: number;
  value: number;
  onChange: (value: number) => void;
  ariaLabel?: string;
}

/** Curseur simple — port de `Slider` (mobile, filtre distance). */
export function Slider({
  min,
  max,
  step = 1,
  value,
  onChange,
  ariaLabel = "Valeur",
}: SliderProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const haptic = useHaptics();
  const ratio = max > min ? (value - min) / (max - min) : 0;

  const dragTo = useCallback(
    (clientX: number) => {
      const track = trackRef.current;
      if (!track) return;
      const rect = track.getBoundingClientRect();
      const r = clamp((clientX - rect.left) / rect.width, 0, 1);
      onChange(ratioToValue(r, min, max, step));
    },
    [min, max, step, onChange],
  );

  const onPointerDown = (e: ReactPointerEvent) => {
    e.preventDefault();
    dragTo(e.clientX);
    const move = (ev: PointerEvent) => dragTo(ev.clientX);
    const up = () => {
      haptic("light");
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
  };

  return (
    <div
      ref={trackRef}
      onPointerDown={onPointerDown}
      className="relative flex h-[34px] cursor-pointer items-center"
    >
      <span
        className="bg-foreground/10 w-full rounded-full"
        style={{ height: TRACK_H }}
      />
      <span
        className="bg-primary absolute rounded-full"
        style={{ height: TRACK_H, width: `${ratio * 100}%` }}
      />
      <Thumb
        ratio={ratio}
        value={value}
        min={min}
        max={max}
        label={ariaLabel}
        onPointerDown={onPointerDown}
      />
    </div>
  );
}

interface DualSliderProps {
  min: number;
  max: number;
  step?: number;
  lowValue: number;
  highValue: number;
  onChange: (low: number, high: number) => void;
  ariaLabelLow?: string;
  ariaLabelHigh?: string;
}

/** Curseur double — port de `DualSlider` (mobile, tranche d'âge). */
export function DualSlider({
  min,
  max,
  step = 1,
  lowValue,
  highValue,
  onChange,
  ariaLabelLow = "Minimum",
  ariaLabelHigh = "Maximum",
}: DualSliderProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const haptic = useHaptics();

  const lowRatio = max > min ? (lowValue - min) / (max - min) : 0;
  const highRatio = max > min ? (highValue - min) / (max - min) : 0;

  const ratioFromX = useCallback((clientX: number) => {
    const track = trackRef.current;
    if (!track) return 0;
    const rect = track.getBoundingClientRect();
    return clamp((clientX - rect.left) / rect.width, 0, 1);
  }, []);

  const startDrag = (which: "low" | "high") => (e: ReactPointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const move = (ev: PointerEvent) => {
      const v = ratioToValue(ratioFromX(ev.clientX), min, max, step);
      if (which === "low") onChange(Math.min(v, highValue - step), highValue);
      else onChange(lowValue, Math.max(v, lowValue + step));
    };
    const up = () => {
      haptic("light");
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
  };

  // Un clic sur la piste déplace la borne la plus proche.
  const onTrackPointerDown = (e: ReactPointerEvent) => {
    const r = ratioFromX(e.clientX);
    const nearer =
      Math.abs(r - lowRatio) <= Math.abs(r - highRatio) ? "low" : "high";
    startDrag(nearer)(e);
  };

  return (
    <div
      ref={trackRef}
      onPointerDown={onTrackPointerDown}
      className="relative flex h-[34px] cursor-pointer items-center"
    >
      <span
        className="bg-foreground/10 w-full rounded-full"
        style={{ height: TRACK_H }}
      />
      <span
        className="bg-primary absolute rounded-full"
        style={{
          height: TRACK_H,
          left: `${lowRatio * 100}%`,
          width: `${Math.max(0, highRatio - lowRatio) * 100}%`,
        }}
      />
      <Thumb
        ratio={lowRatio}
        value={lowValue}
        min={min}
        max={max}
        label={ariaLabelLow}
        onPointerDown={startDrag("low")}
      />
      <Thumb
        ratio={highRatio}
        value={highValue}
        min={min}
        max={max}
        label={ariaLabelHigh}
        onPointerDown={startDrag("high")}
      />
    </div>
  );
}
