import { type ReactNode } from "react";
import { create } from "zustand";

/**
 * État des surcouches UI globales (modale + bottom sheet).
 * Alimente `ModalProvider` et `BottomSheetProvider` : n'importe quel composant
 * peut ouvrir une surface sans prop-drilling.
 */
interface OverlayPayload {
  content: ReactNode;
  title?: string;
  description?: string;
  dismissible?: boolean;
}

interface UIState {
  modal: OverlayPayload | null;
  sheet: OverlayPayload | null;

  openModal: (payload: OverlayPayload) => void;
  closeModal: () => void;

  openSheet: (payload: OverlayPayload) => void;
  closeSheet: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  modal: null,
  sheet: null,

  openModal: (modal) => set({ modal }),
  closeModal: () => set({ modal: null }),

  openSheet: (sheet) => set({ sheet }),
  closeSheet: () => set({ sheet: null }),
}));
