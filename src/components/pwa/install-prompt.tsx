"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { AnimatePresence, m } from "framer-motion";
import { X } from "lucide-react";

import { IosInstallSheet } from "@/components/pwa/ios-install-sheet";
import { useHaptics } from "@/hooks/use-haptics";
import { useMounted } from "@/hooks/use-mounted";
import {
  isIOS,
  isStandalone,
  useInstallPrompt,
} from "@/hooks/use-install-prompt";

/** Clé de temporisation : on ne re-propose pas avant ce délai après un refus. */
const DISMISS_KEY = "afl-install-dismissed-at";
/** Fenêtre de rappel : re-proposer 3 jours après un rejet (non envahissant). */
const COOLDOWN_MS = 3 * 24 * 60 * 60 * 1000;
/** Délai avant apparition — laisse l'utilisateur découvrir l'écran d'abord. */
const APPEAR_DELAY_MS = 3500;

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
 * - Android/Chrome : déclenche la VRAIE invite native `beforeinstallprompt`.
 * - iOS/Safari : ouvre la fiche « Partager → Sur l'écran d'accueil ».
 * Montée globalement (layout) ; masquée si l'app est déjà installée.
 */
export function InstallPrompt() {
  const mounted = useMounted();
  const haptic = useHaptics();
  const { state, promptInstall } = useInstallPrompt();
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [iosOpen, setIosOpen] = useState(false);

  const ios = mounted && isIOS();
  const standalone = mounted && isStandalone();
  const canPrompt = state === "ready";

  // Éligible si installable (invite native prête) ou iOS, et non déjà installé.
  const eligible =
    mounted &&
    !standalone &&
    state !== "installed" &&
    !inCooldown() &&
    (canPrompt || ios);

  useEffect(() => {
    if (!eligible || dismissed) return;
    const t = window.setTimeout(() => setVisible(true), APPEAR_DELAY_MS);
    return () => window.clearTimeout(t);
  }, [eligible, dismissed]);

  // Visible seulement si l'app n'est pas déjà installée (état dérivé, pas
  // d'effet : évite un rendu en cascade quand `appinstalled` survient).
  const showBanner = visible && state !== "installed";

  const remember = () => {
    try {
      localStorage.setItem(DISMISS_KEY, String(Date.now()));
    } catch {
      // Stockage indisponible (mode privé) — on masque pour la session.
    }
  };

  const close = () => {
    haptic("light");
    setVisible(false);
    setDismissed(true);
    remember();
  };

  const install = async () => {
    haptic("medium");
    if (canPrompt) {
      const outcome = await promptInstall();
      setVisible(false);
      if (outcome !== "accepted") remember();
      return;
    }
    // iOS : pas d'invite native — on ouvre la fiche d'instructions.
    setIosOpen(true);
    setVisible(false);
    remember();
  };

  return (
    <>
      <AnimatePresence>
        {showBanner && (
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
      <IosInstallSheet open={iosOpen} onOpenChange={setIosOpen} />
    </>
  );
}
