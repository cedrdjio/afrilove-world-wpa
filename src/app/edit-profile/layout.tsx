import { type ReactNode } from "react";

import { RequireOnboarded } from "@/components/guards/require-onboarded";

/**
 * Garde de la zone d'édition de profil — session + onboarding terminé, sans
 * exiger un profil complet (on vient justement le compléter ici).
 */
export default function EditProfileLayout({
  children,
}: {
  children: ReactNode;
}) {
  return <RequireOnboarded>{children}</RequireOnboarded>;
}
