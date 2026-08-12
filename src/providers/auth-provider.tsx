"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { type Session, type User } from "@supabase/supabase-js";

import { useSupabase } from "@/providers/supabase-provider";
import { type Database } from "@/types/database";

export type Profile = Database["public"]["Tables"]["profiles"]["Row"];

interface AuthContextValue {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  /** Raccourci `Boolean(user)` — consommé par les hooks de données. */
  isAuthenticated: boolean;
  /** true tant que la session initiale n'est pas résolue (évite les flashs). */
  isLoading: boolean;
  /** Recharge la ligne `profiles` (après onboarding, édition…). */
  refreshProfile: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

/**
 * Source de vérité de la session côté client : écoute `onAuthStateChange`,
 * hydrate l'utilisateur et sa ligne `profiles`. La protection des routes
 * (redirections) est faite dans `proxy.ts` (serveur) et par les gardes de
 * layout — ce provider ne fait qu'exposer l'état.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const supabase = useSupabase();
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const currentUserId = useRef<string | null>(null);

  const user = session?.user ?? null;

  const loadProfile = useCallback(
    async (userId: string | null) => {
      if (!userId) {
        setProfile(null);
        return;
      }
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .maybeSingle();
      setProfile(data ?? null);
    },
    [supabase],
  );

  useEffect(() => {
    let active = true;

    // Session initiale (getUser valide le jeton auprès du serveur Auth).
    void supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      setSession(data.session);
      currentUserId.current = data.session?.user.id ?? null;
      void loadProfile(data.session?.user.id ?? null).finally(() => {
        if (active) setIsLoading(false);
      });
    });

    // On ne fait AUCUN appel Supabase synchrone dans ce callback (risque de
    // blocage documenté) : on met à jour la session, le profil suit via l'effet.
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (!active) return;
      setSession(nextSession);
      const nextId = nextSession?.user.id ?? null;
      if (nextId !== currentUserId.current) {
        currentUserId.current = nextId;
        void loadProfile(nextId);
      }
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [supabase, loadProfile]);

  const refreshProfile = useCallback(
    () => loadProfile(currentUserId.current),
    [loadProfile],
  );

  const doSignOut = useCallback(async () => {
    await supabase.auth.signOut();
    setProfile(null);
  }, [supabase]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      session,
      profile,
      isAuthenticated: Boolean(user),
      isLoading,
      refreshProfile,
      signOut: doSignOut,
    }),
    [user, session, profile, isLoading, refreshProfile, doSignOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth doit être utilisé dans <AuthProvider>.");
  return ctx;
}
