import { Welcome } from "@/components/brand/welcome";

/**
 * Accueil (pré-authentification). Point d'entrée public de la PWA.
 * `Welcome` porte sa propre mise en page plein écran (header, héro, CTA).
 */
export default function HomePage() {
  return <Welcome />;
}
