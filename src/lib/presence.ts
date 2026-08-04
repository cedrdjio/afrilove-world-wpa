/**
 * Présence approximative basée sur le heartbeat `last_active_at` — port de
 * `utils/lastSeen.ts` + `isRecentlyOnline` (mobile). Utilisé dès la Découverte
 * (Jalon 8) et réutilisé par la messagerie/présence temps réel (Jalon 9).
 */

const ONLINE_WINDOW_MS = 60 * 60 * 1000;

/** Un membre est « récemment en ligne » s'il a été actif dans la dernière heure. */
export function isRecentlyOnline(lastActiveAt: string | null): boolean {
  if (!lastActiveAt) return false;
  return Date.now() - new Date(lastActiveAt).getTime() < ONLINE_WINDOW_MS;
}

/**
 * « Vu il y a X ». Au-delà d'une semaine on n'affiche rien : l'information
 * n'aide plus et stigmatise les comptes dormants.
 */
export function formatLastSeen(iso: string | null | undefined): string | null {
  if (!iso) return null;
  const ms = Date.now() - new Date(iso).getTime();
  if (Number.isNaN(ms) || ms < 0) return null;

  const minutes = Math.floor(ms / 60_000);
  if (minutes < 5) return "En ligne à l'instant";
  if (minutes < 60) return `En ligne il y a ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `En ligne il y a ${hours} h`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "En ligne hier";
  if (days < 7) return `En ligne il y a ${days} j`;
  return null;
}
