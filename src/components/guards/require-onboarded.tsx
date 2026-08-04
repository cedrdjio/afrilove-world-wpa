"use client";

import { useEffect, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";

import { ROUTES } from "@/constants/routes";
import { useAuth } from "@/providers/auth-provider";
import { FullScreenLoader } from "@/components/feedback/full-screen-loader";

/**
 * Garde des écrans d'édition de profil et de complétion — variante allégée de
 * `RequireCompletedOnboarding` : exige une session + un onboarding terminé,
 * mais PAS un profil complet. C'est indispensable : la complétion et les
 * éditeurs sont précisément les écrans qu'on visite quand `profile_completed`
 * est faux ; les garder derrière la garde complète piégerait l'utilisateur
 * dans une boucle de redirection.
 */
export function RequireOnboarded({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, profile, isLoading } = useAuth();

  const target = resolveTarget({ user, profile, isLoading, pathname });

  useEffect(() => {
    if (target) router.replace(target);
  }, [target, router]);

  if (isLoading || target) return <FullScreenLoader />;

  return <>{children}</>;
}

function resolveTarget({
  user,
  profile,
  isLoading,
  pathname,
}: {
  user: ReturnType<typeof useAuth>["user"];
  profile: ReturnType<typeof useAuth>["profile"];
  isLoading: boolean;
  pathname: string;
}): string | null {
  if (isLoading) return null;
  if (!user) return `${ROUTES.login}?next=${encodeURIComponent(pathname)}`;
  if (!profile) return ROUTES.systemServerError;
  if (profile.account_status !== "active") return ROUTES.systemAccountStatus;
  if (!profile.onboarding_completed) return ROUTES.onboarding;
  return null;
}
