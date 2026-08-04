import { type ReactNode } from "react";

import { RequireAuthForOnboarding } from "@/components/guards/require-auth-for-onboarding";

/**
 * Layout-garde du parcours d'onboarding — équivalent du groupe `(onboarding)`
 * mobile : il faut être connecté, et si l'onboarding est déjà terminé on
 * renvoie vers l'app. Le proxy assure déjà la protection anonyme côté serveur ;
 * cette garde couvre l'état « déjà onboardé » que seul le client connaît.
 */
export default function OnboardingLayout({
  children,
}: {
  children: ReactNode;
}) {
  return <RequireAuthForOnboarding>{children}</RequireAuthForOnboarding>;
}
