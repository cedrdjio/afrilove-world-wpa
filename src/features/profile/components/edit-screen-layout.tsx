"use client";

import { type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { ScreenBackground } from "@/components/layout/screen-background";
import { GlowOrb } from "@/components/layout/glow-orb";
import { GradientButton } from "@/components/ui/gradient-button";

interface EditScreenLayoutProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  onSave: () => void;
  saveLabel?: string;
  saveDisabled?: boolean;
  saving?: boolean;
}

/**
 * Chrome commun des écrans d'édition — port de `EditScreenLayout` : fond crème
 * + halo, en-tête (retour + titre), contenu défilant, bouton d'enregistrement
 * dégradé en pied. Page immersive (hors shell à onglets).
 */
export function EditScreenLayout({
  title,
  subtitle,
  children,
  onSave,
  saveLabel = "Enregistrer",
  saveDisabled = false,
  saving = false,
}: EditScreenLayoutProps) {
  const router = useRouter();

  return (
    <div className="relative flex min-h-dvh flex-col">
      <ScreenBackground theme="cream">
        <GlowOrb
          size={230}
          color="rgba(106,79,192,0.1)"
          top={-50}
          right={-50}
          duration={9.5}
        />
      </ScreenBackground>

      <div className="relative z-10 mx-auto flex min-h-dvh w-full max-w-md flex-1 flex-col px-6 pt-8 pb-7">
        <header className="mb-6 flex items-center justify-between">
          <button
            type="button"
            onClick={() => router.back()}
            aria-label="Retour"
            className="border-border/60 bg-card/60 text-foreground hover:bg-card grid size-11 place-items-center rounded-full border transition-colors"
          >
            <ArrowLeft className="size-5" strokeWidth={2} aria-hidden />
          </button>
          <h1 className="font-display text-foreground text-[20px]">{title}</h1>
          <span className="size-11" aria-hidden />
        </header>

        {subtitle ? (
          <p className="text-muted-foreground mb-5 text-[13px] leading-relaxed">
            {subtitle}
          </p>
        ) : null}

        <div className="-mx-1 flex-1 overflow-y-auto px-1">{children}</div>

        <GradientButton
          label={saveLabel}
          className="mt-4"
          disabled={saveDisabled}
          loading={saving}
          onClick={onSave}
        />
      </div>
    </div>
  );
}
