/**
 * Clés de cache TanStack Query centralisées — miroir des clés utilisées dans
 * l'app mobile (source de vérité). Les regrouper ici garantit que les
 * invalidations croisées (ex. un swipe invalide `entitlements` + `favorites`,
 * un match invalide `matches` + `conversations`) restent strictement
 * identiques au comportement mobile, jalon après jalon.
 *
 * Convention : chaque entrée renvoie un tableau `as const`. Les clés dérivées
 * (par utilisateur, par cible) prennent des paramètres. Ne jamais dupliquer une
 * chaîne de clé ailleurs dans le code — importer d'ici.
 */
export const queryKeys = {
  // Profil ---------------------------------------------------------------
  profile: (userId?: string) => ["profile", userId] as const,
  otherProfile: (id: string) => ["profile", "other", id] as const,
  profileStats: (userId?: string) => ["profile-stats", userId] as const,
  referenceData: (kind: string) => ["reference-data", kind] as const,

  // Découverte / matching ------------------------------------------------
  discovery: (...parts: readonly unknown[]) => ["discovery", ...parts] as const,
  discoveryCount: (...parts: readonly unknown[]) =>
    ["discovery-count", ...parts] as const,
  discoveryCountries: () => ["discovery-countries"] as const,
  matches: (userId?: string) => ["matches", userId] as const,

  // Premium / entitlements ----------------------------------------------
  premiumPlans: () => ["premium-plans"] as const,
  entitlements: (userId?: string) => ["entitlements", userId] as const,
  favorites: (userId?: string) => ["favorites", userId] as const,
  likers: (userId?: string) => ["likers", userId] as const,

  // Messagerie -----------------------------------------------------------
  conversations: (userId?: string) => ["conversations", userId] as const,
  messages: (matchId: string) => ["messages", matchId] as const,

  // Notifications --------------------------------------------------------
  notifications: (userId?: string) => ["notifications", userId] as const,

  // KYC / modération -----------------------------------------------------
  kyc: (userId?: string) => ["kyc", userId] as const,
  blockedUsers: (userId?: string) => ["blocked-users", userId] as const,

  // Divers ---------------------------------------------------------------
  legalDocument: (key: string) => ["legal-document", key] as const,
  clientLogs: (userId?: string) => ["client-logs", userId] as const,
} as const;

/** Racines de clés — pour invalider une famille entière (`predicate` / `exact:false`). */
export const queryRoots = {
  profile: "profile",
  discovery: "discovery",
  discoveryCount: "discovery-count",
  matches: "matches",
  entitlements: "entitlements",
  favorites: "favorites",
  likers: "likers",
  conversations: "conversations",
  messages: "messages",
  notifications: "notifications",
} as const;
