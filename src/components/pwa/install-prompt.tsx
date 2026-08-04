"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { AnimatePresence, m } from "framer-motion";
import { Share, X } from "lucide-react";
import { toast } from "sonner";

import { useHaptics } from "@/hooks/use-haptics";
import { useMounted } from "@/hooks/use-mounted";

/** Événement `beforeinstallprompt` (non typé dans la lib DOM standard). */
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

/** Clé de temporisation : on ne re-propose pas avant ce délai après un refus. */
const DISMISS_KEY = "afl-install-dismissed-at";
/** Fenêtre de rappel : re-proposer 3 jours après un rejet (non envahissant). */
const COOLDOWN_MS = 3 * 24 * 60 * 60 * 1000;
/** Délai avant apparition — laisse l'utilisateur découvrir l'écran d'abord. */
const APPEAR_DELAY_MS = 3500;

function isStandalone(): boolean {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (window.navigator as unknown as { standalone?: boolean }).standalone ===
      true
  );
}

function isIOS(): boolean {
  return (
    /iphone|ipad|ipod/i.test(navigator.userAgent) &&
    !/crios|fxios/i.test(navigator.userAgent)
  );
}

function inCooldown(): boolean {
  try {
    const raw = localStorage.getItem(DISMISS_KEY);
    if (!raw) return false;
    return Date.now() - Number(raw) < COOLDOWN_MS;
  } catch {
    return false;
  }
}

/**
 * Invite d'installation PWA — bannière fine et discrète ancrée au-dessus de la
 * barre de navigation. Non envahissante : elle n'apparaît qu'après un court
 * délai, se referme d'un geste et ne revient qu'au bout de quelques jours.
 * - Android/Chrome : déclenche l'invite native `beforeinstallprompt`.
 * - iOS/Safari : rappelle le geste « Partager → Sur l'écran d'accueil ».
 * Montée globalement (layout) ; masquée si l'app est déjà installée.
 */
export function InstallPrompt() {
  const mounted = useMounted();
  const haptic = useHaptics();
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(
    null,
  );
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  // Écoute les événements d'installation (jamais de setState dans le corps).
  useEffect(() => {
    const onPrompt = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
    };
    const onInstalled = () => {
      setDeferred(null);
      setVisible(false);
    };
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  // Fait apparaître la bannière après un délai, si éligible.
  const ios = mounted && isIOS();
  const eligible =
    mounted && !isStandalone() && !inCooldown() && (Boolean(deferred) || ios);

  useEffect(() => {
    if (!eligible || dismissed) return;
    const t = window.setTimeout(() => setVisible(true), APPEAR_DELAY_MS);
    return () => window.clearTimeout(t);
  }, [eligible, dismissed]);

  const close = () => {
    haptic("light");
    setVisible(false);
    setDismissed(true);
    try {
      localStorage.setItem(DISMISS_KEY, String(Date.now()));
    } catch {
      // Stockage indisponible (mode privé) — on masque pour la session.
    }
  };

  const install = async () => {
    haptic("medium");
    if (deferred) {
      await deferred.prompt();
      const { outcome } = await deferred.userChoice;
      setDeferred(null);
      setVisible(false);
      if (outcome !== "accepted") {
        try {
          localStorage.setItem(DISMISS_KEY, String(Date.now()));
        } catch {
          /* noop */
        }
      }
      return;
    }
    // iOS : pas d'invite native — on rappelle le geste.
    toast("Installer sur iPhone", {
      description: "Touchez l’icône Partager, puis « Sur l’écran d’accueil ».",
      icon: <Share className="size-4" />,
      duration: 6000,
    });
    close();
  };

  return (
    <AnimatePresence>
      {visible && (
        <m.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 24 }}
          transition={{ type: "spring", damping: 26, stiffness: 320 }}
          role="dialog"
          aria-label="Installer l’application"
          className="border-border bg-card/95 fixed bottom-[calc(env(safe-area-inset-bottom)+4.75rem)] left-1/2 z-50 flex w-[calc(100%-1.5rem)] max-w-md -translate-x-1/2 items-center gap-3 rounded-[var(--radius-lg)] border p-2.5 shadow-[0_16px_44px_-12px_rgba(46,36,64,0.45)] backdrop-blur-xl"
        >
          <span className="relative size-11 shrink-0 overflow-hidden rounded-[var(--radius-sm)]">
            <Image
              src="/brand/logo.png"
              alt=""
              fill
              sizes="44px"
              className="object-cover"
            />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-foreground text-sm leading-tight font-bold">
              Installer AfriLove World
            </p>
            <p className="text-muted-foreground truncate text-xs">
              Accès rapide, plein écran, hors-ligne.
            </p>
          </div>
          <button
            type="button"
            onClick={install}
            className="gradient-signature shadow-brand shrink-0 rounded-[var(--radius-pill)] px-4 py-2 text-sm font-bold text-white active:scale-95"
          >
            Installer
          </button>
          <button
            type="button"
            onClick={close}
            aria-label="Plus tard"
            className="text-muted-foreground hover:text-foreground grid size-8 shrink-0 place-items-center rounded-full transition-colors"
          >
            <X className="size-4" aria-hidden />
          </button>
        </m.div>
      )}
    </AnimatePresence>
  );
}
