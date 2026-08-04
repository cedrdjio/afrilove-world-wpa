import { type ReactNode } from "react";

import { RequireCompletedOnboarding } from "@/components/guards/require-completed-onboarding";
import { AppPresence } from "@/features/location/app-presence";

/**
 * Garde du centre de notifications — session + profil complété. Écran plein
 * écran (hors du groupe `(app)`, sans barre de navigation), à l'image du mobile
 * qui pousse `/notifications` avec un bouton retour. `AppPresence` maintient le
 * heartbeat, la présence et l'abonnement Realtime aux notifications.
 */
export default function NotificationsLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <RequireCompletedOnboarding>
      <AppPresence />
      {children}
    </RequireCompletedOnboarding>
  );
}
