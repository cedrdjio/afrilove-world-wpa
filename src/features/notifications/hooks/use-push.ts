"use client";

import { useEffect, useRef } from "react";

import { useAuth } from "@/providers/auth-provider";
import { useSupabase } from "@/providers/supabase-provider";
import { registerDevice } from "@/features/notifications/push/service";

/**
 * Monté une fois dans la zone connectée : enregistre la souscription Web Push
 * de ce navigateur (au plus une fois par utilisateur et par session). Port de
 * `usePushSync` (mobile).
 */
export function usePushSync() {
  const supabase = useSupabase();
  const { user } = useAuth();
  const registeredForUser = useRef<string | null>(null);

  useEffect(() => {
    if (!user?.id || registeredForUser.current === user.id) return;
    registeredForUser.current = user.id;
    void registerDevice(supabase, user.id);
  }, [supabase, user?.id]);
}
