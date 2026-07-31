"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { m } from "framer-motion";
import { Compass, LogOut, UserRound } from "lucide-react";

import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { ROUTES } from "@/constants/routes";
import { useAuth } from "@/providers/auth-provider";

/**
 * Accueil authentifié (placeholder Sprint 01). Sert de destination de fin
 * d'onboarding et de garde : renvoie vers l'onboarding tant qu'il n'est pas
 * terminé. La découverte réelle (deck de profils) arrive au Sprint 02.
 */
export default function DiscoverPage() {
  const router = useRouter();
  const { user, profile, isLoading, signOut } = useAuth();

  useEffect(() => {
    if (!isLoading && profile && !profile.onboarding_completed) {
      router.replace(ROUTES.onboarding);
    }
  }, [isLoading, profile, router]);

  if (isLoading || !user || (profile && !profile.onboarding_completed)) {
    return (
      <div className="grid min-h-dvh place-items-center">
        <Spinner />
      </div>
    );
  }

  const firstName = profile?.first_name?.trim() || "vous";
  const complete = profile?.profile_completed;

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col px-6 pt-6 pb-10">
      <header className="flex items-center justify-between">
        <Logo size="sm" />
        <button
          type="button"
          onClick={() => void signOut()}
          aria-label="Se déconnecter"
          className="text-muted-foreground hover:text-foreground grid size-10 place-items-center rounded-full transition-colors"
        >
          <LogOut className="size-5" aria-hidden />
        </button>
      </header>

      <m.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
        className="flex flex-1 flex-col items-center justify-center text-center"
      >
        <span className="gradient-signature shadow-brand grid size-20 place-items-center rounded-full text-white">
          <Compass className="size-9" aria-hidden />
        </span>
        <h1 className="mt-6 text-2xl font-extrabold tracking-tight">
          Bienvenue, {firstName} 💜
        </h1>
        <p className="text-muted-foreground mt-3 text-[0.95rem] leading-relaxed text-pretty">
          Votre compte est prêt. La découverte de profils arrive très bientôt —
          en attendant, complétez votre profil pour être visible.
        </p>

        {!complete ? (
          <div className="border-border bg-card mt-8 w-full rounded-[var(--radius-lg)] border p-4 text-left">
            <p className="text-foreground text-sm font-semibold">
              Profil incomplet
            </p>
            <p className="text-muted-foreground mt-1 text-xs leading-relaxed">
              Ajoutez au moins 2 photos pour apparaître dans la découverte.
            </p>
          </div>
        ) : null}
      </m.div>

      <Button
        size="lg"
        block
        variant="secondary"
        className="mt-6"
        onClick={() => router.push(ROUTES.onboarding)}
      >
        <UserRound className="size-5" aria-hidden />
        Mon profil
      </Button>
    </div>
  );
}
