"use client";

import { useState } from "react";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  CHILDREN_OPTIONS,
  DRINKING_OPTIONS,
  GENDER_OPTIONS,
  GYM_OPTIONS,
  LOOKING_FOR_OPTIONS,
  type Option,
  PETS_OPTIONS,
  SMOKING_OPTIONS,
} from "@/features/onboarding/config";
import {
  type CountryOption,
  type InterestOption,
} from "@/features/onboarding/service";
import {
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
          Vous devez avoir au moins 18 ans.
        </p>
      )}
    </div>
  );
}

export function LocationStep({
  data,
  patch,
  countries,
}: StepProps & { countries: CountryOption[] }) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="country" className="text-sm font-semibold">
          Pays
        </label>
        <select
          id="country"
          value={data.country ?? ""}
          onChange={(e) => patch({ country: e.target.value || null })}
          className="border-border bg-muted/40 text-foreground focus-visible:border-primary focus-visible:ring-ring/40 h-12 w-full rounded-[var(--radius-md)] border px-4 text-[0.95rem] focus-visible:ring-2 focus-visible:outline-none"
        >
          <option value="">Sélectionner…</option>
          {countries.map((c) => (
            <option key={c.key} value={c.label}>
              {c.emoji ? `${c.emoji}  ` : ""}
              {c.label}
            </option>
          ))}
        </select>
      </div>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="city" className="text-sm font-semibold">
          Ville
        </label>
        <Input
          id="city"
          value={data.city ?? ""}
          placeholder="Votre ville"
          onChange={(e) => patch({ city: e.target.value || null })}
        />
      </div>
    </div>
  );
}

const BIO_MAX = 500;
export function BioStep({ data, patch }: StepProps) {
  return (
    <div className="flex flex-col gap-2">
      <Textarea
        rows={6}
        maxLength={BIO_MAX}
        value={data.bio}
        placeholder="Parlez de vous, de ce que vous aimez, de ce que vous recherchez…"
        onChange={(e) => patch({ bio: e.target.value })}
        aria-label="Bio"
      />
      <p className="text-muted-foreground self-end text-xs tabular-nums">
        {data.bio.length}/{BIO_MAX}
      </p>
    </div>
  );
}

function LifestyleGroup<T extends string>({
  title,
  options,
  value,
  onPick,
}: {
  title: string;
  options: Option<T>[];
  value: T | null;
  onPick: (v: T) => void;
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
            icon={o.icon}
            selected={value === o.value}
            onSelect={() => onPick(o.value)}
          />
        ))}
      </div>
    </div>
  );
}

export function LifestyleStep({ data, patch }: StepProps) {
  return (
    <div className="flex flex-col gap-6">
      <LifestyleGroup
        title="Tabac"
        options={SMOKING_OPTIONS}
        value={data.smoking}
        onPick={(smoking) => patch({ smoking })}
      />
      <LifestyleGroup
        title="Alcool"
        options={DRINKING_OPTIONS}
        value={data.drinking}
        onPick={(drinking) => patch({ drinking })}
      />
      <LifestyleGroup
        title="Sport"
        options={GYM_OPTIONS}
        value={data.gymHabit}
        onPick={(gymHabit) => patch({ gymHabit })}
      />
      <LifestyleGroup
        title="Animaux"
        options={PETS_OPTIONS}
        value={data.hasPets}
        onPick={(hasPets) => patch({ hasPets })}
      />
      <LifestyleGroup
        title="Enfants"
        options={CHILDREN_OPTIONS}
        value={data.wantsChildren}
        onPick={(wantsChildren) => patch({ wantsChildren })}
      />
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

export function ReviewStep({ data }: StepProps) {
  const rows: [string, string][] = [
    [
      "Je suis",
      GENDER_OPTIONS.find((o) => o.value === data.gender)?.label ?? "—",
    ],
    [
      "Je recherche",
      LOOKING_FOR_OPTIONS.find((o) => o.value === data.lookingFor)?.label ??
        "—",
    ],
    [
      "Localisation",
      [data.city, data.country].filter(Boolean).join(", ") || "—",
    ],
    ["Centres d’intérêt", `${data.interestIds.length} sélectionnés`],
  ];
  return (
    <div className="flex flex-col gap-3">
      <div className="border-border bg-card divide-border divide-y rounded-[var(--radius-lg)] border">
        {rows.map(([k, v]) => (
          <div key={k} className="flex items-center justify-between px-4 py-3">
            <span className="text-muted-foreground text-sm">{k}</span>
            <span className="text-foreground text-sm font-semibold">{v}</span>
          </div>
        ))}
      </div>
      <p className="text-muted-foreground text-sm leading-relaxed">
        Vous pourrez tout modifier depuis votre profil. Ajoutez vos photos à
        l’étape suivante pour apparaître dans la découverte.
      </p>
    </div>
  );
}
