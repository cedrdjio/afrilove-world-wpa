"use client";

import Link from "next/link";
import { BadgeCheck, ChevronRight, Clock } from "lucide-react";

import { ROUTES } from "@/constants/routes";
import { useAuth } from "@/providers/auth-provider";
import { cn } from "@/lib/utils";

import { useKycStatus } from "../hooks";

/**
 * Bannière de vérification (KYC) affichée en permanence sur les écrans
 * principaux tant que le compte n'est pas vérifié. Elle disparaît une fois le
 * compte vérifié ; pendant l'examen, elle bascule sur un état « en cours »
 * informatif. Objectif : inciter constamment l'utilisateur à se faire vérifier.
 */
export function VerificationBanner({ className }: { className?: string }) {
  const { isAuthenticated, profile } = useAuth();
  const { data: kyc } = useKycStatus();

  // Rien à afficher : hors session ou déjà vérifié.
  if (!isAuthenticated || profile?.is_verified) return null;

  const pending = kyc?.status === "pending";

  if (pending) {
    return (
      <div
        className={cn(
          "border-warning/40 bg-warning/10 text-foreground flex items-center gap-3 rounded-[var(--radius-lg)] border px-4 py-3",
          className,
        )}
      >
        <Clock className="text-warning size-5 shrink-0" aria-hidden />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold">Vérification en cours</p>
          <p className="text-muted-foreground text-xs">
            Ton identité est en cours d&apos;examen.
          </p>
        </div>
      </div>
    );
  }

  return (
    <Link
      href={ROUTES.verify}
      className={cn(
        "gradient-signature shadow-brand flex items-center gap-3 rounded-[var(--radius-lg)] px-4 py-3 text-white active:scale-[0.99]",
        className,
      )}
    >
      <span className="grid size-9 shrink-0 place-items-center rounded-full bg-white/20">
        <BadgeCheck className="size-5" aria-hidden />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-extrabold">Fais-toi vérifier</p>
        <p className="text-xs text-white/85">
          Un badge vérifié inspire confiance et booste tes rencontres.
        </p>
      </div>
      <ChevronRight className="size-5 shrink-0" aria-hidden />
    </Link>
  );
}
