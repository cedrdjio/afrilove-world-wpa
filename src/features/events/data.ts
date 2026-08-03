export interface CommunityEvent {
  id: string;
  title: string;
  day: string;
  month: string;
  when: string;
  place: string;
  /** Dégradé de la pastille de date (Tailwind arbitrary allowed). */
  accent: string;
}

/** Sorties communautaires de démonstration (« 16 »). */
export const DEMO_EVENTS: CommunityEvent[] = [
  {
    id: "brunch",
    title: "Brunch sénégalais",
    day: "18",
    month: "JUIL",
    when: "Dim · 11h",
    place: "Le Marais",
    accent: "from-brand-400 to-brand-500",
  },
  {
    id: "cuisine",
    title: "Atelier cuisine à deux",
    day: "22",
    month: "JUIL",
    when: "Jeu · 19h",
    place: "Bastille",
    accent: "from-brand-500 to-brand-700",
  },
  {
    id: "cine",
    title: "Ciné en plein air",
    day: "27",
    month: "JUIL",
    when: "Mar · 21h",
    place: "Canal Saint-Martin",
    accent: "from-brand-400 to-brand-700",
  },
];
