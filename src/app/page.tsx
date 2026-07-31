import { Welcome } from "@/components/brand/welcome";
import { AppShell } from "@/components/layout/app-shell";

/**
 * Accueil (pré-authentification). Point d'entrée public de la PWA.
 * Aucune fonctionnalité métier — la découverte, l'auth et l'onboarding
 * arriveront dans les prochains sprints via les routes déjà déclarées.
 */
export default function HomePage() {
  return (
    <AppShell>
      <Welcome />
    </AppShell>
  );
}
