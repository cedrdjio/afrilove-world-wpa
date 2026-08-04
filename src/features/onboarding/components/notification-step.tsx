"use client";

import { useState } from "react";
import { Bell } from "lucide-react";

import { PermissionStep } from "./permission-step";

/**
 * Permission de notifications — port de `NotificationPermissionScreen`.
 * « Activer » demande la permission de notification du navigateur (équivalent
 * web de l'invite OS), puis avance. L'abonnement Web Push réel (VAPID + service
 * worker) est mis en place au Jalon 10 ; ici on ne fait que solliciter la
 * permission, sans jamais bloquer le parcours.
 */
export function NotificationStep({ onDone }: { onDone: () => void }) {
  const [asking, setAsking] = useState(false);

  async function handleEnable() {
    setAsking(true);
    try {
      if (
        typeof window !== "undefined" &&
        "Notification" in window &&
        Notification.permission === "default"
      ) {
        await Notification.requestPermission();
      }
    } catch {
      // Une invite refusée ou indisponible ne doit jamais bloquer l'onboarding.
    } finally {
      setAsking(false);
      onDone();
    }
  }

  return (
    <PermissionStep
      Icon={Bell}
      title={<>Restez informé(e)</>}
      description="Recevez une alerte dès qu'un match, un message ou un like arrive — ne manquez aucune opportunité."
      primaryLabel="Activer les notifications"
      loading={asking}
      onPrimary={() => void handleEnable()}
      onSkip={onDone}
    />
  );
}
