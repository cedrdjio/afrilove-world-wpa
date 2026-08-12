/**
 * Helpers de formatage purs (sans dépendance au framework).
 * Réservés aux transformations d'affichage réutilisables.
 */

/** Initiales à partir d'un nom complet (avatars de repli). */
export function initials(fullName: string): string {
  return fullName
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

/** Distance lisible : « à 4 km », « à moins d'1 km ». */
export function formatDistanceKm(km: number): string {
  if (km < 1) return "à moins d'1 km";
  return `à ${Math.round(km)} km`;
}

/** Tronque proprement un texte pour les aperçus. */
export function truncate(text: string, max: number): string {
  if (text.length <= max) return text;
  return `${text.slice(0, max - 1).trimEnd()}…`;
}

const TIME_FMT = new Intl.DateTimeFormat("fr-FR", {
  hour: "2-digit",
  minute: "2-digit",
});
const WEEKDAY_FMT = new Intl.DateTimeFormat("fr-FR", { weekday: "short" });

/**
 * Heure/étiquette relative pour les listes de conversations (« 14:32 »,
 * « Hier », « Lun »). Basé sur `Intl` — zéro dépendance, localisé fr-FR.
 */
export function formatConversationTime(iso: string, now = new Date()): string {
  const date = new Date(iso);
  const dayMs = 86_400_000;
  const startOfDay = (d: Date) =>
    new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  const days = Math.round((startOfDay(now) - startOfDay(date)) / dayMs);

  if (days <= 0) return TIME_FMT.format(date);
  if (days === 1) return "Hier";
  if (days < 7) return WEEKDAY_FMT.format(date).replace(".", "");
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "2-digit",
  }).format(date);
}

/** Heure courte « 14:20 » (bulles de chat). */
export function formatClockTime(iso: string): string {
  return TIME_FMT.format(new Date(iso));
}

/**
 * Étiquette relative « à l'instant », « il y a 12 min », « il y a 3 h »,
 * « il y a 2 j » (flux d'activité). Localisé fr-FR, sans dépendance.
 */
export function formatTimeAgo(iso: string, now = new Date()): string {
  const diffMs = now.getTime() - new Date(iso).getTime();
  const min = Math.round(diffMs / 60_000);
  if (min < 1) return "À l'instant";
  if (min < 60) return `Il y a ${min} min`;
  const hours = Math.round(min / 60);
  if (hours < 24) return `Il y a ${hours} h`;
  const days = Math.round(hours / 24);
  if (days < 7) return `Il y a ${days} j`;
  const weeks = Math.round(days / 7);
  return `Il y a ${weeks} sem`;
}

/** Groupe d'un instant pour le flux d'activité (aujourd'hui vs plus ancien). */
export function isToday(iso: string, now = new Date()): boolean {
  const d = new Date(iso);
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  );
}
