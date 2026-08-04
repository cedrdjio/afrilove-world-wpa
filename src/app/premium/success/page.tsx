"use client";

import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { m } from "framer-motion";
import { Check } from "lucide-react";

import { ScreenBackground } from "@/components/layout/screen-background";
import { GlowOrb } from "@/components/layout/glow-orb";
import { GradientButton } from "@/components/ui/gradient-button";
import { ROUTES } from "@/constants/routes";

function SuccessContent() {
  const router = useRouter();
  const plan = useSearchParams().get("plan");

  return (
    <div className="relative min-h-dvh">
      <ScreenBackground theme="deep">
        <GlowOrb
          size={280}
          color="rgba(155,126,222,0.2)"
          top={110}
          left={-40}
          duration={9}
        />
      </ScreenBackground>

      <div className="relative z-10 flex min-h-dvh flex-col items-center justify-center px-8">
        <m.span
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.15, duration: 0.38, ease: "easeOut" }}
          className="gradient-signature mb-7 grid size-24 place-items-center rounded-full shadow-[0_14px_30px_rgba(155,126,222,0.45)]"
        >
          <Check className="size-11 text-white" strokeWidth={2.6} aria-hidden />
        </m.span>

        <h1 className="font-display mb-3 text-center text-[30px] font-black text-white">
          Bienvenue dans
          <br />
          Premium !
        </h1>
        <p className="mb-10 max-w-xs text-center text-[13.5px] leading-[21px] text-white/50">
          {plan ? `Votre forfait "${plan}" est activé. ` : ""}Profitez de tous
          les avantages dès maintenant.
        </p>

        <GradientButton
          label="Découvrir l'application"
          onClick={() => router.replace(ROUTES.discover)}
          className="w-full max-w-xs"
        />
      </div>
    </div>
  );
}

/** Succès de paiement — port de `PremiumSuccessScreen` (mobile). */
export default function PremiumSuccessPage() {
  return (
    <Suspense fallback={null}>
      <SuccessContent />
    </Suspense>
  );
}
