import {
  BookOpen,
  Briefcase,
  Clapperboard,
  Cpu,
  Dumbbell,
  Gamepad2,
  Globe,
  HeartHandshake,
  type LucideIcon,
  Music,
  Palette,
  PartyPopper,
  Plane,
  Shirt,
  Sparkles,
  Trophy,
  Users,
  UtensilsCrossed,
} from "lucide-react";

/**
 * Résout le nom d'icône Lucide stocké dans `interests.icon` (ex. "Music",
 * "Clapperboard") vers le composant correspondant. Carte volontairement
 * restreinte au catalogue seed — évite d'embarquer tout lucide-react.
 */
const MAP: Record<string, LucideIcon> = {
  Music,
  PartyPopper,
  Plane,
  UtensilsCrossed,
  Palette,
  BookOpen,
  Sparkles,
  Shirt,
  Trophy,
  Dumbbell,
  Users,
  HeartHandshake,
  Globe,
  Clapperboard,
  Gamepad2,
  Briefcase,
  Cpu,
};

export function interestIcon(name: string | null | undefined): LucideIcon {
  return (name && MAP[name]) || Sparkles;
}
