"use client";

import { useEffect, type ReactNode } from "react";

import { useSettingsStore } from "@/store/settings-store";

/**
 * Applique les préférences persistées au document dès l'hydratation
 * (langue <html lang>). Le store reste la source de vérité ; ce provider
 * se contente de synchroniser les effets de bord DOM.
 */
export function SettingsProvider({ children }: { children: ReactNode }) {
  const locale = useSettingsStore((s) => s.locale);
  const hasHydrated = useSettingsStore((s) => s.hasHydrated);

  useEffect(() => {
    if (hasHydrated) {
      document.documentElement.lang = locale;
    }
  }, [locale, hasHydrated]);

  return <>{children}</>;
}
