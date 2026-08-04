import { type ReactNode } from "react";

import { cn } from "@/lib/utils";
import { GlowOrb } from "@/components/layout/glow-orb";

interface ScreenBackgroundProps {
  /** 'cream' : dégradé lavande clair · 'deep' : nuit aubergine (écrans immersifs). */
  theme?: "cream" | "deep";
  /** Halos lumineux Fluent intégrés (actifs par défaut). */
  halos?: boolean;
  className?: string;
  children?: ReactNode;
}

/**
 * Surface de fond plein écran — port de `ScreenBackground` (mobile). Dégradé
 * lavande + halos côté clair, nuit aubergine côté sombre. Le thème est piloté
 * par la classe `.dark` (next-themes), donc le fond « cream » bascule seul en
 * nuit quand le thème sombre est actif.
 */
export function ScreenBackground({
  theme = "cream",
  halos = true,
  className,
  children,
}: ScreenBackgroundProps) {
  const deep = theme === "deep";

  return (
    <div className={cn("absolute inset-0 overflow-hidden", className)}>
      {/* Dégradé de base — clair par défaut, nuit en mode sombre (ou si deep). */}
      <div
        className={cn(
          "absolute inset-0",
          deep
            ? "bg-[linear-gradient(150deg,#4A2C7F_0%,#3A2B4F_45%,#180F2A_100%)]"
            : "bg-[linear-gradient(150deg,#FBF7FF_0%,#F1E8FC_40%,#E3D3F6_75%,#D6C3EF_100%)] dark:bg-[linear-gradient(150deg,#221833_0%,#171022_50%,#100B18_100%)]",
        )}
      />
      {halos ? (
        <>
          <GlowOrb
            size={340}
            color={deep ? "rgba(155,126,222,0.20)" : "rgba(139,105,214,0.16)"}
            top={-100}
            right={-90}
            duration={10}
          />
          <GlowOrb
            size={280}
            color={deep ? "rgba(139,105,214,0.14)" : "rgba(155,126,222,0.13)"}
            bottom={-80}
            left={-80}
            duration={12}
            delay={1.2}
          />
        </>
      ) : null}
      {children}
    </div>
  );
}
