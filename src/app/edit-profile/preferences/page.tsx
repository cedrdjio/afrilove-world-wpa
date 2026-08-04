"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Minus, Plus } from "lucide-react";

import { EditScreenLayout } from "@/features/profile/components/edit-screen-layout";
import { Chip } from "@/components/ui/chip";

const LOOKING_FOR_OPTIONS = ["Des femmes", "Des hommes", "Les deux"];
const DISTANCE_OPTIONS = [5, 10, 25, 50, 100];

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
    <div className="flex items-center gap-3.5">
      <button
        type="button"
        onClick={() => onChange(Math.max(min, value - 1))}
        aria-label="Diminuer"
        className="border-border/60 bg-card/60 text-foreground grid size-9 place-items-center rounded-[14px] border"
      >
        <Minus className="size-3.5" aria-hidden />
      </button>
      <span className="font-display text-foreground w-8 text-center text-[20px]">
        {value}
      </span>
      <button
        type="button"
        onClick={() => onChange(Math.min(max, value + 1))}
        aria-label="Augmenter"
        className="border-border/60 bg-card/60 text-foreground grid size-9 place-items-center rounded-[14px] border"
      >
        <Plus className="size-3.5" aria-hidden />
      </button>
    </div>
  );
}

/**
 * Préférences de rencontre — port de `EditPreferencesScreen`. Comme sur mobile,
 * cet écran est pour l'instant une maquette locale non persistée : les vraies
 * préférences de recherche (distance, tranche d'âge, genre recherché appliqués
 * à la découverte) relèvent du Jalon 7 (Recherche avancée).
 */
export default function EditPreferencesPage() {
  const router = useRouter();
  const [lookingFor, setLookingFor] = useState("Des hommes");
  const [distance, setDistance] = useState(25);
  const [ageMin, setAgeMin] = useState(24);
  const [ageMax, setAgeMax] = useState(35);

  return (
    <EditScreenLayout title="Préférences" onSave={() => router.back()}>
      <p className="text-foreground/40 font-display mb-2.5 text-[11px] tracking-wide uppercase">
        Je recherche
      </p>
      <div className="mb-6 flex flex-wrap gap-2">
        {LOOKING_FOR_OPTIONS.map((option) => (
          <Chip
            key={option}
            label={option}
            selected={lookingFor === option}
            onClick={() => setLookingFor(option)}
          />
        ))}
      </div>

      <p className="text-foreground/40 font-display mb-2.5 text-[11px] tracking-wide uppercase">
        Distance maximale
      </p>
      <div className="mb-6 flex flex-wrap gap-2">
        {DISTANCE_OPTIONS.map((option) => (
          <Chip
            key={option}
            label={`${option} km`}
            selected={distance === option}
            onClick={() => setDistance(option)}
          />
        ))}
      </div>

      <p className="text-foreground/40 font-display mb-2.5 text-[11px] tracking-wide uppercase">
        Tranche d’âge
      </p>
      <div className="border-border/70 bg-card/45 flex items-center justify-between rounded-2xl border px-5 py-4">
        <Stepper
          value={ageMin}
          onChange={(v) => setAgeMin(Math.min(v, ageMax))}
          min={18}
          max={ageMax}
        />
        <span className="text-muted-foreground text-[12px] font-medium">à</span>
        <Stepper
          value={ageMax}
          onChange={(v) => setAgeMax(Math.max(v, ageMin))}
          min={ageMin}
          max={99}
        />
      </div>
    </EditScreenLayout>
  );
}
