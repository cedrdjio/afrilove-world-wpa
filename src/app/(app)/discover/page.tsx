"use client";

import { useRouter } from "next/navigation";
import { m } from "framer-motion";
import { Compass, LogOut, UserRound } from "lucide-react";

import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes";
import { useAuth } from "@/providers/auth-provider";

/**
 * Onglet Découvrir (placeholder Jalon 3). La garde du shell `(app)` assure
 * déjà session + onboarding + profil complet + compte actif : cette page peut
 * donc supposer un profil valide. Le vrai deck de profils (swipe) arrive au
 * Jalon 8 ; ici on pose l'en-tête et l'ossature de l'onglet.
 */
export default function DiscoverPage() {
  const router = useRouter();
  const { profile, signOut } = useAuth();

  const firstName = profile?.first_name?.trim() || "vous";

  return (
    <div className="flex flex-1 flex-col px-6 pt-6">
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
          Votre profil est prêt. La découverte de profils (swipe) arrive très
          bientôt — la navigation ci-dessous vous emmène partout.
        </p>

        <Button
          size="lg"
          variant="secondary"
          className="mt-8"
          onClick={() => router.push(ROUTES.profile)}
        >
          <UserRound className="size-5" aria-hidden />
          Mon profil
        </Button>
      </m.div>
    </div>
  );
}
