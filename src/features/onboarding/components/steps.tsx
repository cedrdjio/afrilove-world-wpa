"use client";

import { useState } from "react";
import {
  Briefcase,
  Loader2,
  MapPin,
  Minus,
  Navigation,
  Plus,
  Ruler,
} from "lucide-react";

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
import { interestIcon } from "@/lib/interest-icon";
import {
  type CatalogOption,
  type CountryOption,
  type InterestOption,
} from "@/features/onboarding/service";
import {
  HEIGHT_DEFAULT,
  HEIGHT_MAX,
  HEIGHT_MIN,
  MIN_INTERESTS,
  MIN_LANGUAGES,
  type OnboardingData,
} from "@/features/onboarding/types";
import { useGeolocation } from "@/features/onboarding/use-geolocation";
import { Choice } from "./choice";

type Patch = (patch: Partial<OnboardingData>) => void;
interface StepProps {
  data: OnboardingData;
  patch: Patch;
}

/* --------------------------------------------------------------------- *
 * Petits éléments réutilisables
 *
 * Chaque écran d'onboarding traite UN seul sujet : le titre de l'écran
 * (rendu par le wizard) fait office d'intitulé, donc les composants ci-dessous
 * ne répètent pas de gros libellé de section.
 * --------------------------------------------------------------------- */

function TextField({
  id,
  label,
  value,
  placeholder,
  icon: Icon,
  optional,
  maxLength,
  onChange,
}: {
  id: string;
  label: string;
  value: string;
  placeholder?: string;
  icon?: typeof Briefcase;
  optional?: boolean;
  maxLength?: number;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-semibold">
        {label}
        {optional ? (
          <span className="text-subtle-foreground font-normal">
            {" "}
            · optionnel
          </span>
        ) : null}
      </label>
      <div className="relative">
        {Icon ? (
          <Icon
            className="text-muted-foreground pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2"
            aria-hidden
          />
        ) : null}
        <Input
          id={id}
          value={value}
          placeholder={placeholder}
          maxLength={maxLength}
          onChange={(e) => onChange(e.target.value)}
          className={Icon ? "pl-10" : undefined}
        />
      </div>
    </div>
  );
}

/** Grille de choix uniques (cartes pleine largeur). */
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

/** Grille de tuiles (3 colonnes) pour un choix unique bref (mode de vie). */
function TileSelect<T extends string>({
  options,
  value,
  onPick,
}: {
  options: Option<T>[];
  value: T | null;
  onPick: (v: T) => void;
}) {
  return (
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
  );
}

/** Liste de cartes single-select basée sur un catalogue (éducation, religion). */
function CatalogCards({
  options,
  value,
  onPick,
}: {
  options: CatalogOption[];
  value: string | null;
  onPick: (id: string | null) => void;
}) {
  return (
    <div className="flex flex-col gap-2.5">
      {options.map((o) => (
        <Choice
          key={o.id}
          label={o.label}
          description={o.subtitle ?? undefined}
          selected={value === o.id}
          onSelect={() => onPick(value === o.id ? null : o.id)}
        />
      ))}
    </div>
  );
}

/* --------------------------------------------------------------------- *
 * Identité — un écran par question
 * --------------------------------------------------------------------- */

/** Écran « Comment vous appeler ? » — pseudo + nom privé (même sujet). */
export function NameStep({ data, patch }: StepProps) {
  return (
    <div className="flex flex-col gap-6">
      <TextField
        id="displayName"
        label="Pseudo"
        value={data.displayName}
        placeholder="Votre prénom ou pseudo"
        maxLength={40}
        onChange={(v) => patch({ displayName: v })}
      />
      <TextField
        id="privateName"
        label="Nom"
        optional
        value={data.privateName}
        placeholder="Privé — jamais affiché publiquement"
        maxLength={60}
        onChange={(v) => patch({ privateName: v })}
      />
    </div>
  );
}

const MONTHS = [
  "Janv.",
  "Févr.",
  "Mars",
  "Avr.",
  "Mai",
  "Juin",
  "Juil.",
  "Août",
  "Sept.",
  "Oct.",
  "Nov.",
  "Déc.",
];

function daysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

/** Écran « Date de naissance » — sélecteurs Jour / Mois / Année. */
export function BirthDateStep({ data, patch }: StepProps) {
  // Capture « maintenant » une seule fois (init paresseux) : pas d'appel impur
  // (Date.now / new Date sans argument) pendant le rendu.
  const [now] = useState(() => {
    const t = new Date();
    return { year: t.getFullYear(), ts: t.getTime() };
  });
  const maxYear = now.year - 18;
  const minYear = now.year - 100;

  // État LOCAL des trois parties. Indispensable : chaque sélection partielle
  // (jour seul, puis mois…) doit PERSISTER, alors que `birthDate` reste null
  // tant que la date n'est pas complète. Sans ça, le select se réinitialise
  // dès qu'on choisit une valeur — « ça ne passe pas ».
  const parsed = data.birthDate?.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  const [day, setDay] = useState<number | null>(
    parsed ? Number(parsed[3]) : null,
  );
  const [month, setMonth] = useState<number | null>(
    parsed ? Number(parsed[2]) : null,
  );
  const [year, setYear] = useState<number | null>(
    parsed ? Number(parsed[1]) : null,
  );

  // Recompose birthDate (ou null si incomplet) à chaque changement de partie.
  const sync = (d: number | null, m: number | null, y: number | null) => {
    if (!d || !m || !y) {
      patch({ birthDate: null });
      return;
    }
    const clampedDay = Math.min(d, daysInMonth(y, m));
    patch({
      birthDate: `${y}-${String(m).padStart(2, "0")}-${String(
        clampedDay,
      ).padStart(2, "0")}`,
    });
  };

  const changeDay = (v: number | null) => {
    setDay(v);
    sync(v, month, year);
  };
  const changeMonth = (v: number | null) => {
    // Réajuste le jour s'il dépasse le nouveau mois (ex. 31 → février).
    const maxD = v && year ? daysInMonth(year, v) : 31;
    const d = day && day > maxD ? maxD : day;
    setMonth(v);
    if (d !== day) setDay(d);
    sync(d, v, year);
  };
  const changeYear = (v: number | null) => {
    const maxD = month && v ? daysInMonth(v, month) : 31;
    const d = day && day > maxD ? maxD : day;
    setYear(v);
    if (d !== day) setDay(d);
    sync(d, month, v);
  };

  const years = Array.from(
    { length: maxYear - minYear + 1 },
    (_, i) => maxYear - i,
  );
  const days = Array.from(
    { length: daysInMonth(year ?? 2000, month ?? 1) },
    (_, i) => i + 1,
  );

  const age =
    day && month && year
      ? Math.floor(
          (now.ts - new Date(year, month - 1, day).getTime()) / 3.15576e10,
        )
      : null;

  const tile =
    "h-16 min-w-0 flex-1 rounded-[var(--radius-md)] border border-border bg-card text-center text-lg font-bold text-foreground focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:outline-none";

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-stretch gap-2.5">
        <select
          aria-label="Jour"
          className={tile}
          value={day ?? ""}
          onChange={(e) => changeDay(Number(e.target.value) || null)}
        >
          <option value="">Jour</option>
          {days.map((n) => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
        </select>
        <select
          aria-label="Mois"
          className={tile}
          value={month ?? ""}
          onChange={(e) => changeMonth(Number(e.target.value) || null)}
        >
          <option value="">Mois</option>
          {MONTHS.map((name, i) => (
            <option key={name} value={i + 1}>
              {name}
            </option>
          ))}
        </select>
        <select
          aria-label="Année"
          className={tile}
          value={year ?? ""}
          onChange={(e) => changeYear(Number(e.target.value) || null)}
        >
          <option value="">Année</option>
          {years.map((n) => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
        </select>
      </div>
      {age !== null ? (
        <p className="text-muted-foreground text-sm">
          Vous avez <span className="text-primary font-bold">{age} ans</span> ·
          seul votre âge sera visible.
        </p>
      ) : null}
    </div>
  );
}

/** Écran « Vous êtes… » — genre. */
export function GenderStep({ data, patch }: StepProps) {
  return (
    <SingleSelect
      options={GENDER_OPTIONS}
      value={data.gender}
      onPick={(gender) => patch({ gender })}
    />
  );
}

/** Écran « Vous recherchez… » — cible de la découverte. */
export function LookingForStep({ data, patch }: StepProps) {
  return (
    <SingleSelect
      options={LOOKING_FOR_OPTIONS}
      value={data.lookingFor}
      onPick={(lookingFor) => patch({ lookingFor })}
    />
  );
}

/* --------------------------------------------------------------------- *
 * Localisation
 * --------------------------------------------------------------------- */

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
          Permission refusée. Autorisez la localisation, ou renseignez votre
          pays manuellement ci-dessous.
        </p>
      ) : status === "unsupported" ? (
        <p className="text-muted-foreground text-xs leading-snug">
          Géolocalisation indisponible — saisie manuelle ci-dessous.
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
      <TextField
        id="city"
        label="Ville"
        value={data.city ?? ""}
        placeholder="Votre ville"
        onChange={(v) => patch({ city: v || "" })}
      />
    </div>
  );
}

/* --------------------------------------------------------------------- *
 * Détails — un écran par sujet (tous optionnels)
 * --------------------------------------------------------------------- */

function StepBtn({
  children,
  label,
  onClick,
}: {
  children: React.ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="bg-muted text-foreground grid size-12 place-items-center rounded-full active:scale-95"
    >
      {children}
    </button>
  );
}

/** Écran « Votre taille ». */
export function HeightStep({ data, patch }: StepProps) {
  const value = data.heightCm;
  const set = (n: number) =>
    patch({ heightCm: Math.max(HEIGHT_MIN, Math.min(HEIGHT_MAX, n)) });

  return (
    <div className="flex flex-col gap-3">
      {value == null ? (
        <button
          type="button"
          onClick={() => patch({ heightCm: HEIGHT_DEFAULT })}
          className="border-border bg-card text-foreground flex h-12 items-center justify-center gap-2 rounded-[var(--radius-md)] border text-sm font-semibold active:scale-[0.99]"
        >
          <Ruler className="size-4" aria-hidden />
          Indiquer ma taille
        </button>
      ) : (
        <>
          <div className="border-border bg-card flex items-center justify-between rounded-[var(--radius-lg)] border px-3 py-3">
            <StepBtn label="Diminuer" onClick={() => set(value - 1)}>
              <Minus className="size-5" aria-hidden />
            </StepBtn>
            <div className="text-center">
              <span className="font-display text-3xl font-extrabold">
                {value}
              </span>
              <span className="text-muted-foreground ml-1 text-sm">cm</span>
            </div>
            <StepBtn label="Augmenter" onClick={() => set(value + 1)}>
              <Plus className="size-5" aria-hidden />
            </StepBtn>
          </div>
          <button
            type="button"
            onClick={() => patch({ heightCm: null })}
            className="text-subtle-foreground self-start text-xs font-semibold"
          >
            Ne pas préciser
          </button>
        </>
      )}
    </div>
  );
}

/** Écran « Votre profession ». */
export function ProfessionStep({ data, patch }: StepProps) {
  return (
    <TextField
      id="profession"
      label="Profession"
      optional
      icon={Briefcase}
      value={data.profession}
      placeholder="Votre métier"
      maxLength={60}
      onChange={(v) => patch({ profession: v })}
    />
  );
}

/** Écran « Votre niveau d'études ». */
export function EducationStep({
  data,
  patch,
  educationLevels,
}: StepProps & { educationLevels: CatalogOption[] }) {
  return (
    <CatalogCards
      options={educationLevels}
      value={data.educationLevelId}
      onPick={(educationLevelId) => patch({ educationLevelId })}
    />
  );
}

/** Écran « Votre religion ». */
export function ReligionStep({
  data,
  patch,
  religions,
}: StepProps & { religions: CatalogOption[] }) {
  return (
    <CatalogCards
      options={religions}
      value={data.religionId}
      onPick={(religionId) => patch({ religionId })}
    />
  );
}

/* --------------------------------------------------------------------- *
 * Objectif & mode de vie — un écran par sujet
 * --------------------------------------------------------------------- */

/** Écran « Que recherchez-vous ? » — objectif relationnel. */
export function GoalStep({
  data,
  patch,
  relationshipGoals,
}: StepProps & { relationshipGoals: CatalogOption[] }) {
  return (
    <div className="flex flex-wrap gap-2">
      {relationshipGoals.map((g) => (
        <Choice
          key={g.id}
          variant="pill"
          label={g.label}
          selected={data.relationshipGoalId === g.id}
          onSelect={() => patch({ relationshipGoalId: g.id })}
        />
      ))}
    </div>
  );
}

export function SmokingStep({ data, patch }: StepProps) {
  return (
    <TileSelect
      options={SMOKING_OPTIONS}
      value={data.smoking}
      onPick={(smoking) => patch({ smoking })}
    />
  );
}

export function DrinkingStep({ data, patch }: StepProps) {
  return (
    <TileSelect
      options={DRINKING_OPTIONS}
      value={data.drinking}
      onPick={(drinking) => patch({ drinking })}
    />
  );
}

export function GymStep({ data, patch }: StepProps) {
  return (
    <TileSelect
      options={GYM_OPTIONS}
      value={data.gymHabit}
      onPick={(gymHabit) => patch({ gymHabit })}
    />
  );
}

export function PetsStep({ data, patch }: StepProps) {
  return (
    <TileSelect
      options={PETS_OPTIONS}
      value={data.hasPets}
      onPick={(hasPets) => patch({ hasPets })}
    />
  );
}

export function ChildrenStep({ data, patch }: StepProps) {
  return (
    <TileSelect
      options={CHILDREN_OPTIONS}
      value={data.wantsChildren}
      onPick={(wantsChildren) => patch({ wantsChildren })}
    />
  );
}

/**
 * Étape « Mode de vie » groupée (parité jalon) : les cinq questions de style
 * de vie (tabac, alcool, sport, animaux, enfants) sur un seul écran.
 */
export function LifestyleStep({ data, patch }: StepProps) {
  return (
    <div className="space-y-6">
      <LifestyleGroup
        label="Tabac"
        options={SMOKING_OPTIONS}
        value={data.smoking}
        onPick={(smoking) => patch({ smoking })}
      />
      <LifestyleGroup
        label="Alcool"
        options={DRINKING_OPTIONS}
        value={data.drinking}
        onPick={(drinking) => patch({ drinking })}
      />
      <LifestyleGroup
        label="Sport"
        options={GYM_OPTIONS}
        value={data.gymHabit}
        onPick={(gymHabit) => patch({ gymHabit })}
      />
      <LifestyleGroup
        label="Animaux"
        options={PETS_OPTIONS}
        value={data.hasPets}
        onPick={(hasPets) => patch({ hasPets })}
      />
      <LifestyleGroup
        label="Enfants"
        options={CHILDREN_OPTIONS}
        value={data.wantsChildren}
        onPick={(wantsChildren) => patch({ wantsChildren })}
      />
    </div>
  );
}

function LifestyleGroup<T extends string>({
  label,
  options,
  value,
  onPick,
}: {
  label: string;
  options: Option<T>[];
  value: T | null;
  onPick: (v: T) => void;
}) {
  return (
    <div>
      <h3 className="text-muted-foreground mb-2.5 text-sm font-bold">
        {label}
      </h3>
      <TileSelect options={options} value={value} onPick={onPick} />
    </div>
  );
}

/* --------------------------------------------------------------------- *
 * Langues
 * --------------------------------------------------------------------- */

export function LanguagesStep({
  data,
  patch,
  languages,
}: StepProps & { languages: CatalogOption[] }) {
  const selected = new Set(data.languageIds);
  const toggle = (id: string) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    patch({ languageIds: [...next] });
  };
  return (
    <div className="flex flex-col gap-4">
      <p className="text-muted-foreground text-sm">
        Sélectionnez-en au moins {MIN_LANGUAGES} —{" "}
        <span className="text-primary font-semibold">
          {selected.size} sélectionnée{selected.size > 1 ? "s" : ""}
        </span>
      </p>
      <div className="flex flex-wrap gap-2">
        {languages.map((l) => (
          <Choice
            key={l.id}
            variant="pill"
            label={l.label}
            selected={selected.has(l.id)}
            onSelect={() => toggle(l.id)}
          />
        ))}
      </div>
    </div>
  );
}

/* --------------------------------------------------------------------- *
 * Bio
 * --------------------------------------------------------------------- */

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

/* --------------------------------------------------------------------- *
 * Centres d'intérêt (icônes vectorielles)
 * --------------------------------------------------------------------- */

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
            icon={interestIcon(i.icon)}
            selected={selected.has(i.id)}
            onSelect={() => toggle(i.id)}
          />
        ))}
      </div>
    </div>
  );
}

/* --------------------------------------------------------------------- *
 * Récapitulatif
 * --------------------------------------------------------------------- */

export function ReviewStep({
  data,
  religions,
  educationLevels,
  relationshipGoals,
  languages,
}: StepProps & {
  religions: CatalogOption[];
  educationLevels: CatalogOption[];
  relationshipGoals: CatalogOption[];
  languages: CatalogOption[];
}) {
  const labelOf = <T extends string>(
    options: Option<T>[],
    value: T | null,
  ): string => options.find((o) => o.value === value)?.label ?? "—";
  const catalogLabel = (options: CatalogOption[], id: string | null): string =>
    options.find((o) => o.id === id)?.label ?? "—";
  const languageLabels =
    data.languageIds
      .map((id) => languages.find((l) => l.id === id)?.label)
      .filter(Boolean)
      .join(", ") || "—";

  const rows: [string, string][] = [
    ["Pseudo", data.displayName.trim() || "—"],
    ["Je suis", labelOf(GENDER_OPTIONS, data.gender)],
    ["Je recherche", labelOf(LOOKING_FOR_OPTIONS, data.lookingFor)],
    [
      "Localisation",
      [data.city, data.country].filter(Boolean).join(", ") || "—",
    ],
    ["Taille", data.heightCm ? `${data.heightCm} cm` : "—"],
    ["Profession", data.profession.trim() || "—"],
    ["Éducation", catalogLabel(educationLevels, data.educationLevelId)],
    ["Religion", catalogLabel(religions, data.religionId)],
    ["Objectif", catalogLabel(relationshipGoals, data.relationshipGoalId)],
    ["Langues", languageLabels],
    ["Centres d’intérêt", `${data.interestIds.length} sélectionnés`],
  ];
  return (
    <div className="flex flex-col gap-3">
      <div className="border-border bg-card divide-border divide-y rounded-[var(--radius-lg)] border">
        {rows.map(([k, v]) => (
          <div
            key={k}
            className="flex items-center justify-between gap-4 px-4 py-3"
          >
            <span className="text-muted-foreground shrink-0 text-sm">{k}</span>
            <span className="text-foreground truncate text-right text-sm font-semibold">
              {v}
            </span>
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
