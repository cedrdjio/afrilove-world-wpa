"use client";

import { useRouter } from "next/navigation";

import { PageHeader } from "@/components/layout/page-header";
import { Chip } from "@/components/ui/chip";
import { RangeSlider, Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { useHaptics } from "@/hooks/use-haptics";

import { ALL_INTERESTS, useFiltersStore } from "../store";

/**
 * Recherche avancée / filtres (« 11 »). Distance, tranche d'âge, centres
 * d'intérêt et profils vérifiés — tous branchés sur le `useFiltersStore`.
 */
export function FiltersScreen() {
  const router = useRouter();
  const haptic = useHaptics();
  const f = useFiltersStore();

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col px-5 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
      <PageHeader
        title="Filtres"
        back
        center
        trailing={
          <button
            type="button"
            onClick={() => f.reset()}
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
              {f.distanceKm} km
            </span>
          </div>
          <div className="mt-3">
            <Slider
              ariaLabel="Distance maximale en kilomètres"
              min={1}
              max={150}
              value={f.distanceKm}
              onChange={f.setDistance}
            />
          </div>
        </section>

        <section className="glass rounded-[var(--radius-lg)] p-4">
          <div className="flex items-baseline justify-between">
            <span className="font-display font-bold">Tranche d&apos;âge</span>
            <span className="text-primary text-sm font-bold">
              {f.ageMin} – {f.ageMax}
            </span>
          </div>
          <div className="mt-3">
            <RangeSlider
              ariaLabelMin="Âge minimum"
              ariaLabelMax="Âge maximum"
              min={18}
              max={70}
              valueMin={f.ageMin}
              valueMax={f.ageMax}
              onChange={f.setAge}
            />
          </div>
        </section>

        <section className="glass rounded-[var(--radius-lg)] p-4">
          <h2 className="font-display font-bold">Centres d&apos;intérêt</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {ALL_INTERESTS.map((interest) => {
              const active = f.interests.includes(interest);
              return (
                <button
                  key={interest}
                  type="button"
                  aria-pressed={active}
                  onClick={() => {
                    haptic("light");
                    f.toggleInterest(interest);
                  }}
                >
                  <Chip tone={active ? "solid" : "soft"}>{interest}</Chip>
                </button>
              );
            })}
          </div>
        </section>

        <section className="glass flex items-center justify-between rounded-[var(--radius-lg)] p-4">
          <div>
            <div className="font-display font-bold">Profils vérifiés</div>
            <div className="text-subtle-foreground text-xs">
              Uniquement les comptes certifiés
            </div>
          </div>
          <Switch
            checked={f.verifiedOnly}
            onCheckedChange={f.setVerifiedOnly}
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
        Voir 128 profils
      </button>
    </div>
  );
}
