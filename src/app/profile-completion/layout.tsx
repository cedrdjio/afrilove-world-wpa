import { type ReactNode } from "react";

import { RequireOnboarded } from "@/components/guards/require-onboarded";

/**
 * Garde de la complétion de profil — session + onboarding terminé (sans exiger
 * un profil complet : c'est l'écran cible quand `profile_completed` est faux).
 */
export default function ProfileCompletionLayout({
  children,
}: {
  children: ReactNode;
}) {
  return <RequireOnboarded>{children}</RequireOnboarded>;
}
