/**
 * Types de la Découverte — port de `modules/discovery/types/discovery.ts`
 * (mobile, source de vérité). Le backend Supabase (`search_profiles`) est
 * partagé : ces formes reflètent 1:1 les lignes RPC normalisées.
 */

export type SwipeAction = "like" | "pass" | "super_like";

/** Une carte du deck, telle que renvoyée par la RPC `search_profiles`. */
export interface DiscoveryProfile {
  id: string;
  firstName: string;
  age: number;
  city: string | null;
  country: string | null;
  bio: string | null;
  isVerified: boolean;
  avatarUrl: string | null;
  distanceKm: number | null;
  compatibility: number;
  interestNames: string[];
  /** Dernier signe de vie (heartbeat) — complété en direct par la présence. */
  lastActiveAt: string | null;
}

/** Chips au-dessus du deck — mappées sur des drapeaux RPC, pas un filtrage client. */
export type DiscoveryFeedMode = "all" | "new" | "online";

/**
 * Périmètre géographique des rencontres — le cœur du produit est la diaspora :
 *   · 'international' : uniquement des profils vivant dans un AUTRE pays (défaut) ;
 *   · 'country'       : uniquement les profils d'un pays précis ;
 *   · 'all'           : le monde entier, sans restriction.
 */
export type DiscoveryScope = "international" | "country" | "all";

export interface DiscoveryFilters {
  ageMin: number;
  ageMax: number;
  scope: DiscoveryScope;
  /** Pays ciblé quand scope = 'country'. */
  country: string | null;
  verifiedOnly: boolean;
  mode: DiscoveryFeedMode;
  /** Ids de la table interests ; vide = pas de filtre. */
  interestIds?: string[];
}

/** Ligne du sélecteur « pays précis » (RPC get_discovery_countries). */
export interface DiscoveryCountry {
  country: string;
  memberCount: number;
}
