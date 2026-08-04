import { type ReactNode } from "react";

import { RequireCompletedOnboarding } from "@/components/guards/require-completed-onboarding";

/**
 * Garde de la recherche avancée — session + profil complété (miroir de la
 * navigation mobile : le constructeur de filtres n'est atteignable que depuis
 * les onglets principaux, réservés aux membres au profil complet).
 */
export default function SearchLayout({ children }: { children: ReactNode }) {
  return <RequireCompletedOnboarding>{children}</RequireCompletedOnboarding>;
}
