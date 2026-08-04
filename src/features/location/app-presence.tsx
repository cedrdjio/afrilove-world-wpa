"use client";

import { useLocationSync } from "@/features/location/hooks/use-location-sync";

/**
 * Monté une fois dans le shell `(app)` : déclenche le battement d'activité et
 * la synchro de position (heartbeat + géoloc). Ne rend rien.
 */
export function AppPresence() {
  useLocationSync();
  return null;
}
