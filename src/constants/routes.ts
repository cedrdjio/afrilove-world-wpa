/**
 * Routes centralisées — évite les chaînes magiques dans toute l'app.
 *
 * Carte complète alignée sur la navigation de l'app mobile (source de vérité,
 * ~150 destinations). Les pages correspondantes sont livrées jalon par jalon ;
 * centraliser les chemins ici dès maintenant évite les divergences et permet
 * aux gardes (proxy) de raisonner sur la structure définitive.
 *
 * `ROUTES` ne contient que des chemins statiques (valeurs `string`). Les routes
 * dynamiques (avec paramètre) sont des fabriques dans `dynamicRoutes`.
 */
export const ROUTES = {
  home: "/",
  offline: "/offline",

  // Authentification
  auth: "/auth",
  welcome: "/auth", // écran d'accueil public (= point d'entrée auth)
  login: "/auth/login",
  register: "/auth/register",
  forgotPassword: "/auth/forgot-password",
  resetPassword: "/auth/reset-password",
  verifyEmail: "/auth/verify-email",
  authCallback: "/auth/callback",
  authResolving: "/auth/resolving",
  authSuccess: "/auth/success",

  // Onboarding
  onboarding: "/onboarding",

  // Onglets principaux (miroir des tabs mobiles : discover/matches/messages/profile)
  discover: "/discover",
  discoverFilters: "/discover/filters",
  discoverLikeLimit: "/discover/like-limit",
  matches: "/matches",
  matchCelebration: "/matches/celebration",
  matchesSearch: "/matches/search",
  likes: "/likes", // alias historique du web — réconcilié avec /matches au Jalon 3
  messages: "/messages",
  profile: "/profile",

  // Édition de profil
  editProfile: "/edit-profile",
  profileCompletion: "/profile-completion",

  // Recherche avancée
  search: "/search",

  // Premium
  premium: "/premium",
  premiumPricing: "/premium/pricing",
  premiumFeatures: "/premium/features",
  premiumCheckout: "/premium/checkout",
  premiumCallback: "/premium/callback",
  premiumSuccess: "/premium/success",
  premiumFailed: "/premium/failed",
  premiumLocked: "/premium/locked",

  // KYC / vérification
  kyc: "/kyc",
  kycUploadId: "/kyc/upload-id",
  kycSelfie: "/kyc/selfie",
  kycRecap: "/kyc/recap",
  kycPending: "/kyc/pending",
  kycApproved: "/kyc/approved",
  kycRejected: "/kyc/rejected",

  // Notifications
  notifications: "/notifications",

  // Réglages
  settings: "/settings",
  settingsAccount: "/settings/account",
  settingsSecurity: "/settings/security",
  settingsPrivacy: "/settings/privacy",
  settingsNotifications: "/settings/notifications",
  settingsChangeEmail: "/settings/change-email",
  settingsChangePassword: "/settings/change-password",
  settingsDeleteAccount: "/settings/delete-account",
  settingsLogout: "/settings/logout",
  settingsLogs: "/settings/logs",

  // Modération / comptes
  blockedUsers: "/blocked-users",
  reportsConfirmation: "/reports/confirmation",
} as const;

export type RouteKey = keyof typeof ROUTES;
export type RoutePath = (typeof ROUTES)[RouteKey];

/** Fabriques de routes dynamiques (paramétrées). */
export const dynamicRoutes = {
  profile: (id: string) => `/profile/${id}` as const,
  profileGallery: (id: string) => `/profile/${id}/gallery` as const,
  chat: (matchId: string) => `/chat/${matchId}` as const,
  chatEmojiPicker: (matchId: string) =>
    `/chat/${matchId}/emoji-picker` as const,
  report: (id: string) => `/reports/${id}` as const,
  legal: (key: string) => `/legal/${key}` as const,
  system: (state: string) => `/system/${state}` as const,
} as const;

/**
 * Routes nécessitant une session. Le proxy redirige les visiteurs anonymes
 * vers /auth/login (avec `?next=`), et éloigne les membres connectés des
 * écrans d'auth. Aligné sur l'ensemble des zones authentifiées du mobile.
 */
export const PROTECTED_PREFIXES = [
  "/onboarding",
  "/discover",
  "/matches",
  "/likes",
  "/messages",
  "/profile",
  "/edit-profile",
  "/profile-completion",
  "/search",
  "/chat",
  "/premium",
  "/kyc",
  "/notifications",
  "/settings",
  "/blocked-users",
  "/reports",
] as const;

/** Écrans d'authentification (interdits aux membres déjà connectés). */
export const AUTH_PREFIXES = ["/auth"] as const;
