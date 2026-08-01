"use client";

import { useEffect, useState } from "react";
import { Download, Share } from "lucide-react";
import { toast } from "sonner";

import { Button, type ButtonProps } from "@/components/ui/button";
import { useHaptics } from "@/hooks/use-haptics";
import { useMounted } from "@/hooks/use-mounted";

/** Événement `beforeinstallprompt` (non typé dans la lib DOM standard). */
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

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

/**
 * Bouton « Installer l'application » (Ajouter à l'écran d'accueil).
 * - Android/Chrome : déclenche l'invite native `beforeinstallprompt`.
 * - iOS/Safari : affiche les instructions (Partager → Sur l'écran d'accueil).
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
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(
    null,
  );
  const [justInstalled, setJustInstalled] = useState(false);

  // L'effet n'ajoute que des écouteurs ; les setState se font dans les
  // callbacks d'événements (jamais directement dans le corps de l'effet).
  useEffect(() => {
    const onPrompt = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
    };
    const onInstalled = () => setJustInstalled(true);
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  // État dérivé (côté client uniquement, après montage).
  const standalone = mounted && isStandalone();
  const ios = mounted && isIOS();

  if (!mounted || standalone || justInstalled) return null;
  // Rien à afficher tant qu'aucune invite native n'est prête (hors iOS).
  if (!deferred && !ios) return null;

  async function handleClick() {
    haptic("medium");
    if (deferred) {
      await deferred.prompt();
      const { outcome } = await deferred.userChoice;
      if (outcome === "accepted") setJustInstalled(true);
      setDeferred(null);
      return;
    }
    toast("Installer sur iPhone", {
      description: "Touchez l’icône Partager, puis « Sur l’écran d’accueil ».",
      icon: <Share className="size-4" />,
      duration: 6000,
    });
  }

  return (
    <Button variant={variant} block className={className} onClick={handleClick}>
      <Download className="size-5" aria-hidden />
      Installer l’application
    </Button>
  );
}
