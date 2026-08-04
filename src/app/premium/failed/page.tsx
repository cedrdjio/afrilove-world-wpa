"use client";

import { useRouter } from "next/navigation";
import { X } from "lucide-react";

import { ScreenBackground } from "@/components/layout/screen-background";
import { GlowOrb } from "@/components/layout/glow-orb";
import { GradientButton } from "@/components/ui/gradient-button";
import { ROUTES } from "@/constants/routes";

/** Échec de paiement — port de `PremiumFailedScreen` (mobile). */
export default function PremiumFailedPage() {
  const router = useRouter();

  return (
    <div className="relative min-h-dvh">
      <ScreenBackground theme="deep">
        <GlowOrb
          size={260}
          color="rgba(240,74,110,0.18)"
          bottom={140}
          right={-40}
          duration={9.5}
        />
      </ScreenBackground>

      <div className="relative z-10 flex min-h-dvh flex-col items-center justify-center px-8">
        <span className="mb-7 grid size-24 place-items-center rounded-full border-[1.5px] border-[#F04A6E]/30 bg-[#F04A6E]/[0.12]">
          <X className="size-10 text-[#F04A6E]" strokeWidth={1.8} aria-hidden />
        </span>

        <h1 className="font-display mb-3 text-center text-[28px] font-black text-white">
          Paiement échoué
        </h1>
        <p className="mb-10 max-w-xs text-center text-[13.5px] leading-[21px] text-white/50">
          Le paiement n&apos;a pas pu être traité. Vérifiez vos informations et
          réessayez.
        </p>

        <GradientButton
          label="Réessayer"
          onClick={() => router.back()}
          className="mb-3 w-full max-w-xs"
        />
        <button
          type="button"
          onClick={() => router.replace(ROUTES.discover)}
          className="text-[13px] font-medium text-white/40"
        >
          Plus tard
        </button>
      </div>
    </div>
  );
}
