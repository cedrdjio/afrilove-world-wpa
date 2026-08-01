"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

import { cn } from "@/lib/utils";
import { useHaptics } from "@/hooks/use-haptics";
import { useMounted } from "@/hooks/use-mounted";

/**
 * Bascule clair/sombre compacte : un petit bouton icône (soleil/lune),
 * comme dans le header du mockup. SSR-safe (état réel après montage).
 */
export function ThemeToggle({ className }: { className?: string }) {
  const { resolvedTheme, setTheme } = useTheme();
  const mounted = useMounted();
  const haptic = useHaptics();

  const isDark = mounted && resolvedTheme === "dark";

  return (
    <button
      type="button"
      onClick={() => {
        haptic("light");
        setTheme(isDark ? "light" : "dark");
      }}
      aria-label={isDark ? "Passer en mode clair" : "Passer en mode sombre"}
      aria-pressed={isDark}
      className={cn(
        "border-border/60 bg-card/60 text-foreground hover:bg-muted focus-visible:ring-ring grid size-10 place-items-center rounded-full border backdrop-blur transition-colors focus-visible:ring-2 focus-visible:outline-none",
        className,
      )}
    >
      {isDark ? (
        <Moon className="text-brand-300 size-[18px]" aria-hidden />
      ) : (
        <Sun className="text-warning size-[18px]" aria-hidden />
      )}
    </button>
  );
}
