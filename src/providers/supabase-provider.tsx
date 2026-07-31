"use client";

import { createContext, useContext, useMemo, type ReactNode } from "react";
import { createClient } from "@/services/supabase/client";

/** Type du client dérivé de la factory — évite les soucis d'arité générique. */
type TypedClient = ReturnType<typeof createClient>;

const SupabaseContext = createContext<TypedClient | null>(null);

/**
 * Expose un client Supabase navigateur stable à tout l'arbre client.
 * (Aucune logique d'auth ici — Sprint 00.)
 */
export function SupabaseProvider({ children }: { children: ReactNode }) {
  const client = useMemo(() => createClient(), []);
  return (
    <SupabaseContext.Provider value={client}>
      {children}
    </SupabaseContext.Provider>
  );
}

export function useSupabase(): TypedClient {
  const client = useContext(SupabaseContext);
  if (!client) {
    throw new Error("useSupabase doit être utilisé dans <SupabaseProvider>.");
  }
  return client;
}
