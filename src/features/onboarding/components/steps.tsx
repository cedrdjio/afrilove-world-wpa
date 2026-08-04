"use client";

import { useState } from "react";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Spinner } from "@/components/ui/spinner";
import {
  GENDER_OPTIONS,
  LOOKING_FOR_OPTIONS,
  type Option,
} from "@/features/onboarding/config";
import { type InterestOption } from "@/features/onboarding/service";
import { useLifestyleCategories } from "@/features/onboarding/hooks/use-lifestyle-categories";
import {
  MAX_BIO,
  MIN_BIO,
  MIN_INTERESTS,
  type OnboardingData,
} from "@/features/onboarding/types";
import { Choice } from "./choice";

type Patch = (patch: Partial<OnboardingData>) => void;
interface StepProps {
  data: OnboardingData;
  patch: Patch;
}

/** Grille de choix uniques réutilisable. */
function SingleSelect<T extends string>({
  options,
  value,
  onPick,
}: {
  options: Option<T>[];
  value: T | null;
  onPick: (v: T) => void;
}) {
  return (
    <div className="flex flex-col gap-3">
      {options.map((o) => (
        <Choice
          key={o.value}
          label={o.label}
          description={o.description}
          icon={o.icon}
          selected={value === o.value}
          onSelect={() => onPick(o.value)}
        />
      ))}
    </div>
  );
}

export function GenderStep({ data, patch }: StepProps) {
  return (
    <SingleSelect
      options={GENDER_OPTIONS}
      value={data.gender}
      onPick={(gender) => patch({ gender })}
    />
  );
}

export function LookingForStep({ data, patch }: StepProps) {
  return (
    <SingleSelect
      options={LOOKING_FOR_OPTIONS}
      value={data.lookingFor}
      onPick={(lookingFor) => patch({ lookingFor })}
    />
  );
}

export function BirthDateStep({ data, patch }: StepProps) {
  // « Aujourd'hui » capturé une seule fois (init paresseux) : évite tout appel
  // impur (Date.now / new Date sans argument) pendant le rendu.
  const [today] = useState(() => {
    const t = new Date();
    return {
      ts: t.getTime(),
      max: new Date(t.getFullYear() - 18, t.getMonth(), t.getDate())
        .toISOString()
        .slice(0, 10),
      min: new Date(t.getFullYear() - 100, 0, 1).toISOString().slice(0, 10),
    };
  });
  const { max, min } = today;
  const age = data.birthDate
    ? Math.floor((today.ts - new Date(data.birthDate).getTime()) / 3.15576e10)
    : null;

  return (
    <div className="flex flex-col gap-3">
      <Input
        type="date"
        value={data.birthDate ?? ""}
        max={max}
        min={min}
        onChange={(e) => patch({ birthDate: e.target.value || null })}
        aria-label="Date de naissance"
      />
      {age !== null ? (
        <p className="text-muted-foreground text-sm">
          Vous avez <span className="text-primary font-bold">{age} ans</span>.
          Seul votre âge sera visible, jamais votre date de naissance.
        </p>
      ) : (
        <p className="text-muted-foreground text-sm">
          Vous devez avoir au moins 18 ans pour utiliser AfriLove World.
        </p>
      )}
    </div>
  );
}

export function BioStep({ data, patch }: StepProps) {
  const length = data.bio.trim().length;
  return (
    <div className="flex flex-col gap-2">
      <Textarea
        rows={6}
        maxLength={MAX_BIO}
        value={data.bio}
        placeholder="Passionné(e) de voyages, toujours partant(e) pour un bon plat et de belles conversations…"
        onChange={(e) => patch({ bio: e.target.value.slice(0, MAX_BIO) })}
        aria-label="Bio"
      />
      <p className="text-muted-foreground self-end text-xs tabular-nums">
        {length}/{MAX_BIO} · min. {MIN_BIO}
      </p>
    </div>
  );
}

function LifestyleGroup({
  title,
  options,
  value,
  onPick,
}: {
  title: string;
  options: { value: string; label: string }[];
  value: string | null;
  onPick: (v: string) => void;
}) {
  return (
    <div className="flex flex-col gap-2">
      <p className="text-foreground text-sm font-semibold">{title}</p>
      <div className="grid grid-cols-3 gap-2">
        {options.map((o) => (
          <Choice
            key={o.value}
            compact
            label={o.label}
            selected={value === o.value}
            onSelect={() => onPick(o.value)}
          />
        ))}
      </div>
    </div>
  );
}

export function LifestyleStep({ data, patch }: StepProps) {
  // Options chargées depuis `lifestyle_options` (gérées au dashboard) avec
  // repli local — port de `LifestyleScreen` + `useLifestyleCategories`.
  const { categories, isLoading } = useLifestyleCategories();

  if (isLoading) {
    return (
      <div className="grid place-items-center py-16">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {categories.map((category) => (
        <LifestyleGroup
          key={category.key}
          title={category.label}
          options={category.options}
          value={data[category.key]}
          onPick={(value) =>
            patch({ [category.key]: value } as Partial<OnboardingData>)
          }
        />
      ))}
    </div>
  );
}

export function InterestsStep({
  data,
  patch,
  interests,
}: StepProps & { interests: InterestOption[] }) {
  const selected = new Set(data.interestIds);
  const toggle = (id: string) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    patch({ interestIds: [...next] });
  };
  return (
    <div className="flex flex-col gap-4">
      <p className="text-muted-foreground text-sm">
        Choisissez-en au moins {MIN_INTERESTS} —{" "}
        <span className="text-primary font-semibold">
          {selected.size} sélectionné{selected.size > 1 ? "s" : ""}
        </span>
      </p>
      <div className="flex flex-wrap gap-2">
        {interests.map((i) => (
          <Choice
            key={i.id}
            compact
            label={i.label}
            icon={i.icon ?? undefined}
            selected={selected.has(i.id)}
            onSelect={() => toggle(i.id)}
          />
        ))}
      </div>
    </div>
  );
}
