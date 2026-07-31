/**
 * Routes centralisées — évite les chaînes magiques dans toute l'app.
 * Les routes métier (discovery, chat, premium…) seront ajoutées par sprint,
 * sans casser cette structure.
 */
export const ROUTES = {
  home: "/",
  offline: "/offline",
  // Réservées aux prochains sprints (déclarées ici pour la navigation typée) :
  onboarding: "/onboarding",
  auth: "/auth",
  discover: "/discover",
  likes: "/likes",
  messages: "/messages",
  profile: "/profile",
  settings: "/settings",
} as const;

export type RouteKey = keyof typeof ROUTES;
export type RoutePath = (typeof ROUTES)[RouteKey];
