"use client";

import { createContext, useContext, useMemo, type ReactNode } from "react";
import { type SupabaseClient } from "@supabase/supabase-js";

import { createClient } from "@/services/supabase/client";

const SupabaseContext = createContext<SupabaseClient | null>(null);

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

export function useSupabase(): SupabaseClient {
  const client = useContext(SupabaseContext);
  if (!client) {
    throw new Error("useSupabase doit être utilisé dans <SupabaseProvider>.");
  }
  return client;
}
