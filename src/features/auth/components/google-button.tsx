"use client";

import { useState } from "react";
import { toast } from "sonner";

import { useHaptics } from "@/hooks/use-haptics";
import { useSupabase } from "@/providers/supabase-provider";
import { signInWithGoogle } from "../service";

/** Logo Google multicolore (inline pour respecter la CSP, aucune requête). */
function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-5" aria-hidden>
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1Z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23Z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84Z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1A11 11 0 0 0 2.18 7.06l3.66 2.84C6.71 7.3 9.14 5.38 12 5.38Z"
      />
    </svg>
  );
}

/**
 * Bouton « Continuer avec Google » partagé par connexion et inscription.
 * `next` cible la destination post-connexion (les gardes filtrent onboarding).
 */
export function GoogleButton({ next }: { next?: string }) {
  const supabase = useSupabase();
  const haptic = useHaptics();
  const [pending, setPending] = useState(false);

  async function handleClick() {
    setPending(true);
    haptic("light");
    const { error } = await signInWithGoogle(supabase, next);
    if (error) {
      setPending(false);
      haptic("error");
      toast.error("Connexion Google impossible. Réessayez.");
    }
    // En cas de succès, le navigateur est redirigé vers Google : rien à faire.
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={pending}
      className="border-input bg-card hover:bg-muted flex h-12 w-full items-center justify-center gap-3 rounded-[var(--radius-pill)] border text-sm font-bold transition-colors disabled:opacity-60"
    >
      <GoogleIcon />
      {pending ? "Redirection…" : "Continuer avec Google"}
    </button>
  );
}
