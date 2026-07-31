"use client";

import { createContext, useContext, type ReactNode } from "react";
import { type User } from "@supabase/supabase-js";

/**
 * Emplacement du contexte d'authentification.
 *
 * Sprint 00 : volontairement inerte (aucune logique de session, de login ou
 * de routes protégées — c'est le périmètre du Sprint 01). Le provider existe
 * pour que l'arbre soit déjà câblé et que l'ajout de l'auth ne demande aucun
 * refactoring : il suffira de peupler `user`/`isLoading` ici.
 */
interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  isLoading: false,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const value: AuthContextValue = { user: null, isLoading: false };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  return useContext(AuthContext);
}
