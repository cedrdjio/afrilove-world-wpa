/**
 * Types transversaux. Les types de base de données (générés par Supabase)
 * vivront dans `src/types/database.ts` une fois la BD cible câblée.
 */

/** Thème d'affichage géré par next-themes. */
export type ThemeMode = "light" | "dark" | "system";

/** Statut réseau exposé par le hook `useOnlineStatus`. */
export type NetworkStatus = "online" | "offline";

/** Enveloppe de résultat pour les services (pas d'exceptions silencieuses). */
export type Result<T, E = Error> =
  { ok: true; data: T } | { ok: false; error: E };

/** Rend certaines clés optionnelles. */
export type WithOptional<T, K extends keyof T> = Omit<T, K> &
  Partial<Pick<T, K>>;

/** Élément de navigation principale (barre du bas). */
export interface NavItem {
  key: string;
  label: string;
  href: string;
  icon: string;
}
