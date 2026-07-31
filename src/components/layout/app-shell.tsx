import { type ReactNode } from "react";

import { cn } from "@/lib/utils";

/**
 * Cadre applicatif mobile-first : largeur contenue, centrée, pensée pour
 * l'iPhone (≤ 448px) et gracieuse sur tablette/desktop. Les écrans métier
 * viendront s'insérer ici au fil des sprints.
 */
export function AppShell({
  children,
  className,
  withBottomNavSpace = false,
}: {
  children: ReactNode;
  className?: string;
  /** Réserve l'espace de la barre de navigation flottante. */
  withBottomNavSpace?: boolean;
}) {
  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col">
      <main
        className={cn(
          "flex flex-1 flex-col",
          withBottomNavSpace && "pb-24",
          className,
        )}
      >
        {children}
      </main>
    </div>
  );
}
