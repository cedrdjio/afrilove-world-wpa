/**
 * Routes centralisées — évite les chaînes magiques dans toute l'app.
 * Les routes métier (discovery, chat, premium…) seront ajoutées par sprint,
 * sans casser cette structure.
 */
export const ROUTES = {
  home: "/",
  offline: "/offline",

  // Authentification (Sprint 01)
  auth: "/auth",
  login: "/auth/login",
  register: "/auth/register",
  forgotPassword: "/auth/forgot-password",
  resetPassword: "/auth/reset-password",
  authCallback: "/auth/callback",

  // Parcours & application
  onboarding: "/onboarding",
  discover: "/discover",
  likes: "/likes",
  messages: "/messages",
  profile: "/profile",
  photos: "/profile/photos",
  settings: "/settings",
  filters: "/filters",
  activity: "/activity",
  premium: "/premium",
  events: "/events",
} as const;

export type RouteKey = keyof typeof ROUTES;
export type RoutePath = (typeof ROUTES)[RouteKey];

/**
 * Routes nécessitant une session. Le proxy redirige les visiteurs anonymes
 * vers /auth/login (avec `?next=`), et éloigne les membres connectés des
 * écrans d'auth.
 */
export const PROTECTED_PREFIXES = [
  "/onboarding",
  "/discover",
  "/likes",
  "/messages",
  "/profile",
  "/settings",
  "/filters",
  "/activity",
  "/premium",
  "/events",
] as const;

/** Écrans d'authentification (interdits aux membres déjà connectés). */
export const AUTH_PREFIXES = ["/auth"] as const;
