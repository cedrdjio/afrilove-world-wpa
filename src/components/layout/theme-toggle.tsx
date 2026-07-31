"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

import { Switch } from "@/components/ui/switch";
import { useHaptics } from "@/hooks/use-haptics";
import { useMounted } from "@/hooks/use-mounted";

/**
 * Bascule clair/sombre « Fond sombre » (comme dans le header du mockup).
 * SSR-safe : n'affiche l'état réel qu'après montage pour éviter les flashs.
 */
export function ThemeToggle({ className }: { className?: string }) {
  const { resolvedTheme, setTheme } = useTheme();
  const mounted = useMounted();
  const haptic = useHaptics();

  const isDark = mounted && resolvedTheme === "dark";

  return (
    <label
      className={`glass inline-flex cursor-pointer items-center gap-2 rounded-[var(--radius-pill)] px-3 py-1.5 text-sm ${className ?? ""}`}
    >
      {isDark ? (
        <Moon className="text-brand-400 size-4" aria-hidden />
      ) : (
        <Sun className="text-warning size-4" aria-hidden />
      )}
      <span className="text-foreground font-medium">Fond sombre</span>
      <Switch
        checked={isDark}
        onCheckedChange={(checked) => {
          haptic("light");
          setTheme(checked ? "dark" : "light");
        }}
        aria-label="Activer le fond sombre"
      />
    </label>
  );
}
