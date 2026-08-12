"use client";

import { createContext, useContext, useMemo, type ReactNode } from "react";
import { createClient } from "@/services/supabase/client";
import { db } from "@/services/supabase/browser";

/** Type du client dérivé de la factory — évite les soucis d'arité générique. */
type TypedClient = ReturnType<typeof createClient>;

const SupabaseContext = createContext<TypedClient | null>(null);

/**
 * Expose un client Supabase navigateur stable à tout l'arbre client.
 * (Aucune logique d'auth ici — Sprint 00.)
 */
export function SupabaseProvider({ children }: { children: ReactNode }) {
  // Même instance que le singleton `db()` utilisé par les services : une seule
  // socket Realtime partagée entre les composants et la couche d'accès.
  const client = useMemo(() => db(), []);
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
