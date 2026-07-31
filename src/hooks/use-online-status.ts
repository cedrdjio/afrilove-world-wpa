"use client";

import { useEffect, useState } from "react";

import type { NetworkStatus } from "@/types";

/**
 * Statut réseau en temps réel — base du "mode faible connexion" et des
 * bandeaux hors-ligne. SSR-safe (part du principe qu'on est en ligne).
 */
export function useOnlineStatus(): NetworkStatus {
  const [status, setStatus] = useState<NetworkStatus>("online");

  useEffect(() => {
    const update = () => setStatus(navigator.onLine ? "online" : "offline");
    update();
    window.addEventListener("online", update);
    window.addEventListener("offline", update);
    return () => {
      window.removeEventListener("online", update);
      window.removeEventListener("offline", update);
    };
  }, []);

  return status;
}
