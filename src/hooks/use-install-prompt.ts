"use client";

import { useCallback, useSyncExternalStore } from "react";

/** Événement `beforeinstallprompt` (non typé dans la lib DOM standard). */
export interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

/**
 * État global partagé de l'invite d'installation. L'événement natif
 * `beforeinstallprompt` de Chrome se déclenche TRÈS tôt (souvent avant qu'un
 * composant React n'ait pu monter son écouteur). Un script inline dans le
 * layout le capte dès le 1er octet et le dépose ici ; ce hook le relit au
 * montage. Sans cela, on rate l'événement, le bouton ne s'affiche pas, et
 * l'utilisateur se rabat sur le menu du navigateur — lequel crée un simple
 * RACCOURCI au lieu d'une vraie installation (WebAPK).
 */
interface InstallStore {
  evt: BeforeInstallPromptEvent | null;
  installed: boolean;
}

/** Événement custom émis quand l'état d'installation change. */
const CHANGE_EVENT = "af-install-change";

function getStore(): InstallStore {
  const w = window as unknown as { __afInstall?: InstallStore };
  return (w.__afInstall ??= { evt: null, installed: false });
}

function subscribe(callback: () => void): () => void {
  // Filet de sécurité : on capte aussi l'événement natif directement, au cas
  // où le script inline n'aurait pas tourné. Idempotent avec le script inline.
  const onPrompt = (e: Event) => {
    e.preventDefault();
    getStore().evt = e as BeforeInstallPromptEvent;
    callback();
  };
  const onInstalled = () => {
    const s = getStore();
    s.evt = null;
    s.installed = true;
    callback();
  };
  window.addEventListener("beforeinstallprompt", onPrompt);
  window.addEventListener("appinstalled", onInstalled);
  window.addEventListener(CHANGE_EVENT, callback);
  return () => {
    window.removeEventListener("beforeinstallprompt", onPrompt);
    window.removeEventListener("appinstalled", onInstalled);
    window.removeEventListener(CHANGE_EVENT, callback);
  };
}

type InstallState = "idle" | "ready" | "installed";

function getSnapshot(): InstallState {
  const s = getStore();
  if (s.installed) return "installed";
  return s.evt ? "ready" : "idle";
}

/** L'app tourne-t-elle déjà en mode installé (plein écran / standalone) ? */
export function isStandalone(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (window.navigator as unknown as { standalone?: boolean }).standalone ===
      true
  );
}

/**
 * Appareil iOS ? On inclut l'iPad moderne : depuis iPadOS 13, Safari s'annonce
 * comme un « Macintosh » — on le démasque par la présence du tactile. Sans ça,
 * l'iPad n'était jamais reconnu et les instructions d'installation n'étaient
 * jamais proposées (« sur iOS ça ne marche pas »).
 */
export function isIOS(): boolean {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent;
  if (/iphone|ipad|ipod/i.test(ua)) return true;
  return (
    (navigator.platform === "MacIntel" || /Mac/.test(ua)) &&
    navigator.maxTouchPoints > 1
  );
}

/**
 * Invite d'installation PWA, robuste au timing. Expose l'état courant et une
 * action `promptInstall()` qui déclenche la VRAIE invite native (WebAPK sur
 * Android), à n'appeler que dans un gestionnaire de clic (geste utilisateur).
 */
export function useInstallPrompt() {
  const state = useSyncExternalStore(
    subscribe,
    getSnapshot,
    () => "idle" as const,
  );

  const promptInstall = useCallback(async (): Promise<
    "accepted" | "dismissed" | "unavailable"
  > => {
    const s = getStore();
    if (!s.evt) return "unavailable";
    await s.evt.prompt();
    const { outcome } = await s.evt.userChoice;
    // L'événement n'est utilisable qu'une fois : on le consomme.
    s.evt = null;
    if (outcome === "accepted") s.installed = true;
    window.dispatchEvent(new Event(CHANGE_EVENT));
    return outcome;
  }, []);

  return { state, promptInstall };
}
