import type { IncomingLike, Profile } from "./types";

/**
 * Jeu de données de démonstration (« seed ») reproduisant fidèlement les
 * profils des maquettes. Il alimente les écrans tant que la couche Supabase
 * n'est pas branchée ; il sera remplacé par le `ProfilesRepository` sans
 * modifier les composants (les hooks exposent la même forme de données).
 */
export const DEMO_PROFILES: Profile[] = [
  {
    id: "thomas",
    firstName: "Thomas",
    age: 33,
    origin: "Lyon",
    city: "Lyon",
    distanceKm: 8,
    gender: "homme",
    compatibility: 94,
    mutualFriends: 2,
    bio: "Passionné de voyages et de cuisine du monde. Toujours partant pour un concert d'afrobeat ou un week-end à l'improviste.",
    interests: ["Voyages", "Cuisine du monde", "Afrobeat"],
    photos: ["/demo/thomas.webp"],
    verified: true,
    online: false,
  },
  {
    id: "mariama",
    firstName: "Mariama",
    age: 26,
    origin: "Dakar",
    city: "Bruxelles",
    distanceKm: 4,
    gender: "femme",
    compatibility: 92,
    mutualFriends: 3,
    bio: "Architecte d'intérieur passionnée de voyages entre l'Afrique et l'Europe. J'aime la bonne cuisine et les concerts.",
    interests: ["Voyages", "Danse", "Cuisine", "Art"],
    photos: ["/demo/mariama.webp"],
    verified: true,
    online: true,
  },
  {
    id: "david",
    firstName: "David",
    age: 30,
    origin: "Abidjan",
    city: "Paris",
    distanceKm: 12,
    gender: "homme",
    compatibility: 88,
    mutualFriends: 1,
    bio: "Ingénieur le jour, DJ le week-end. Je cherche quelqu'un avec qui explorer les festivals et les bons restos.",
    interests: ["Musique", "Sport", "Festivals"],
    photos: ["/demo/david.webp"],
    verified: false,
    online: false,
  },
  {
    id: "sophie",
    firstName: "Sophie",
    age: 28,
    origin: "Kinshasa",
    city: "Paris",
    distanceKm: 6,
    gender: "femme",
    compatibility: 90,
    mutualFriends: 4,
    bio: "Franco-congolaise, gourmande et créative. Fan de brunchs, de cinéma en plein air et de longues discussions.",
    interests: ["Cuisine", "Cinéma", "Art"],
    photos: ["/demo/aicha.webp"],
    verified: true,
    online: false,
  },
];

/** Profil de l'utilisateur courant (démo — écran « Mon profil »). */
export const DEMO_ME = {
  firstName: "Aïcha",
  lastName: "N'Diaye",
  age: 29,
  origin: "Dakar",
  city: "Paris",
  bio: "Franco-sénégalaise, créative et gourmande. Je cherche une histoire vraie, entre deux continents.",
  avatar: "/demo/aicha.webp",
  photos: ["/demo/aicha.webp", "/demo/mariama.webp", "/demo/david.webp"],
  completion: 85,
  verified: true,
  stats: { views: 248, likes: 96, matches: 12 },
} as const;

const [thomas, mariama, david, sophie] = DEMO_PROFILES as [
  Profile,
  Profile,
  Profile,
  Profile,
];

export const DEMO_INCOMING_LIKES: IncomingLike[] = [
  { profile: mariama, kind: "like", locked: false },
  { profile: david, kind: "super", locked: true },
  { profile: sophie, kind: "like", locked: true },
  { profile: thomas, kind: "like", locked: true },
];

export function findProfile(id: string): Profile | undefined {
  return DEMO_PROFILES.find((p) => p.id === id);
}
