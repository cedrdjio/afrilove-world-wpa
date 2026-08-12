const ONLINE_WINDOW_MS = 60 * 60 * 1000;

/**
 * Repli de présence quand le canal Realtime n'a pas (encore) synchronisé :
 * un dernier signe de vie de moins d'une heure est traité comme « en ligne ».
 * Porté depuis l'app mobile.
 */
export function isRecentlyOnline(lastActiveAt: string | null): boolean {
  if (!lastActiveAt) return false;
  return Date.now() - new Date(lastActiveAt).getTime() < ONLINE_WINDOW_MS;
}
