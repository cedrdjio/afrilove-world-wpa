"use client";

import { useRouter } from "next/navigation";
import { Sparkles } from "lucide-react";

import { ROUTES } from "@/constants/routes";
import { ScreenBackground } from "@/components/layout/screen-background";
import { GlowOrb } from "@/components/layout/glow-orb";
import { GradientButton } from "@/components/ui/gradient-button";
import { GhostButton } from "@/components/ui/ghost-button";
import { useAuth } from "@/providers/auth-provider";

/**
 * Finalisation de profil (placeholder Jalon 3). Cible de redirection de la
 * garde quand `onboarding_completed` est vrai mais `profile_completed` faux —
 * miroir de l'écran `profile-completion` mobile. Le formulaire complet (photos,
 * bio, préférences) sera implémenté au Jalon 6 ; on pose ici l'écran et sa
 * route pour que la garde ait une destination valide.
 */
export default function ProfileCompletionPage() {
  const router = useRouter();
  const { profile, signOut } = useAuth();

  const firstName = profile?.first_name?.trim();

  return (
    <div className="relative flex min-h-dvh flex-col">
      <ScreenBackground theme="cream" halos={false}>
        <GlowOrb
          size={260}
          color="rgba(139,105,214,0.12)"
          top={-60}
          right={-60}
          duration={9}
        />
      </ScreenBackground>

      <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-8 text-center">
        <span className="gradient-signature shadow-brand mb-7 grid size-[92px] place-items-center rounded-[28px] text-white">
          <Sparkles className="size-10" strokeWidth={1.6} aria-hidden />
        </span>
        <h1 className="font-display text-foreground mb-2.5 text-[26px] leading-tight">
          {firstName ? `Plus qu'une étape, ${firstName}` : "Plus qu'une étape"}
        </h1>
        <p className="text-muted-foreground mb-8 max-w-sm text-[13px] leading-[20px]">
          Ajoutez vos photos et complétez votre profil pour apparaître dans la
          découverte. Cette dernière étape arrive très bientôt.
        </p>

        <GradientButton
          label="Continuer"
          className="mb-3 max-w-xs"
          onClick={() => router.push(ROUTES.editProfile)}
        />
        <GhostButton
          label="Se déconnecter"
          tone="onLight"
          block={false}
          onClick={() => void signOut()}
        />
      </div>
    </div>
  );
}
