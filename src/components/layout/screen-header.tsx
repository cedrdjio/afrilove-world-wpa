"use client";

import { type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { cn } from "@/lib/utils";
import { IconButton } from "@/components/ui/icon-button";

interface ScreenHeaderProps {
  title?: string;
  /** Par défaut : router.back(). */
  onBack?: () => void;
  right?: ReactNode;
  /** Masque le bouton retour (écrans racine). */
  hideBack?: boolean;
  className?: string;
}

/** En-tête d'écran avec bouton retour verre — port de `ScreenHeader` (mobile). */
export function ScreenHeader({
  title,
  onBack,
  right,
  hideBack = false,
  className,
}: ScreenHeaderProps) {
  const router = useRouter();

  return (
    <header
      className={cn("flex items-center justify-between px-1 pb-6", className)}
    >
      {hideBack ? (
        <span className="size-11" />
      ) : (
        <IconButton
          aria-label="Retour"
          onClick={onBack ?? (() => router.back())}
        >
          <ArrowLeft className="size-[19px]" strokeWidth={2} aria-hidden />
        </IconButton>
      )}
      {title ? (
        <h1 className="text-foreground font-display text-[20px] font-bold tracking-wide">
          {title}
        </h1>
      ) : (
        <span />
      )}
      {right ?? <span className="size-11" />}
    </header>
  );
}
