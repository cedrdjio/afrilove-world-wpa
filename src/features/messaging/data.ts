import { DEMO_PROFILES } from "@/features/profiles/data";
import type { Profile } from "@/features/profiles/types";

import type { Conversation } from "./types";

const byId = (id: string): Profile => {
  const p = DEMO_PROFILES.find((x) => x.id === id);
  if (!p) throw new Error(`Profil de démo introuvable : ${id}`);
  return p;
};

/**
 * Conversations de démonstration (« 07 » et « 09 »). Reproduit l'échange
 * Mariama ↔ Thomas des maquettes. Sera remplacé par Supabase Realtime.
 */
export const DEMO_CONVERSATIONS: Conversation[] = [
  {
    id: "mariama",
    peer: byId("mariama"),
    lastPreview: "Ce week-end alors ? J'apporte le vin.",
    lastAt: "2026-08-03T14:32:00Z",
    unread: 2,
    messages: [
      {
        id: "m1",
        authorId: "mariama",
        body: "Coucou ! J'ai vu qu'on adore tous les deux la cuisine ouest-africaine.",
        sentAt: "2026-08-03T14:20:00Z",
      },
      {
        id: "m2",
        authorId: "me",
        body: "Salut Mariama ! Carrément. Tu cuisines le thieboudienne ?",
        sentAt: "2026-08-03T14:22:00Z",
      },
      {
        id: "m3",
        authorId: "mariama",
        body: "C'est ma spécialité. Je t'invite quand tu veux.",
        sentAt: "2026-08-03T14:25:00Z",
      },
      {
        id: "m4",
        authorId: "me",
        body: "Ce week-end alors ? J'apporte le vin.",
        sentAt: "2026-08-03T14:32:00Z",
      },
    ],
  },
  {
    id: "david",
    peer: byId("david"),
    lastPreview: "On se croise au festival Afropunk ?",
    lastAt: "2026-08-02T18:10:00Z",
    unread: 0,
    messages: [
      {
        id: "d1",
        authorId: "david",
        body: "On se croise au festival Afropunk ?",
        sentAt: "2026-08-02T18:10:00Z",
      },
    ],
  },
  {
    id: "thomas",
    peer: byId("thomas"),
    lastPreview: "Tu as vu ma photo de Lyon ?",
    lastAt: "2026-07-28T09:00:00Z",
    unread: 0,
    messages: [
      {
        id: "t1",
        authorId: "thomas",
        body: "Tu as vu ma photo de Lyon ?",
        sentAt: "2026-07-28T09:00:00Z",
      },
    ],
  },
  {
    id: "sophie",
    peer: byId("sophie"),
    lastPreview: "Merci pour la recommandation resto",
    lastAt: "2026-07-22T20:30:00Z",
    unread: 0,
    messages: [
      {
        id: "s1",
        authorId: "sophie",
        body: "Merci pour la recommandation resto 🙏",
        sentAt: "2026-07-22T20:30:00Z",
      },
    ],
  },
];

export function findConversation(id: string): Conversation | undefined {
  return DEMO_CONVERSATIONS.find((c) => c.id === id);
}

/** Profils des « nouveaux matchs » (carrousel de la liste). */
export const DEMO_NEW_MATCHES = DEMO_CONVERSATIONS.map((c) => c.peer);
