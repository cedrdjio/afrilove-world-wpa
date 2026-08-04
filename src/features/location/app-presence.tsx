"use client";

import { useLocationSync } from "@/features/location/hooks/use-location-sync";
import { usePresenceSync } from "@/features/presence/store";

/**
 * Monté une fois dans le shell `(app)` : déclenche le battement d'activité et la
 * synchro de position (heartbeat + géoloc, Jalon 8) ainsi que la présence temps
 * réel « online-members » (Jalon 9). Ne rend rien.
 */
export function AppPresence() {
  useLocationSync();
  usePresenceSync();
  return null;
}
