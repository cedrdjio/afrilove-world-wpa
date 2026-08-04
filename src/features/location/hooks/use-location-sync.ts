"use client";

import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";

import { useAuth } from "@/providers/auth-provider";
import { useSupabase } from "@/providers/supabase-provider";
import {
  captureAndSaveLocation,
  touchLastActive,
} from "@/features/location/service";
import { PROFILE_QUERY_KEY } from "@/features/profile/hooks/use-profile";

const LOCATION_STALE_MS = 24 * 60 * 60 * 1000;
// « En ligne » = actif il y a moins de 5 min. Un battement toutes les 2 min
// (et à chaque retour d'onglet) garde ce compteur juste tant que l'app est
// ouverte.
const HEARTBEAT_MS = 2 * 60 * 1000;

/**
 * Monté une seule fois dans la zone connectée (shell `(app)`). Marque
 * l'utilisateur actif par battement, et rafraîchit sa position au plus une
 * fois par jour pour que la recherche de proximité reste juste — port de
 * `useLocationSync` (mobile), `AppState` remplacé par la Page Visibility API.
 */
export function useLocationSync() {
  const supabase = useSupabase();
  const { user, profile } = useAuth();
  const queryClient = useQueryClient();
  const locationSyncedForUser = useRef<string | null>(null);

  const userId = user?.id;

  // Battement d'activité : immédiat, périodique, et au retour de visibilité.
  useEffect(() => {
    if (!userId) return;

    const beat = () => {
      void touchLastActive(supabase, userId).catch(() => {});
    };
    beat();

    const interval = setInterval(beat, HEARTBEAT_MS);
    const onVisibility = () => {
      if (document.visibilityState === "visible") beat();
    };
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [userId, supabase]);

  // Rafraîchissement de la position, au plus une fois par jour.
  useEffect(() => {
    if (!userId || !profile || locationSyncedForUser.current === userId) return;
    locationSyncedForUser.current = userId;

    const lastUpdate = profile.location_updated_at
      ? new Date(profile.location_updated_at).getTime()
      : 0;
    if (Date.now() - lastUpdate > LOCATION_STALE_MS) {
      void captureAndSaveLocation(supabase, userId).then((saved) => {
        if (saved) {
          queryClient.invalidateQueries({
            queryKey: [PROFILE_QUERY_KEY, userId],
          });
        }
      });
    }
  }, [userId, profile, supabase, queryClient]);
}
