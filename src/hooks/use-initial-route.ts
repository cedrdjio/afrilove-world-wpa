"use client";

import { ROUTES } from "@/constants/routes";
import { useAuth } from "@/providers/auth-provider";
import { useAuthFlowStore } from "@/features/auth/store";

/**
 * Source unique de « où l'app doit atterrir maintenant » — port de
 * `useInitialRoute` (mobile). Consulté par l'écran `/auth/resolving` après
 * toute action changeant la destination (connexion, vérification e-mail,
 * réinitialisation). Renvoie `null` tant que la résolution est en cours
 * (session en cours de contrôle, profil en cours de chargement) : l'appelant
 * garde un loader affiché jusqu'à ce qu'une route revienne.
 */
export function useInitialRoute(): string | null {
  const { user, profile, isLoading } = useAuth();
  const pendingRecovery = useAuthFlowStore((s) => s.pendingRecovery);

  if (isLoading) return null;
  if (!user) return ROUTES.login;

  // Un lien/OTP de récupération ouvre une session AVANT le choix du nouveau
  // mot de passe : tant que le flag n'est pas levé, toute résolution atterrit
  // sur l'écran de réinitialisation (sinon on entrerait dans l'app sans jamais
  // changer le mot de passe).
  if (pendingRecovery) return ROUTES.resetPassword;

  // Authentifié mais profil pas encore chargé : on attend (la garde du shell
  // couvre le cas pathologique d'un profil réellement absent).
  if (!profile) return null;

  // Comptes suspendus / auto-désactivés : le voyant de statut est la seule
  // destination jusqu'à levée de la sanction / réactivation.
  if (profile.account_status !== "active") return ROUTES.systemAccountStatus;

  if (!profile.onboarding_completed) return ROUTES.onboarding;
  if (!profile.profile_completed) return ROUTES.profileCompletion;

  return ROUTES.discover;
}
