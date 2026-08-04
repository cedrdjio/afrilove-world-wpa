"use client";

import { useEffect, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";

import { ROUTES } from "@/constants/routes";
import { useAuth } from "@/providers/auth-provider";
import { FullScreenLoader } from "@/components/feedback/full-screen-loader";

/**
 * Garde chaque écran de la « vraie app » (shell `(app)`) — port de
 * `RequireCompletedOnboarding` (mobile). Protège contre un accès direct
 * (deep link, URL restaurée, état de nav périmé) sans être passé par la
 * chaîne de résolution de session. La redirection anonyme est déjà faite
 * côté serveur (proxy), mais on la double ici pour couvrir les transitions
 * client, puis on applique l'ordre de résolution du mobile :
 *   idle → loader · non connecté → login · compte non actif → écran statut
 *   · onboarding incomplet → onboarding · profil incomplet → profile-completion
 */
export function RequireCompletedOnboarding({
  children,
}: {
  children: ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, profile, isLoading } = useAuth();

  const target = resolveGuardTarget({ user, profile, isLoading, pathname });

  useEffect(() => {
    if (target) router.replace(target);
  }, [target, router]);

  if (isLoading || target) return <FullScreenLoader />;

  return <>{children}</>;
}

function resolveGuardTarget({
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
  // Un utilisateur connecté possède toujours sa ligne `profiles` (créée par
  // trigger) : son absence signale une erreur serveur, pas un état normal.
  if (!profile) return ROUTES.systemServerError;
  if (profile.account_status !== "active") return ROUTES.systemAccountStatus;
  if (!profile.onboarding_completed) return ROUTES.onboarding;
  if (!profile.profile_completed) return ROUTES.profileCompletion;
  return null;
}
