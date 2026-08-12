export type SwipeAction = "like" | "pass" | "super_like";

/** Une carte du deck Découverte, telle que renvoyée par la RPC `search_profiles`. */
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
  /** Dernier signe de vie (heartbeat) — complété par la présence Realtime. */
  lastActiveAt: string | null;
}

/** Chips au-dessus du deck — mappés sur des flags RPC, pas de filtrage client. */
export type DiscoveryFeedMode = "all" | "new" | "online";

/**
 * Périmètre géographique des rencontres — le cœur du produit est la diaspora :
 *   · 'international' : profils vivant dans un AUTRE pays (défaut) ;
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
  /** Ids de la table `interests` ; vide = pas de filtre. */
  interestIds?: string[];
  /** Distance max en km ; au-delà du plafond = illimité (non transmis). */
  maxDistanceKm?: number;
}

/** Ligne du sélecteur « pays précis » (RPC get_discovery_countries). */
export interface DiscoveryCountry {
  country: string;
  memberCount: number;
}
