import { type ComponentType } from "react";

import { cn } from "@/lib/utils";
import { ScreenBackground } from "@/components/layout/screen-background";
import { GlowOrb } from "@/components/layout/glow-orb";
import { GradientButton } from "@/components/ui/gradient-button";

interface SystemStateScreenProps {
  Icon: ComponentType<{ className?: string; strokeWidth?: number }>;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  loading?: boolean;
  /** Dégradé de la pastille d'icône (défaut : dégradé brand). */
  iconClassName?: string;
}

/**
 * Écran d'état système générique — port de `SystemStateScreen` (mobile).
 * Fond crème + halo, pastille d'icône en dégradé, titre display, description
 * body, et un bouton d'action optionnel.
 */
export function SystemStateScreen({
  Icon,
  title,
  description,
  actionLabel,
  onAction,
  loading = false,
  iconClassName,
}: SystemStateScreenProps) {
  return (
    <div className="relative flex min-h-dvh flex-col">
      <ScreenBackground theme="cream" halos={false}>
        <GlowOrb
          size={230}
          color="rgba(106,79,192,0.09)"
          top={-50}
          right={-50}
          duration={9.5}
        />
      </ScreenBackground>

      <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-8">
        <span
          className={cn(
            "gradient-signature shadow-brand mb-7 grid size-[92px] place-items-center rounded-[28px] text-white",
            iconClassName,
          )}
        >
          <Icon className="size-10" strokeWidth={1.6} />
        </span>

        <h1 className="font-display text-foreground mb-2.5 text-center text-[26px] leading-none">
          {title}
        </h1>
        <p className="text-muted-foreground mb-8 max-w-sm text-center text-[13px] leading-[20px]">
          {description}
        </p>

        {actionLabel ? (
          <GradientButton
            label={actionLabel}
            loading={loading}
            onClick={onAction}
            className="max-w-xs"
          />
        ) : null}
      </div>
    </div>
  );
}
