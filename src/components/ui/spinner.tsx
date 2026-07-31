import { cn } from "@/lib/utils";

/** Indicateur de chargement circulaire, teinte lavande par défaut. */
export function Spinner({
  className,
  label = "Chargement…",
}: {
  className?: string;
  label?: string;
}) {
  return (
    <span
      role="status"
      aria-label={label}
      className={cn(
        "border-brand-300 border-t-primary inline-block size-5 animate-spin rounded-full border-2",
        className,
      )}
    />
  );
}
