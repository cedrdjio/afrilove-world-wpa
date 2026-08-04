"use client";

import { useEffect } from "react";
import { create } from "zustand";

import { useAuth } from "@/providers/auth-provider";
import { useSupabase } from "@/providers/supabase-provider";

interface PresenceState {
  /** Ids des membres actuellement connectés (canal Presence Realtime). */
  onlineIds: Set<string>;
  setOnlineIds: (ids: Set<string>) => void;
}

export const usePresenceStore = create<PresenceState>((set) => ({
  onlineIds: new Set(),
  setOnlineIds: (onlineIds) => set({ onlineIds }),
}));

/**
 * Rejoint le canal Presence partagé « online-members » : chaque onglet connecté
 * s'y déclare (key = user id) et reçoit en temps réel la liste des membres en
 * ligne. Monté une seule fois dans le shell `(app)` — les écrans lisent le
 * store. Port de `usePresenceSync` (mobile).
 */
export function usePresenceSync() {
  const supabase = useSupabase();
  const { user } = useAuth();
  const setOnlineIds = usePresenceStore((s) => s.setOnlineIds);

  useEffect(() => {
    if (!user?.id) return;

    // La présence exige un topic PARTAGÉ (tout le monde dans la même salle) :
    // en cas de remontage rapide, purger l'instance encore ouverte évite un
    // crash à l'ajout des callbacks après subscribe().
    for (const existing of supabase.getChannels()) {
      if (existing.topic === "realtime:online-members") {
        void supabase.removeChannel(existing);
      }
    }

    const channel = supabase.channel("online-members", {
      config: { presence: { key: user.id } },
    });

    channel
      .on("presence", { event: "sync" }, () => {
        setOnlineIds(new Set(Object.keys(channel.presenceState())));
      })
      .subscribe((status) => {
        if (status === "SUBSCRIBED") {
          void channel.track({ online_at: new Date().toISOString() });
        }
      });

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [user?.id, setOnlineIds, supabase]);
}

/** Un membre est « en ligne » s'il est présent sur le canal Realtime. */
export function useIsOnline(profileId: string | null | undefined): boolean {
  return usePresenceStore((s) =>
    profileId ? s.onlineIds.has(profileId) : false,
  );
}
