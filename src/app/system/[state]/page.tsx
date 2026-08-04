"use client";

import { useState } from "react";
import { notFound, useParams, useRouter } from "next/navigation";
import { CloudOff, Inbox, ServerCrash, WifiOff, Wrench } from "lucide-react";

import { ROUTES } from "@/constants/routes";
import { SystemStateScreen } from "@/components/feedback/system-state-screen";
import { FullScreenLoader } from "@/components/feedback/full-screen-loader";

/**
 * Écrans d'état système — port des écrans `/system/*` (mobile) regroupés en
 * une route dynamique `/system/[state]`. Chaque état reproduit fidèlement son
 * pendant mobile (icône, titre, description, action). `account-status` a sa
 * propre page (dépend de la session), `loading` rend le loader plein écran.
 */

const EmptyState = () => {
  const router = useRouter();
  return (
    <SystemStateScreen
      Icon={Inbox}
      title="Rien à afficher"
      description="Il n'y a encore rien ici. Revenez plus tard ou explorez d'autres sections de l'application."
      actionLabel="Retour à l'accueil"
      onAction={() => router.replace(ROUTES.discover)}
    />
  );
};

const MaintenanceState = () => (
  <SystemStateScreen
    Icon={Wrench}
    title="Maintenance en cours"
    description="AfriLove World est en cours de mise à jour pour vous offrir une meilleure expérience. Revenez dans quelques instants."
    iconClassName="bg-[linear-gradient(135deg,#F5C451_0%,#D99B2B_100%)] bg-none"
  />
);

const NoInternetState = () => {
  const [checking, setChecking] = useState(false);
  return (
    <SystemStateScreen
      Icon={CloudOff}
      title="Pas de connexion"
      description="AfriLove World a besoin d'internet pour trouver vos prochaines rencontres. Vérifiez votre connexion."
      actionLabel={checking ? "Vérification…" : "Réessayer"}
      loading={checking}
      onAction={() => {
        setChecking(true);
        setTimeout(() => setChecking(false), 1200);
      }}
    />
  );
};

const OfflineState = () => {
  const router = useRouter();
  return (
    <SystemStateScreen
      Icon={WifiOff}
      title="Vous êtes hors ligne"
      description="Certaines fonctionnalités peuvent être limitées jusqu'à ce que la connexion soit rétablie."
      actionLabel="Réessayer"
      onAction={() => router.back()}
    />
  );
};

const ServerErrorState = () => {
  const router = useRouter();
  return (
    <SystemStateScreen
      Icon={ServerCrash}
      title="Erreur serveur"
      description="Un problème technique est survenu de notre côté. Notre équipe a été notifiée."
      actionLabel="Réessayer"
      onAction={() => router.back()}
      iconClassName="bg-[linear-gradient(135deg,#C24545_0%,#7E2B2B_100%)] bg-none"
    />
  );
};

export default function SystemStatePage() {
  const { state } = useParams<{ state: string }>();

  switch (state) {
    case "empty":
      return <EmptyState />;
    case "loading":
      return <FullScreenLoader />;
    case "maintenance":
      return <MaintenanceState />;
    case "no-internet":
      return <NoInternetState />;
    case "offline":
      return <OfflineState />;
    case "server-error":
      return <ServerErrorState />;
    default:
      notFound();
  }
}
