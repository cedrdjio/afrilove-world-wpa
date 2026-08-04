"use client";

import { create } from "zustand";

/**
 * Passe l'emoji choisi (route dédiée) au composeur du chat : l'emoji est mis
 * en file ici et consommé par le brouillon de la page de chat — port de
 * `chatComposerStore` (mobile).
 */
interface ChatComposerState {
  pendingEmoji: string | null;
  setPendingEmoji: (emoji: string | null) => void;
}

export const useChatComposerStore = create<ChatComposerState>((set) => ({
  pendingEmoji: null,
  setPendingEmoji: (pendingEmoji) => set({ pendingEmoji }),
}));
