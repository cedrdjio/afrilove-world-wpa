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
