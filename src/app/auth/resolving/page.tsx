"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { ROUTES } from "@/constants/routes";
import { FullScreenLoader } from "@/components/feedback/full-screen-loader";
import { useAuth } from "@/providers/auth-provider";
import { useInitialRoute } from "@/hooks/use-initial-route";

/**
 * Sas de résolution post-action (connexion, vérification e-mail, réinit.) —
 * port d'`AuthResolvingScreen` (mobile). Partage exactement la logique de
 * `useInitialRoute` : « authentifié mais onboarding incomplet » vs « prêt »
 * est décidé à un seul endroit. Rafraîchit le profil au montage pour router
 * sur des données fraîches ; un filet de sécurité évite de rester bloqué si
 * le profil ne se charge jamais.
 */
export default function AuthResolvingPage() {
  const router = useRouter();
  const params = useSearchParams();
  const { refreshProfile } = useAuth();
  const route = useInitialRoute();

  useEffect(() => {
    void refreshProfile();
  }, [refreshProfile]);

  useEffect(() => {
    if (!route) return;
    // `next` (retour de deep link) n'est honoré que si l'utilisateur est
    // pleinement installé (route calculée = découverte) : sinon la garde
    // d'onboarding/profil doit primer.
    const next = params.get("next");
    if (route === ROUTES.discover && next && next.startsWith("/")) {
      router.replace(next);
    } else {
      router.replace(route);
    }
  }, [route, params, router]);

  // Filet de sécurité : profil introuvable durablement → erreur serveur.
  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace(ROUTES.systemServerError);
    }, 8000);
    return () => clearTimeout(timer);
  }, [router]);

  return <FullScreenLoader />;
}
