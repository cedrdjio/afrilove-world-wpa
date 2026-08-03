"use client";

import { useEffect } from "react";

/**
 * Pilote le retrait du splash de démarrage (`#app-splash`, rendu côté serveur
 * dans le layout et animé en CSS pur). On garantit un temps d'affichage
 * minimum — pour laisser l'animation respirer — puis on déclenche le fondu de
 * sortie et on retire le nœud du DOM. Un filet de sécurité borne la durée
 * totale afin de ne jamais bloquer l'écran.
 */
const MIN_VISIBLE_MS = 1400;
const FADE_MS = 600;
const MAX_VISIBLE_MS = 4000;

export function SplashScreen() {
  useEffect(() => {
    const el = document.getElementById("app-splash");
    if (!el) return;

    const start = performance.now();
    let dismissed = false;

    const dismiss = () => {
      if (dismissed) return;
      dismissed = true;
      const elapsed = performance.now() - start;
      const wait = Math.max(0, MIN_VISIBLE_MS - elapsed);
      window.setTimeout(() => {
        el.classList.add("af-splash-hide");
        window.setTimeout(() => el.remove(), FADE_MS);
      }, wait);
    };

    if (document.readyState === "complete") {
      dismiss();
    } else {
      window.addEventListener("load", dismiss, { once: true });
    }
    const safety = window.setTimeout(dismiss, MAX_VISIBLE_MS);

    return () => {
      window.removeEventListener("load", dismiss);
      window.clearTimeout(safety);
    };
  }, []);

  return null;
}
