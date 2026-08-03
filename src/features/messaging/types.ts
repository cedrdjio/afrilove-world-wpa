import type { Profile } from "@/features/profiles/types";

export interface ChatMessage {
  id: string;
  /** `me` = utilisateur courant ; sinon l'`id` du profil correspondant. */
  authorId: "me" | string;
  body: string;
  /** ISO timestamp. */
  sentAt: string;
}

export interface Conversation {
  id: string;
  peer: Profile;
  messages: ChatMessage[];
  /** Aperçu du dernier message (liste). */
  lastPreview: string;
  lastAt: string;
  unread: number;
}
