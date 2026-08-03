"use client";

import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import type { ReactNode } from "react";

import { IconButton } from "@/components/ui/icon-button";
import { cn } from "@/lib/utils";

/**
 * En-tête d'écran réutilisable (DRY) : bouton retour optionnel, titre, action
 * de fin (texte ou icône). Reprend la mise en page des maquettes internes.
 */
export function PageHeader({
  title,
  subtitle,
  back = false,
  trailing,
  center = false,
  className,
}: {
  title: string;
  subtitle?: string;
  back?: boolean;
  trailing?: ReactNode;
  center?: boolean;
  className?: string;
}) {
  const router = useRouter();

  return (
    <header
      className={cn(
        "flex items-center gap-3 pt-[max(1rem,env(safe-area-inset-top))]",
        className,
      )}
    >
      {back && (
        <IconButton
          tone="glass"
          aria-label="Retour"
          onClick={() => router.back()}
        >
          <ChevronLeft className="size-6" aria-hidden />
        </IconButton>
      )}
      <div className={cn("min-w-0 flex-1", center && "text-center")}>
        <h1 className="font-display truncate text-2xl font-extrabold">
          {title}
        </h1>
        {subtitle && (
          <p className="text-muted-foreground truncate text-sm">{subtitle}</p>
        )}
      </div>
      {trailing}
    </header>
  );
}
