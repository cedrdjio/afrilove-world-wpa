import { type ReactNode } from "react";

import { BottomNav } from "@/components/layout/bottom-nav";
import { RequireCompletedOnboarding } from "@/components/guards/require-completed-onboarding";

/**
 * Shell applicatif authentifié — équivalent du groupe `(tabs)` mobile.
 * Toute page sous ce segment est gardée par `RequireCompletedOnboarding`
 * (session + onboarding + profil + statut de compte) et rendue au-dessus de
 * la barre de navigation flottante. L'espace bas (`pb-28`) réserve la place
 * de la barre pour que le contenu ne passe jamais dessous.
 *
 * Les groupes de routes `(app)` n'affectent pas les URL : `/discover`,
 * `/matches`, `/messages`, `/profile` restent inchangées.
 */
export default function AppShellLayout({ children }: { children: ReactNode }) {
  return (
    <RequireCompletedOnboarding>
      <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col pb-28">
        {children}
      </div>
      <BottomNav />
    </RequireCompletedOnboarding>
  );
}
