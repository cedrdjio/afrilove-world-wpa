"use client";

import { create } from "zustand";

/**
 * Relie le sélecteur d'emoji au champ de saisie du chat : l'emoji choisi est
 * mis en file ici puis consommé par le composer. Porté depuis l'app mobile.
 */
interface ChatComposerState {
  pendingEmoji: string | null;
  setPendingEmoji: (emoji: string | null) => void;
}

export const useChatComposerStore = create<ChatComposerState>((set) => ({
  pendingEmoji: null,
  setPendingEmoji: (pendingEmoji) => set({ pendingEmoji }),
}));
