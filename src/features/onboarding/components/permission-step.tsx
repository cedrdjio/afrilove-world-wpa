"use client";

import { type ReactNode } from "react";
import { type LucideIcon } from "lucide-react";

import { GradientButton } from "@/components/ui/gradient-button";
import { GhostButton } from "@/components/ui/ghost-button";

interface PermissionStepProps {
  Icon: LucideIcon;
  title: ReactNode;
  description: string;
  primaryLabel: string;
  loading?: boolean;
  onPrimary: () => void;
  onSkip: () => void;
  /** Contenu optionnel sous la description (ex. saisie manuelle repliable). */
  children?: ReactNode;
}

/**
 * Écran de permission de l'onboarding — port de `PermissionScreen` (mobile) :
 * badge dégradé centré, titre, description, action principale + « Plus tard ».
 * Non bloquant : les deux boutons font avancer le parcours.
 */
export function PermissionStep({
  Icon,
  title,
  description,
  primaryLabel,
  loading = false,
  onPrimary,
  onSkip,
  children,
}: PermissionStepProps) {
  return (
    <div className="flex flex-1 flex-col">
      <div className="flex flex-1 flex-col items-center justify-center px-2 text-center">
        <span className="gradient-signature shadow-brand mb-7 grid size-[100px] place-items-center rounded-[30px] text-white">
          <Icon className="size-11" strokeWidth={1.6} aria-hidden />
        </span>
        <h2 className="font-display text-foreground mb-3 text-[26px] leading-[1.05] text-balance">
          {title}
        </h2>
        <p className="text-muted-foreground max-w-sm text-[13.5px] leading-[21px]">
          {description}
        </p>
        {children ? <div className="mt-7 w-full">{children}</div> : null}
      </div>

      <div className="flex flex-col gap-3 pt-4">
        <GradientButton
          label={primaryLabel}
          loading={loading}
          onClick={onPrimary}
        />
        <GhostButton label="Plus tard" tone="onLight" onClick={onSkip} />
      </div>
    </div>
  );
}
