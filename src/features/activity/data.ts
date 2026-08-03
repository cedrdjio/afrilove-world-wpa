import { DEMO_PROFILES } from "@/features/profiles/data";

export type ActivityType = "match" | "superlike" | "message" | "views";
export type ActivityGroup = "today" | "week";

/** Origine d'une activité (avatar) — indépendant du modèle Profile complet. */
export interface ActivityActor {
  firstName: string;
  photo: string | null;
}

export interface ActivityItem {
  id: string;
  type: ActivityType;
  /** Profil à l'origine (avatar) ; absent pour les agrégats (« vues »). */
  actor?: ActivityActor;
  /** Fragment mis en gras au début du libellé. */
  lead: string;
  text: string;
  time: string;
  group: ActivityGroup;
}

const p = (id: string): ActivityActor => {
  const found = DEMO_PROFILES.find((x) => x.id === id);
  if (!found) throw new Error(`Profil introuvable : ${id}`);
  return { firstName: found.firstName, photo: found.photos[0] ?? null };
};

/** Flux d'activité de démonstration (« 13 »). */
export const DEMO_ACTIVITY: ActivityItem[] = [
  {
    id: "a1",
    type: "match",
    actor: p("mariama"),
    lead: "Mariama",
    text: " et toi, c'est un match !",
    time: "Il y a 12 min",
    group: "today",
  },
  {
    id: "a2",
    type: "superlike",
    actor: p("thomas"),
    lead: "Thomas",
    text: " t'a envoyé un super like",
    time: "Il y a 1 h",
    group: "today",
  },
  {
    id: "a3",
    type: "message",
    actor: p("david"),
    lead: "David",
    text: " t'a envoyé un message",
    time: "Il y a 3 h",
    group: "today",
  },
  {
    id: "a4",
    type: "views",
    lead: "14 personnes",
    text: " ont vu ton profil",
    time: "Il y a 2 j",
    group: "week",
  },
];
