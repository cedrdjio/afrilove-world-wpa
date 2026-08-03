"use client";

import { useRouter } from "next/navigation";

import { PageHeader } from "@/components/layout/page-header";
import { Chip } from "@/components/ui/chip";
import { RangeSlider, Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/providers/auth-provider";
import { useHaptics } from "@/hooks/use-haptics";
import { useDiscoveryCount, useInterests } from "@/features/discovery/hooks";
import {
  DISTANCE_MAX_KM,
  useDiscoveryFilters,
} from "@/features/discovery/filters-store";

import { ALL_INTERESTS, useFiltersStore } from "../store";

interface InterestChip {
  key: string;
  label: string;
  active: boolean;
}

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

  const chips: InterestChip[] = (interests ?? []).map((i) => ({
    key: i.id,
    label: i.label,
    active: f.interestIds.includes(i.id),
  }));

  return (
    <FiltersView
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
