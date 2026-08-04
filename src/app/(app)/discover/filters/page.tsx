"use client";

import { useRouter } from "next/navigation";
import {
  X,
  Minus,
  Plus,
  Globe2,
  Flag,
  Earth,
  Check,
  type LucideIcon,
} from "lucide-react";

import { ScreenBackground } from "@/components/layout/screen-background";
import { Chip } from "@/components/ui/chip";
import { Switch } from "@/components/ui/switch";
import { Spinner } from "@/components/ui/spinner";
import { GradientButton } from "@/components/ui/gradient-button";
import { useFiltersStore } from "@/features/discovery/stores/filters-store";
import {
  useDiscoveryCount,
  useDiscoveryCountries,
} from "@/features/discovery/hooks/use-discovery";
import type { DiscoveryScope } from "@/features/discovery/types";

const SCOPE_OPTIONS: {
  key: DiscoveryScope;
  label: string;
  description: string;
  Icon: LucideIcon;
}[] = [
  {
    key: "international",
    label: "Diaspora",
    description:
      "Des profils vivant dans un autre pays que le vôtre — l'esprit AfriLove.",
    Icon: Globe2,
  },
  {
    key: "country",
    label: "Un pays précis",
    description: "Choisissez le pays où vous voulez rencontrer quelqu'un.",
    Icon: Flag,
  },
  {
    key: "all",
    label: "Partout",
    description: "Le monde entier, sans restriction de pays.",
    Icon: Earth,
  },
];

function Stepper({
  value,
  onDecrement,
  onIncrement,
}: {
  value: number;
  onDecrement: () => void;
  onIncrement: () => void;
}) {
  return (
    <div className="flex items-center gap-4">
      <button
        type="button"
        onClick={onDecrement}
        aria-label="Diminuer"
        className="border-border/60 bg-card/60 text-foreground grid size-10 place-items-center rounded-2xl border"
      >
        <Minus className="size-4" aria-hidden />
      </button>
      <span className="font-display text-foreground w-10 text-center text-[22px]">
        {value}
      </span>
      <button
        type="button"
        onClick={onIncrement}
        aria-label="Augmenter"
        className="border-border/60 bg-card/60 text-foreground grid size-10 place-items-center rounded-2xl border"
      >
        <Plus className="size-4" aria-hidden />
      </button>
    </div>
  );
}

export default function DiscoverFiltersPage() {
  const router = useRouter();
  const {
    scope,
    country,
    ageMin,
    ageMax,
    verifiedOnly,
    setScope,
    setCountry,
    setAgeRange,
    toggleVerifiedOnly,
  } = useFiltersStore();
  const countriesQuery = useDiscoveryCountries();
  const countQuery = useDiscoveryCount();

  const applyLabel =
    countQuery.data != null
      ? countQuery.data > 0
        ? `Voir ${countQuery.data} profil${countQuery.data > 1 ? "s" : ""}`
        : "Aucun profil — élargissez vos filtres"
      : "Appliquer les filtres";

  return (
    <div className="fixed inset-0 z-50 flex flex-col">
      <ScreenBackground theme="cream" />

      <div className="relative z-10 mx-auto flex min-h-dvh w-full max-w-md flex-1 flex-col overflow-y-auto px-6 pt-8 pb-8">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="font-display text-foreground text-[26px]">Filtres</h1>
          <button
            type="button"
            onClick={() => router.back()}
            aria-label="Fermer"
            className="border-border/60 bg-card/60 text-foreground grid size-10 place-items-center rounded-full border"
          >
            <X className="size-[17px]" aria-hidden />
          </button>
        </div>

        <p className="font-display text-foreground/40 mb-3 text-[11px]">
          Où chercher l&apos;amour ?
        </p>
        <div className="mb-4 flex flex-col gap-2.5">
          {SCOPE_OPTIONS.map(({ key, label, description, Icon }) => {
            const selected = scope === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => setScope(key)}
                aria-pressed={selected}
                className={`flex items-center gap-3.5 rounded-2xl border-[1.5px] px-4 py-3.5 text-left transition-colors ${
                  selected
                    ? "border-brand-500/45 bg-brand-500/[0.08]"
                    : "border-border/70 bg-card/45"
                }`}
              >
                <span
                  className={`grid size-10 shrink-0 place-items-center rounded-xl ${
                    selected ? "bg-brand-500/15" : "bg-foreground/[0.05]"
                  }`}
                >
                  <Icon
                    className={
                      selected
                        ? "text-brand-600 size-[18px]"
                        : "text-muted-foreground size-[18px]"
                    }
                    strokeWidth={2}
                    aria-hidden
                  />
                </span>
                <span className="flex-1">
                  <span
                    className={`font-display block text-[13px] font-semibold ${
                      selected ? "text-brand-600" : "text-foreground"
                    }`}
                  >
                    {label}
                  </span>
                  <span className="text-muted-foreground mt-0.5 block text-[11px] leading-[15px]">
                    {description}
                  </span>
                </span>
                <span
                  className={`grid size-[22px] shrink-0 place-items-center rounded-full border-[1.5px] ${
                    selected
                      ? "bg-brand-600 border-transparent text-white"
                      : "border-foreground/[0.18] text-transparent"
                  }`}
                  aria-hidden
                >
                  <Check className="size-3" strokeWidth={3} />
                </span>
              </button>
            );
          })}
        </div>

        {scope === "country" ? (
          <div className="border-border/70 bg-card/45 mb-4 rounded-2xl border-[1.5px] px-4 py-4">
            <p className="font-display text-foreground/40 mb-3 text-[11px]">
              Quel pays ?
            </p>
            {countriesQuery.isLoading ? (
              <Spinner className="size-5" />
            ) : (countriesQuery.data ?? []).length === 0 ? (
              <p className="text-muted-foreground text-[12px]">
                Aucun pays disponible pour le moment.
              </p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {(countriesQuery.data ?? []).map(
                  ({ country: name, memberCount }) => (
                    <Chip
                      key={name}
                      label={`${name} · ${memberCount}`}
                      selected={country === name}
                      onClick={() => setCountry(country === name ? null : name)}
                    />
                  ),
                )}
              </div>
            )}
          </div>
        ) : null}

        <p className="font-display text-foreground/40 mb-3 text-[11px]">
          Tranche d&apos;âge
        </p>
        <div className="border-border/70 bg-card/45 mb-7 flex items-center justify-between rounded-2xl border-[1.5px] px-5 py-4">
          <Stepper
            value={ageMin}
            onDecrement={() => setAgeRange(Math.max(18, ageMin - 1), ageMax)}
            onIncrement={() =>
              setAgeRange(Math.min(ageMax, ageMin + 1), ageMax)
            }
          />
          <span className="text-muted-foreground text-[12px] font-medium">
            à
          </span>
          <Stepper
            value={ageMax}
            onDecrement={() =>
              setAgeRange(ageMin, Math.max(ageMin, ageMax - 1))
            }
            onIncrement={() => setAgeRange(ageMin, Math.min(99, ageMax + 1))}
          />
        </div>

        <div className="border-border/70 bg-card/45 mb-8 flex items-center justify-between rounded-2xl border-[1.5px] px-5 py-4">
          <span className="text-foreground font-display text-[13px] font-semibold">
            Profils vérifiés uniquement
          </span>
          <Switch
            checked={verifiedOnly}
            onCheckedChange={() => toggleVerifiedOnly()}
            aria-label="Profils vérifiés uniquement"
          />
        </div>

        <GradientButton
          label={applyLabel}
          loading={countQuery.isLoading}
          onClick={() => router.back()}
        />
      </div>
    </div>
  );
}
