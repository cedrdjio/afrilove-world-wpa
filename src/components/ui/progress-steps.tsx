import { cn } from "@/lib/utils";

interface ProgressStepsProps {
  total: number;
  /** 1-indexé — les segments <= current sont remplis du dégradé signature. */
  current: number;
  className?: string;
}

/** Fil d'avancement segmenté — port de `ProgressSteps` (mobile, onboarding/KYC). */
export function ProgressSteps({
  total,
  current,
  className,
}: ProgressStepsProps) {
  return (
    <div className={cn("flex items-center gap-1.5", className)} aria-hidden>
      {Array.from({ length: total }).map((_, i) => (
        <span
          key={i}
          className={cn(
            "h-1 w-7 rounded-full transition-colors",
            i < current ? "gradient-signature" : "bg-foreground/10",
          )}
        />
      ))}
    </div>
  );
}
