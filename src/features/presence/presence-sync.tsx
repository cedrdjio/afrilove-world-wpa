"use client";

import { usePresenceSync } from "./store";

/**
 * Monte l'abonnement Presence Realtime une seule fois (canal partagé
 * « online-members »). Rendu `null` — c'est un effet, pas de l'UI.
 */
export function PresenceSync() {
  usePresenceSync();
  return null;
}
