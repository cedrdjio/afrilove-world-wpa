import type { SVGProps } from "react";

/**
 * Symboles Venus / Mars vectoriels (absents de lucide-react 0.446), dessinés
 * dans le même gabarit 24×24 que Lucide pour rester cohérents. `currentColor`
 * + strokeWidth pilotables comme n'importe quelle icône Lucide.
 */

const base = {
  width: 24,
  height: 24,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

export function VenusIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <circle cx="12" cy="9" r="5" />
      <path d="M12 14v7" />
      <path d="M9 18h6" />
    </svg>
  );
}

export function MarsIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <circle cx="10" cy="14" r="5" />
      <path d="M14 10l6-6" />
      <path d="M15 4h5v5" />
    </svg>
  );
}
