"use client";

import { useRouter } from "next/navigation";
import { Lock, X } from "lucide-react";

import { ScreenBackground } from "@/components/layout/screen-background";
import { GlowOrb } from "@/components/layout/glow-orb";
import { GradientButton } from "@/components/ui/gradient-button";
import { ROUTES } from "@/constants/routes";

/** Fonctionnalité verrouillée — port de `PremiumLockedScreen` (mobile). */
export default function PremiumLockedPage() {
  const router = useRouter();

  return (
    <div className="relative min-h-dvh">
      <ScreenBackground theme="deep">
        <GlowOrb
          size={280}
          color="rgba(155,126,222,0.2)"
          top={100}
          left={-50}
          duration={9}
        />
      </ScreenBackground>

      <div className="relative z-10 flex min-h-dvh flex-col items-center justify-center px-8">
        <button
          type="button"
          onClick={() => router.back()}
          aria-label="Fermer"
          className="absolute top-16 right-6 grid size-9 place-items-center rounded-full border border-white/20 bg-white/[0.12] text-white/55"
        >
          <X className="size-4" aria-hidden />
        </button>

        <span className="gradient-signature mb-[26px] grid size-[88px] place-items-center rounded-[26px] shadow-[0_12px_26px_rgba(155,126,222,0.4)]">
          <Lock
            className="size-[38px] text-white"
            strokeWidth={1.8}
            aria-hidden
          />
        </span>

        <h1 className="font-display mb-3 text-center text-[28px] font-black text-white">
          Fonctionnalité
          <br />
          Premium
        </h1>
        <p className="mb-10 max-w-xs text-center text-[13.5px] leading-[21px] text-white/50">
          Découvrez qui vous a déjà aimé(e) et bien plus encore avec AfriLove
          World Premium.
        </p>

        <GradientButton
          label="Débloquer Premium"
          onClick={() => router.replace(ROUTES.premium)}
          className="mb-3 w-full max-w-xs"
        />
        <button
          type="button"
          onClick={() => router.back()}
          className="text-[13px] font-medium text-white/40"
        >
          Pas maintenant
        </button>
      </div>
    </div>
  );
}
