import { WifiOff } from "lucide-react";

import { Logo } from "@/components/brand/logo";
import { AppShell } from "@/components/layout/app-shell";

export const metadata = {
  title: "Hors ligne",
};

/**
 * Page de repli servie par le Service Worker quand une route n'est pas en
 * cache et que l'appareil est hors ligne.
 */
export default function OfflinePage() {
  return (
    <AppShell className="items-center justify-center gap-6 px-8 text-center">
      <Logo size="lg" />
      <div className="glass grid size-16 place-items-center rounded-full">
        <WifiOff className="text-primary size-7" aria-hidden />
      </div>
      <div>
        <h1 className="text-xl font-extrabold">Vous êtes hors ligne</h1>
        <p className="text-muted-foreground mt-2 text-sm">
          Reconnectez-vous pour retrouver AfroLove World. Les pages déjà
          visitées restent accessibles.
        </p>
      </div>
    </AppShell>
  );
}
