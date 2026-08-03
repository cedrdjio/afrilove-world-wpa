"use client";

import { useState } from "react";
import { Cake, Loader2, MapPin, Navigation } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
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
import { useGeolocation } from "@/features/onboarding/use-geolocation";
import { Choice } from "./choice";

type Patch = (patch: Partial<OnboardingData>) => void;
interface StepProps {
  data: OnboardingData;
  patch: Patch;
}

/** Grille de choix uniques réutilisable (cartes pleine largeur). */
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
    <div className="flex flex-col gap-4">
      <label
        htmlFor="birthDate"
        className={cn(
          "focus-within:border-primary flex items-center gap-3 rounded-[var(--radius-lg)] border px-4 py-3.5 transition-colors",
          data.birthDate
            ? "border-primary/60 bg-primary/[0.04]"
            : "border-border bg-card",
        )}
      >
        <span
          className={cn(
            "grid size-11 shrink-0 place-items-center rounded-[var(--radius-md)]",
            data.birthDate
              ? "gradient-signature text-white"
              : "bg-muted text-muted-foreground",
          )}
          aria-hidden
        >
          <Cake className="size-5" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="text-muted-foreground block text-xs font-medium">
            Date de naissance
          </span>
          <input
            id="birthDate"
            type="date"
            value={data.birthDate ?? ""}
            max={max}
            min={min}
            onChange={(e) => patch({ birthDate: e.target.value || null })}
            aria-label="Date de naissance"
            className="text-foreground w-full bg-transparent text-[1.05rem] font-semibold outline-none"
          />
        </span>
      </label>
      {age !== null ? (
        <p className="text-muted-foreground text-sm leading-relaxed">
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
  const { status, request } = useGeolocation();
  const locating = status === "locating";

  async function useMyLocation() {
    const place = await request();
    if (!place) return;
    patch({
      ...(place.country ? { country: place.country } : {}),
      ...(place.city ? { city: place.city } : {}),
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <button
        type="button"
        onClick={useMyLocation}
        disabled={locating}
        className="border-primary/40 bg-primary/[0.05] flex items-center gap-3.5 rounded-[var(--radius-lg)] border px-4 py-3.5 text-left transition-all active:scale-[0.99] disabled:opacity-70"
      >
        <span
          className="gradient-signature grid size-11 shrink-0 place-items-center rounded-[var(--radius-md)] text-white"
          aria-hidden
        >
          {locating ? (
            <Loader2 className="size-5 animate-spin" />
          ) : (
            <Navigation className="size-5" />
          )}
        </span>
        <span className="min-w-0 flex-1">
          <span className="text-primary block text-[0.98rem] font-semibold">
            {locating ? "Localisation en cours…" : "Utiliser ma position"}
          </span>
          <span className="text-muted-foreground block text-xs leading-snug">
            Renseigne automatiquement votre pays et votre ville.
          </span>
        </span>
      </button>

      {status === "denied" ? (
        <p className="text-danger text-xs leading-snug">
          Permission refusée. Autorisez la localisation dans les réglages, ou
          renseignez votre pays manuellement ci-dessous.
        </p>
      ) : status === "unsupported" ? (
        <p className="text-muted-foreground text-xs leading-snug">
          Géolocalisation indisponible sur cet appareil — saisie manuelle
          ci-dessous.
        </p>
      ) : status === "error" ? (
        <p className="text-muted-foreground text-xs leading-snug">
          Position introuvable. Réessayez ou renseignez-la manuellement.
        </p>
      ) : null}

      <div className="flex items-center gap-3">
        <span className="bg-border h-px flex-1" />
        <span className="text-subtle-foreground text-xs font-medium">ou</span>
        <span className="bg-border h-px flex-1" />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="country" className="text-sm font-semibold">
          Pays
        </label>
        <div className="relative">
          <MapPin
            className="text-muted-foreground pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2"
            aria-hidden
          />
          <select
            id="country"
            value={data.country ?? ""}
            onChange={(e) => patch({ country: e.target.value || null })}
            className="border-border bg-muted/40 text-foreground focus-visible:border-primary focus-visible:ring-ring/40 h-12 w-full rounded-[var(--radius-md)] border pr-4 pl-10 text-[0.95rem] focus-visible:ring-2 focus-visible:outline-none"
          >
            <option value="">Sélectionner…</option>
            {countries.map((c) => (
              <option key={c.key} value={c.label}>
                {c.label}
              </option>
            ))}
          </select>
        </div>
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
    <div className="flex flex-col gap-2.5">
      <p className="text-foreground text-sm font-semibold">{title}</p>
      <div className="grid grid-cols-3 gap-2.5">
        {options.map((o) => (
          <Choice
            key={o.value}
            variant="tile"
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
            variant="pill"
            label={i.label}
            selected={selected.has(i.id)}
            onSelect={() => toggle(i.id)}
          />
        ))}
      </div>
    </div>
  );
}

export function ReviewStep({ data }: StepProps) {
  const labelOf = <T extends string>(
    options: Option<T>[],
    value: T | null,
  ): string => options.find((o) => o.value === value)?.label ?? "—";

  const rows: [string, string][] = [
    ["Je suis", labelOf(GENDER_OPTIONS, data.gender)],
    ["Je recherche", labelOf(LOOKING_FOR_OPTIONS, data.lookingFor)],
    [
      "Localisation",
      [data.city, data.country].filter(Boolean).join(", ") || "—",
    ],
    ["Tabac", labelOf(SMOKING_OPTIONS, data.smoking)],
    ["Alcool", labelOf(DRINKING_OPTIONS, data.drinking)],
    ["Sport", labelOf(GYM_OPTIONS, data.gymHabit)],
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
