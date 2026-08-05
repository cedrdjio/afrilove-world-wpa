"use client";

import { useRouter } from "next/navigation";
import { Check, Earth, Flag, Globe2 } from "lucide-react";

import { PageHeader } from "@/components/layout/page-header";
import { Chip } from "@/components/ui/chip";
import { RangeSlider, Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/providers/auth-provider";
import { useHaptics } from "@/hooks/use-haptics";
import {
  useDiscoveryCount,
  useDiscoveryCountries,
  useInterests,
} from "@/features/discovery/hooks";
import {
  DISTANCE_MAX_KM,
  useDiscoveryFilters,
} from "@/features/discovery/filters-store";
import type { DiscoveryScope } from "@/features/discovery/types";
import { cn } from "@/lib/utils";

import { ALL_INTERESTS, useFiltersStore } from "../store";

interface InterestChip {
  key: string;
  label: string;
  active: boolean;
}

interface CountryOption {
  country: string;
  memberCount: number;
}

/** Périmètre de recherche — parité jalon (« Où chercher l'amour ? »). */
const SCOPE_OPTIONS: {
  key: DiscoveryScope;
  label: string;
  description: string;
  Icon: typeof Globe2;
}[] = [
  {
    key: "international",
    label: "Diaspora",
    description:
      "Des profils vivant dans un autre pays que le tien — l'esprit AfriLove.",
    Icon: Globe2,
  },
  {
    key: "country",
    label: "Un pays précis",
    description: "Choisis le pays où tu veux rencontrer quelqu'un.",
    Icon: Flag,
  },
  {
    key: "all",
    label: "Partout",
    description: "Le monde entier, sans restriction de pays.",
    Icon: Earth,
  },
];

/**
 * Recherche avancée / filtres (« 11 »). Pour un membre connecté, pilote les
 * vrais filtres de la Découverte (`useDiscoveryFilters`) avec un compteur live
 * (`count_search_profiles`) ; sinon un aperçu local (store d'affichage).
 */
export function FiltersScreen() {
  const { isAuthenticated } = useAuth();
  if (isAuthenticated) return <RealFilters />;
  return <DemoFilters />;
}

function RealFilters() {
  const f = useDiscoveryFilters();
  const { data: interests } = useInterests();
  const { data: count, isFetching } = useDiscoveryCount();
  const { data: countries } = useDiscoveryCountries();

  const chips: InterestChip[] = (interests ?? []).map((i) => ({
    key: i.id,
    label: i.label,
    active: f.interestIds.includes(i.id),
  }));

  return (
    <FiltersView
      scope={f.scope}
      onScope={f.setScope}
      country={f.country}
      onCountry={f.setCountry}
      countries={countries ?? []}
      distanceKm={f.maxDistanceKm}
      onDistance={f.setMaxDistance}
      ageMin={f.ageMin}
      ageMax={f.ageMax}
      onAge={f.setAgeRange}
      interests={chips}
      onToggleInterest={f.toggleInterest}
      verifiedOnly={f.verifiedOnly}
      onVerifiedOnly={() => f.toggleVerifiedOnly()}
      onReset={f.reset}
      ctaLabel={
        isFetching
          ? "Calcul…"
          : count == null
            ? "Voir les profils"
            : `Voir ${count} profil${count > 1 ? "s" : ""}`
      }
    />
  );
}

function DemoFilters() {
  const f = useFiltersStore();
  const chips: InterestChip[] = ALL_INTERESTS.map((label) => ({
    key: label,
    label,
    active: f.interests.includes(label),
  }));

  return (
    <FiltersView
      distanceKm={f.distanceKm}
      onDistance={f.setDistance}
      ageMin={f.ageMin}
      ageMax={f.ageMax}
      onAge={f.setAge}
      interests={chips}
      onToggleInterest={f.toggleInterest}
      verifiedOnly={f.verifiedOnly}
      onVerifiedOnly={f.setVerifiedOnly}
      onReset={f.reset}
      ctaLabel="Voir 128 profils"
    />
  );
}

function FiltersView({
  scope,
  onScope,
  country,
  onCountry,
  countries = [],
  distanceKm,
  onDistance,
  ageMin,
  ageMax,
  onAge,
  interests,
  onToggleInterest,
  verifiedOnly,
  onVerifiedOnly,
  onReset,
  ctaLabel,
}: {
  scope?: DiscoveryScope;
  onScope?: (scope: DiscoveryScope) => void;
  country?: string | null;
  onCountry?: (country: string | null) => void;
  countries?: CountryOption[];
  distanceKm: number;
  onDistance: (km: number) => void;
  ageMin: number;
  ageMax: number;
  onAge: (min: number, max: number) => void;
  interests: InterestChip[];
  onToggleInterest: (key: string) => void;
  verifiedOnly: boolean;
  onVerifiedOnly: (value: boolean) => void;
  onReset: () => void;
  ctaLabel: string;
}) {
  const router = useRouter();
  const haptic = useHaptics();

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col px-5 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
      <PageHeader
        title="Filtres"
        back
        center
        trailing={
          <button
            type="button"
            onClick={onReset}
            className="text-primary shrink-0 text-sm font-bold"
          >
            Réinitialiser
          </button>
        }
      />

      <div className="mt-6 flex flex-1 flex-col gap-4">
        {/* Périmètre de recherche — parité jalon (« Où chercher l'amour ? »). */}
        {scope && onScope && (
          <section className="glass rounded-[var(--radius-lg)] p-4">
            <h2 className="font-display font-bold">
              Où chercher l&apos;amour ?
            </h2>
            <div className="mt-3 flex flex-col gap-2.5">
              {SCOPE_OPTIONS.map(({ key, label, description, Icon }) => {
                const selected = scope === key;
                return (
                  <button
                    key={key}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => {
                      haptic("light");
                      onScope(key);
                    }}
                    className={cn(
                      "flex items-center gap-3.5 rounded-[var(--radius-md)] border px-3.5 py-3 text-left transition-colors",
                      selected
                        ? "border-primary/45 bg-primary/8"
                        : "border-border bg-card/40",
                    )}
                  >
                    <span
                      className={cn(
                        "grid size-10 shrink-0 place-items-center rounded-[var(--radius-sm)]",
                        selected ? "bg-primary/15" : "bg-muted",
                      )}
                    >
                      <Icon
                        className={cn(
                          "size-[18px]",
                          selected ? "text-primary" : "text-muted-foreground",
                        )}
                        aria-hidden
                      />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span
                        className={cn(
                          "font-display block text-sm font-bold",
                          selected ? "text-primary" : "text-foreground",
                        )}
                      >
                        {label}
                      </span>
                      <span className="text-muted-foreground block text-xs leading-snug">
                        {description}
                      </span>
                    </span>
                    <span
                      className={cn(
                        "grid size-[22px] shrink-0 place-items-center rounded-full border",
                        selected
                          ? "border-primary bg-primary"
                          : "border-border",
                      )}
                    >
                      {selected && (
                        <Check
                          className="size-3.5 text-white"
                          strokeWidth={3}
                          aria-hidden
                        />
                      )}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Choix du pays quand « Un pays précis » est sélectionné. */}
            {scope === "country" && onCountry && (
              <div className="border-border/60 mt-3 border-t pt-3">
                <p className="text-muted-foreground mb-2.5 text-xs font-semibold">
                  Quel pays ?
                </p>
                {countries.length === 0 ? (
                  <p className="text-subtle-foreground text-sm">
                    Aucun pays disponible pour le moment.
                  </p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {countries.map(({ country: name, memberCount }) => (
                      <button
                        key={name}
                        type="button"
                        aria-pressed={country === name}
                        onClick={() => {
                          haptic("light");
                          onCountry(country === name ? null : name);
                        }}
                      >
                        <Chip tone={country === name ? "solid" : "soft"}>
                          {name} · {memberCount}
                        </Chip>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </section>
        )}

        <section className="glass rounded-[var(--radius-lg)] p-4">
          <div className="flex items-baseline justify-between">
            <span className="font-display font-bold">Distance</span>
            <span className="text-primary text-sm font-bold">
              {distanceKm >= DISTANCE_MAX_KM ? "Illimitée" : `${distanceKm} km`}
            </span>
          </div>
          <div className="mt-3">
            <Slider
              ariaLabel="Distance maximale en kilomètres"
              min={1}
              max={DISTANCE_MAX_KM}
              value={distanceKm}
              onChange={onDistance}
            />
          </div>
        </section>

        <section className="glass rounded-[var(--radius-lg)] p-4">
          <div className="flex items-baseline justify-between">
            <span className="font-display font-bold">Tranche d&apos;âge</span>
            <span className="text-primary text-sm font-bold">
              {ageMin} – {ageMax}
            </span>
          </div>
          <div className="mt-3">
            <RangeSlider
              ariaLabelMin="Âge minimum"
              ariaLabelMax="Âge maximum"
              min={18}
              max={70}
              valueMin={ageMin}
              valueMax={ageMax}
              onChange={onAge}
            />
          </div>
        </section>

        {interests.length > 0 && (
          <section className="glass rounded-[var(--radius-lg)] p-4">
            <h2 className="font-display font-bold">Centres d&apos;intérêt</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {interests.map((interest) => (
                <button
                  key={interest.key}
                  type="button"
                  aria-pressed={interest.active}
                  onClick={() => {
                    haptic("light");
                    onToggleInterest(interest.key);
                  }}
                >
                  <Chip tone={interest.active ? "solid" : "soft"}>
                    {interest.label}
                  </Chip>
                </button>
              ))}
            </div>
          </section>
        )}

        <section className="glass flex items-center justify-between rounded-[var(--radius-lg)] p-4">
          <div>
            <div className="font-display font-bold">Profils vérifiés</div>
            <div className="text-subtle-foreground text-xs">
              Uniquement les comptes certifiés
            </div>
          </div>
          <Switch
            checked={verifiedOnly}
            onCheckedChange={onVerifiedOnly}
            aria-label="N'afficher que les profils vérifiés"
          />
        </section>
      </div>

      <button
        type="button"
        onClick={() => {
          haptic("medium");
          router.back();
        }}
        className="gradient-signature shadow-brand font-display mt-5 flex h-14 items-center justify-center rounded-[var(--radius-pill)] text-[1.05rem] font-bold text-white active:scale-[0.98]"
      >
        {ctaLabel}
      </button>
    </div>
  );
}
