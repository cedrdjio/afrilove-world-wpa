"use client";

import { useSyncExternalStore } from "react";

const emptySubscribe = () => () => {};

/**
 * `true` uniquement après le montage client — évite les mismatches
 * d'hydratation pour tout ce qui dépend du navigateur (thème, storage…).
 *
 * Implémenté via `useSyncExternalStore` : le snapshot serveur renvoie `false`,
 * le snapshot client `true`, sans `setState` dans un effet.
 */
export function useMounted(): boolean {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );
}
