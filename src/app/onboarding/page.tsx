import { OnboardingWizard } from "@/features/onboarding/components/onboarding-wizard";

/**
 * Parcours d'onboarding (Sprint 01). Route protégée par le proxy : seul un
 * membre connecté y accède. Le wizard renvoie vers l'app une fois terminé.
 */
export default function OnboardingPage() {
  return <OnboardingWizard />;
}
