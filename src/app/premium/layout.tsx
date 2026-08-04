import { type ReactNode } from "react";

import { RequireCompletedOnboarding } from "@/components/guards/require-completed-onboarding";
import { AppPresence } from "@/features/location/app-presence";

/**
 * Garde de l'espace Premium — session + profil complété. Écrans plein écran
 * (hors du groupe `(app)`, sans barre de navigation), thème nuit, à l'image de
 * la pile modale premium du mobile. `AppPresence` maintient heartbeat, présence,
 * Realtime notifications et enregistrement push pendant le tunnel de paiement.
 */
export default function PremiumLayout({ children }: { children: ReactNode }) {
  return (
    <RequireCompletedOnboarding>
      <AppPresence />
      {children}
    </RequireCompletedOnboarding>
  );
}
