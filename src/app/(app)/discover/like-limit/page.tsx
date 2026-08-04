"use client";

import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Clock, Heart, X } from "lucide-react";
import { toast } from "sonner";

import { ScreenBackground } from "@/components/layout/screen-background";
import { GlowOrb } from "@/components/layout/glow-orb";
import { GradientButton } from "@/components/ui/gradient-button";

/** Le plafond DB se réinitialise à minuit local — on affiche le vrai reste. */
function timeUntilMidnight(): string {
  const now = new Date();
  const midnight = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() + 1,
  );
  const minutes = Math.max(
    1,
    Math.round((midnight.getTime() - now.getTime()) / 60000),
  );
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return h > 0 ? `${h}h ${String(m).padStart(2, "0")}min` : `${m} min`;
}

function LikeLimitContent() {
  const router = useRouter();
  const params = useSearchParams();
  const isFavorites = params.get("reason") === "favorites";

  return (
    <div className="fixed inset-0 z-50 flex flex-col">
      <ScreenBackground theme="deep" halos={false}>
        <GlowOrb
          size={260}
          color="rgba(106,79,192,0.2)"
          bottom={140}
          right={-40}
          duration={9.5}
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

        <span className="gradient-signature mb-[26px] grid size-[88px] place-items-center rounded-full text-white shadow-[0_12px_26px_rgba(106,79,192,0.4)]">
          {isFavorites ? (
            <Heart className="size-9" strokeWidth={1.8} aria-hidden />
          ) : (
            <Clock className="size-9" strokeWidth={1.8} aria-hidden />
          )}
        </span>

        <h1 className="font-display mb-3 text-center text-[28px] font-black text-white">
          Limite quotidienne
          <br />
          atteinte
        </h1>
        <p className="mb-2 max-w-xs text-center text-[13.5px] leading-[21px] text-white/50">
          Vous avez utilisé tous vos likes gratuits pour aujourd&apos;hui.
        </p>
        <p className="font-display mb-10 text-[12px] font-semibold text-[#D99B2B]">
          Réinitialisation dans {timeUntilMidnight()}
        </p>

        <GradientButton
          label="Voir les forfaits"
          className="mb-3 w-full"
          onClick={() =>
            toast("Premium arrive bientôt", {
              description: "Les forfaits se débloquent au Jalon 11.",
            })
          }
        />
        <button
          type="button"
          onClick={() => router.back()}
          className="text-[13px] font-medium text-white/40"
        >
          {isFavorites ? "Continuer sans forfait" : "Revenir demain"}
        </button>
      </div>
    </div>
  );
}

export default function DailyLikeLimitPage() {
  return (
    <Suspense fallback={null}>
      <LikeLimitContent />
    </Suspense>
  );
}
