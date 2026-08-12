"use client";

import { useEffect } from "react";
import { create } from "zustand";

import { db } from "@/services/supabase/browser";
import { useAuth } from "@/providers/auth-provider";

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
 * ligne. À monter une seule fois (layout applicatif) ; les écrans lisent le
 * store via `useIsOnline`. Porté depuis l'app mobile.
 */
export function usePresenceSync() {
  const { user } = useAuth();
  const setOnlineIds = usePresenceStore((s) => s.setOnlineIds);

  useEffect(() => {
    if (!user?.id) return;
    const supabase = db();

    // La présence exige un topic PARTAGÉ : en cas de remontage rapide une
    // instance du canal peut traîner ; on purge avant de re-souscrire.
    for (const existing of supabase.getChannels()) {
      if (existing.topic === "realtime:online-members") {
        supabase.removeChannel(existing).catch(() => {});
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
          channel
            .track({ online_at: new Date().toISOString() })
            .catch(() => {});
        }
      });

    return () => {
      supabase.removeChannel(channel).catch(() => {});
    };
  }, [user?.id, setOnlineIds]);
}

/** Un membre est « en ligne » s'il est présent sur le canal Realtime. */
export function useIsOnline(profileId: string | null | undefined): boolean {
  return usePresenceStore((s) =>
    profileId ? s.onlineIds.has(profileId) : false,
  );
}
