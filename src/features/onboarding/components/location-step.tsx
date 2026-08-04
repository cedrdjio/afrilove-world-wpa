"use client";

import { useState } from "react";
import { MapPin } from "lucide-react";

import { Input } from "@/components/ui/input";
import { type CountryOption } from "@/features/onboarding/service";
import { type OnboardingData } from "@/features/onboarding/types";
import { PermissionStep } from "./permission-step";

type Patch = (patch: Partial<OnboardingData>) => void;

/**
 * Permission de localisation — port de `LocationPermissionScreen`. « Activer »
 * capture les coordonnées via la géolocalisation du navigateur (elles
 * alimentent l'ordonnancement par proximité de la découverte), puis avance ;
 * un refus ou une erreur ne bloque jamais le parcours. La saisie manuelle du
 * pays/ville (facultative) reste disponible — plus fiable sur ordinateur et
 * source du lieu affiché sur le profil.
 */
export function LocationStep({
  data,
  patch,
  countries,
  onDone,
}: {
  data: OnboardingData;
  patch: Patch;
  countries: CountryOption[];
  onDone: () => void;
}) {
  const [locating, setLocating] = useState(false);

  function handleEnable() {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      onDone();
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        patch({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
        setLocating(false);
        onDone();
      },
      () => {
        // Permission refusée ou indisponible : on n'interrompt pas l'onboarding.
        setLocating(false);
        onDone();
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 60000 },
    );
  }

  return (
    <PermissionStep
      Icon={MapPin}
      title={<>Activez votre localisation</>}
      description="Trouvez des membres de la communauté près de chez vous et affinez vos rencontres par distance."
      primaryLabel="Activer la localisation"
      loading={locating}
      onPrimary={handleEnable}
      onSkip={onDone}
    >
      <div className="flex flex-col gap-3 text-left">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="country" className="text-sm font-semibold">
            Pays{" "}
            <span className="text-muted-foreground font-normal">
              (facultatif)
            </span>
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
            Ville{" "}
            <span className="text-muted-foreground font-normal">
              (facultatif)
            </span>
          </label>
          <Input
            id="city"
            value={data.city ?? ""}
            placeholder="Votre ville"
            onChange={(e) => patch({ city: e.target.value || null })}
          />
        </div>
      </div>
    </PermissionStep>
  );
}
