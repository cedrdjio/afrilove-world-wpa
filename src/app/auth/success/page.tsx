"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { m } from "framer-motion";
import { Check } from "lucide-react";

import { ROUTES } from "@/constants/routes";
import { ScreenBackground } from "@/components/layout/screen-background";
import { GlowOrb } from "@/components/layout/glow-orb";
import { GradientButton } from "@/components/ui/gradient-button";

/**
 * Écran de succès d'authentification — port d'`AuthSuccessScreen` (mobile).
 * `context=reset` après un changement de mot de passe ; défaut = vérification
 * d'e-mail à l'inscription. « Continuer » repasse par la résolution, qui route
 * au bon endroit (app si l'onboarding est fait, onboarding sinon).
 */
export default function AuthSuccessPage() {
  const router = useRouter();
  const params = useSearchParams();
  const isReset = params.get("context") === "reset";

  return (
    <div className="relative flex min-h-dvh flex-col">
      <ScreenBackground theme="deep" halos={false}>
        <GlowOrb
          size={280}
          color="rgba(62,155,95,0.16)"
          top={120}
          left={-40}
          duration={9}
        />
        <GlowOrb
          size={220}
          color="rgba(106,79,192,0.18)"
          bottom={160}
          right={-30}
          duration={11}
          delay={1.2}
        />
      </ScreenBackground>

      <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-8">
        <m.span
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.15, duration: 0.38, ease: [0.23, 1, 0.32, 1] }}
          className="gradient-signature mb-7 grid size-24 place-items-center rounded-full text-white shadow-[0_14px_30px_rgba(106,79,192,0.45)]"
        >
          <Check className="size-11" strokeWidth={2.6} aria-hidden />
        </m.span>

        <h1 className="font-display mb-3 text-center text-[32px] font-extrabold text-white">
          {isReset ? "Mot de passe mis à jour !" : "Compte vérifié !"}
        </h1>
        <p className="mb-10 max-w-sm text-center text-[13.5px] leading-[21px] whitespace-pre-line text-white/50">
          {isReset
            ? "Votre nouveau mot de passe est actif.\nVous pouvez reprendre vos rencontres."
            : "Bienvenue dans la communauté AfriLove World.\nConfigurons votre profil."}
        </p>

        <GradientButton
          label="Continuer"
          className="max-w-xs"
          onClick={() => router.replace(ROUTES.authResolving)}
        />
      </div>
    </div>
  );
}
