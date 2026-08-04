"use client";

import { useEffect } from "react";
import { ShieldCheck } from "lucide-react";

import { Input } from "@/components/ui/input";
import { useAuth } from "@/providers/auth-provider";
import { type OnboardingData } from "@/features/onboarding/types";

type Patch = (patch: Partial<OnboardingData>) => void;

/**
 * Étape identité — prénom ET nom réels (port de `NameScreen`). Le nom complet
 * sert à la vérification d'identité (KYC / badge vérifié) et doit correspondre
 * à la pièce d'identité ; seul le prénom est visible des autres membres. Les
 * champs sont préremplis depuis les métadonnées du compte (ex. connexion
 * Google) quand elles existent.
 */
export function NameStep({
  data,
  patch,
}: {
  data: OnboardingData;
  patch: Patch;
}) {
  const { user } = useAuth();

  useEffect(() => {
    const metadata = (user?.user_metadata ?? {}) as Record<string, unknown>;
    if (!data.firstName) {
      const prefill =
        (typeof metadata.first_name === "string" && metadata.first_name) ||
        (typeof metadata.given_name === "string" && metadata.given_name) ||
        (typeof metadata.name === "string" &&
          String(metadata.name).split(" ")[0]) ||
        "";
      if (prefill) patch({ firstName: prefill });
    }
    if (!data.lastName) {
      const prefill =
        (typeof metadata.last_name === "string" && metadata.last_name) ||
        (typeof metadata.family_name === "string" && metadata.family_name) ||
        "";
      if (prefill) patch({ lastName: prefill });
    }
    // Prérempli une seule fois à l'arrivée sur l'étape.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="firstName" className="text-sm font-semibold">
          Prénom
        </label>
        <Input
          id="firstName"
          autoComplete="given-name"
          placeholder="Ton prénom"
          value={data.firstName}
          onChange={(e) => patch({ firstName: e.target.value })}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="lastName" className="text-sm font-semibold">
          Nom
        </label>
        <Input
          id="lastName"
          autoComplete="family-name"
          placeholder="Ton nom de famille"
          value={data.lastName}
          onChange={(e) => patch({ lastName: e.target.value })}
        />
      </div>

      <p className="text-muted-foreground flex items-start gap-1.5 text-xs leading-snug">
        <ShieldCheck
          className="text-primary mt-0.5 size-3.5 shrink-0"
          strokeWidth={2.2}
          aria-hidden
        />
        <span>
          Utilise ton vrai nom : il devra correspondre à ta pièce d’identité
          pour obtenir le badge vérifié. Ton nom reste privé, seul ton prénom
          est visible.
        </span>
      </p>
    </div>
  );
}
