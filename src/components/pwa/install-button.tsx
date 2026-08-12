"use client";

import { useState } from "react";
import { Download } from "lucide-react";

import { Button, type ButtonProps } from "@/components/ui/button";
import { IosInstallSheet } from "@/components/pwa/ios-install-sheet";
import { useHaptics } from "@/hooks/use-haptics";
import { useMounted } from "@/hooks/use-mounted";
import {
  isIOS,
  isStandalone,
  useInstallPrompt,
} from "@/hooks/use-install-prompt";

/**
 * Bouton « Installer l'application » (Ajouter à l'écran d'accueil).
 * - Android/Chrome : déclenche la VRAIE invite native `beforeinstallprompt`
 *   (installation WebAPK), captée dès le 1er octet pour ne jamais la rater.
 * - iOS/Safari : ouvre une fiche d'instructions (Partager → Sur l'écran d'accueil).
 * - Déjà installé / non éligible : ne s'affiche pas.
 */
export function InstallButton({
  variant = "outline",
  className,
}: {
  variant?: ButtonProps["variant"];
  className?: string;
}) {
  const mounted = useMounted();
  const haptic = useHaptics();
  const { state, promptInstall } = useInstallPrompt();
  const [iosOpen, setIosOpen] = useState(false);

  // État dérivé (côté client uniquement, après montage).
  const standalone = mounted && isStandalone();
  const ios = mounted && isIOS();
  const canPrompt = state === "ready";

  if (!mounted || standalone || state === "installed") return null;
  // Rien à afficher tant qu'aucune invite native n'est prête (hors iOS).
  if (!canPrompt && !ios) return null;

  async function handleClick() {
    haptic("medium");
    if (canPrompt) {
      await promptInstall();
      return;
    }
    // iOS : pas d'invite native — on ouvre la fiche d'instructions.
    setIosOpen(true);
  }

  return (
    <>
      <Button
        variant={variant}
        block
        className={className}
        onClick={handleClick}
      >
        <Download className="size-5" aria-hidden />
        Installer l’application
      </Button>
      <IosInstallSheet open={iosOpen} onOpenChange={setIosOpen} />
    </>
  );
}
