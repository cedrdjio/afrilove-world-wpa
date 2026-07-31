"use client";

import { WifiOff } from "lucide-react";
import { AnimatePresence, m } from "framer-motion";

import { useOnlineStatus } from "@/hooks/use-online-status";

/**
 * Bandeau discret affiché hors-ligne (support "mode faible connexion").
 * S'appuie sur le Service Worker pour le contenu déjà mis en cache.
 */
export function OfflineBanner() {
  const status = useOnlineStatus();

  return (
    <AnimatePresence>
      {status === "offline" && (
        <m.div
          initial={{ y: -40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -40, opacity: 0 }}
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
          role="status"
          className="bg-brand-950 fixed inset-x-0 top-0 z-[60] mx-auto flex w-fit items-center gap-2 rounded-b-[var(--radius-md)] px-4 py-2 text-sm font-medium text-white shadow-lg"
        >
          <WifiOff className="size-4" aria-hidden />
          Hors ligne — certaines fonctions sont limitées
        </m.div>
      )}
    </AnimatePresence>
  );
}
