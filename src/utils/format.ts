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
