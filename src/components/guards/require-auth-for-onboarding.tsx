"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";

import { ROUTES } from "@/constants/routes";
import { useAuth } from "@/providers/auth-provider";
import { FullScreenLoader } from "@/components/feedback/full-screen-loader";

/**
 * Garde le parcours d'onboarding — port de `RequireAuthForOnboarding`
 * (mobile) : il faut être connecté, et si l'onboarding est déjà terminé il
 * n'y a plus rien à faire ici → on renvoie vers l'app (ou vers la finalisation
 * de profil selon l'état). Un compte non actif est renvoyé vers l'écran de
 * statut.
 */
export function RequireAuthForOnboarding({
  children,
}: {
  children: ReactNode;
}) {
  const router = useRouter();
  const { user, profile, isLoading } = useAuth();

  let target: string | null = null;
  if (!isLoading) {
    if (!user) target = ROUTES.login;
    else if (profile && profile.account_status !== "active")
      target = ROUTES.systemAccountStatus;
    else if (profile?.onboarding_completed)
      target = profile.profile_completed
        ? ROUTES.discover
        : ROUTES.profileCompletion;
  }

  useEffect(() => {
    if (target) router.replace(target);
  }, [target, router]);

  if (isLoading || target) return <FullScreenLoader />;

  return <>{children}</>;
}
