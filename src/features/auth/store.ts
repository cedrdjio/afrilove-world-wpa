import { create } from "zustand";

/**
 * État de flux d'authentification (hors session Supabase) — équivalent du
 * `pendingAction` de l'`authStore` mobile. Sert de verrou de récupération :
 * une fois une session de récupération établie (lien ou code OTP recovery),
 * `pendingRecovery` force le routage vers « Nouveau mot de passe » jusqu'à ce
 * qu'il soit effectivement changé, empêchant d'entrer dans l'app entre-temps.
 * Volontairement en mémoire (comme le mobile) : réinitialisé au rechargement.
 */
interface AuthFlowState {
  pendingRecovery: boolean;
  setPendingRecovery: (value: boolean) => void;
}

export const useAuthFlowStore = create<AuthFlowState>((set) => ({
  pendingRecovery: false,
  setPendingRecovery: (pendingRecovery) => set({ pendingRecovery }),
}));
