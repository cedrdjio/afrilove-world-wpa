"use client";

import { type ComponentType } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { m } from "framer-motion";
import { Compass, Heart, MessageCircle, User } from "lucide-react";

import { cn } from "@/lib/utils";
import { ROUTES } from "@/constants/routes";
import { useHaptics } from "@/hooks/use-haptics";

type IconType = ComponentType<{
  className?: string;
  strokeWidth?: number;
  fill?: string;
}>;

const TABS: {
  key: string;
  href: string;
  icon: IconType;
  label: string;
  fillWhenActive?: boolean;
}[] = [
  { key: "discover", href: ROUTES.discover, icon: Compass, label: "Découvrir" },
  {
    key: "matches",
    href: ROUTES.matches,
    icon: Heart,
    label: "Matchs",
    fillWhenActive: true,
  },
  {
    key: "messages",
    href: ROUTES.messages,
    icon: MessageCircle,
    label: "Messages",
  },
  { key: "profile", href: ROUTES.profile, icon: User, label: "Profil" },
];

function TabItem({
  href,
  icon: Icon,
  label,
  active,
  fillWhenActive,
}: {
  href: string;
  icon: IconType;
  label: string;
  active: boolean;
  fillWhenActive?: boolean;
}) {
  const haptic = useHaptics();

  return (
    <Link
      href={href}
      aria-label={label}
      aria-current={active ? "page" : undefined}
      onClick={() => {
        if (!active) haptic("light");
      }}
      className="flex flex-col items-center gap-1"
    >
      <m.span
        // Devenir actif soulève et grossit légèrement l'icône ; la quitter la
        // ramène — transition douce sans rebond (parité `BottomNavBar`).
        animate={{ scale: active ? 1.08 : 1, y: active ? -1 : 0 }}
        transition={{ duration: active ? 0.2 : 0.18, ease: "easeOut" }}
        className={cn(
          "transition-colors",
          active ? "text-primary" : "text-foreground/25",
        )}
      >
        <Icon
          className="size-[22px]"
          strokeWidth={active ? 2.4 : 1.8}
          fill={active && fillWhenActive ? "currentColor" : "none"}
        />
      </m.span>
      <m.span
        aria-hidden
        className="bg-primary size-1 rounded-full"
        animate={{ opacity: active ? 1 : 0, scale: active ? 1 : 0 }}
        transition={{ duration: 0.18 }}
      />
    </Link>
  );
}

/**
 * Barre de navigation flottante « verre » — port de `BottomNavBar` (mobile).
 * Quatre onglets (Découvrir / Matchs / Messages / Profil), réconciliés sur
 * `/matches` (l'alias historique `/likes` du scaffolding est supprimé). Reste
 * fixée au bas de l'écran, au-dessus du contenu, avec retour haptique au
 * changement d'onglet et respect des zones sûres iOS.
 */
export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Navigation principale"
      className="pointer-events-none fixed inset-x-0 bottom-6 z-40 mb-[env(safe-area-inset-bottom)] flex justify-center"
    >
      <div className="glass pointer-events-auto flex items-center gap-8 rounded-full px-7 py-3.5 shadow-[0_8px_24px_rgba(46,36,64,0.12)]">
        {TABS.map((tab) => (
          <TabItem
            key={tab.key}
            href={tab.href}
            icon={tab.icon}
            label={tab.label}
            fillWhenActive={tab.fillWhenActive}
            active={
              pathname === tab.href || pathname.startsWith(`${tab.href}/`)
            }
          />
        ))}
      </div>
    </nav>
  );
}
