"use client";

import { useLocationSync } from "@/features/location/hooks/use-location-sync";
import { usePresenceSync } from "@/features/presence/store";
import { useNotificationsRealtime } from "@/features/notifications/hooks/use-notifications";
import { usePushSync } from "@/features/notifications/hooks/use-push";

/**
 * Monté une fois dans le shell `(app)` : déclenche le battement d'activité et la
 * synchro de position (heartbeat + géoloc, Jalon 8), la présence temps réel
 * « online-members » (Jalon 9), l'abonnement Realtime aux notifications et
 * l'enregistrement Web Push (Jalon 10). Ne rend rien.
 */
export function AppPresence() {
  useLocationSync();
  usePresenceSync();
  useNotificationsRealtime();
  usePushSync();
  return null;
}
