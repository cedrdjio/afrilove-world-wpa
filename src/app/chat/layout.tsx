import { type ReactNode } from "react";

import { RequireCompletedOnboarding } from "@/components/guards/require-completed-onboarding";
import { AppPresence } from "@/features/location/app-presence";

/**
 * Garde du chat — session + profil complété. Le chat est plein écran (hors du
 * groupe `(app)`, sans barre de navigation). `AppPresence` reste monté ici pour
 * conserver le heartbeat et la présence temps réel pendant la conversation.
 */
export default function ChatLayout({ children }: { children: ReactNode }) {
  return (
    <RequireCompletedOnboarding>
      <AppPresence />
      {children}
    </RequireCompletedOnboarding>
  );
}
