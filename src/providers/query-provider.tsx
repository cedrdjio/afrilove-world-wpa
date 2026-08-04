"use client";

import {
  MutationCache,
  QueryCache,
  QueryClient,
  QueryClientProvider,
  isServer,
  onlineManager,
} from "@tanstack/react-query";
import { type ReactNode } from "react";

import { createClient } from "@/services/supabase/client";
import { mapToAppError } from "@/lib/errors";

/**
 * TanStack Query — configuration alignée sur l'app mobile (source de vérité) :
 * cache généreux pour que naviguer entre les onglets (Découverte ↔ Messages…)
 * réutilise les données en mémoire au lieu de refaire chaque appel. Les
 * mutations invalident ce qui doit l'être.
 *
 * Toute requête/mutation touchant un refresh token expiré/invalide force une
 * déconnexion depuis un seul endroit : chaque garde d'auth la détecte et
 * redirige vers l'accueil, plutôt que d'afficher des données périmées.
 */
function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: 1,
        staleTime: 2 * 60_000,
        gcTime: 15 * 60_000,
        refetchOnWindowFocus: false,
      },
    },
    queryCache: new QueryCache({
      onError: (error) => {
        if (mapToAppError(error).kind === "session_expired") {
          createClient()
            .auth.signOut()
            .catch(() => {});
        }
      },
    }),
    // MutationCache a son propre onError — QueryCache.onError ne couvre que
    // les queries.
    mutationCache: new MutationCache({
      onError: (error) => {
        if (mapToAppError(error).kind === "session_expired") {
          createClient()
            .auth.signOut()
            .catch(() => {});
        }
      },
    }),
  });
}

// Branche la détection online/offline de React Query sur l'état réseau réel du
// navigateur (équivalent web du câblage NetInfo mobile) : les requêtes se
// mettent en pause hors-ligne et repartent au retour de la connexion.
if (!isServer && typeof window !== "undefined") {
  onlineManager.setEventListener((setOnline) => {
    const update = () => setOnline(navigator.onLine);
    window.addEventListener("online", update);
    window.addEventListener("offline", update);
    return () => {
      window.removeEventListener("online", update);
      window.removeEventListener("offline", update);
    };
  });
}

let browserQueryClient: QueryClient | undefined;

function getQueryClient() {
  if (isServer) return makeQueryClient();
  if (!browserQueryClient) browserQueryClient = makeQueryClient();
  return browserQueryClient;
}

export function QueryProvider({ children }: { children: ReactNode }) {
  const queryClient = getQueryClient();
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
