"use client";

import { useEffect } from "react";

/**
 * Enregistre le service worker (`/public/sw.js`) côté client, en production
 * uniquement. Rend l'app installable et disponible hors-ligne.
 *
 * Composant sans rendu — à monter une fois dans le layout racine.
 */
export function ServiceWorkerRegister() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;
    if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) {
      return;
    }

    const register = () => {
      navigator.serviceWorker.register("/sw.js").catch((error) => {
        console.error("[sw] échec d'enregistrement :", error);
      });
    };

    // Attendre le load pour ne pas concurrencer le rendu initial.
    if (document.readyState === "complete") {
      register();
    } else {
      window.addEventListener("load", register, { once: true });
      return () => window.removeEventListener("load", register);
    }
  }, []);

  return null;
}
