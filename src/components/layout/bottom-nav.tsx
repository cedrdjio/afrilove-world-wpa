"use client";

import { Compass, Heart, MessageCircle, User } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { ROUTES } from "@/constants/routes";
import { cn } from "@/lib/utils";

/**
 * Barre de navigation principale (4 onglets du mockup), en verre, ancrée en bas
 * avec respect des zones sûres iOS. Composant de layout réutilisable : il sera
 * monté sur le shell applicatif au Sprint 01 (écrans Discovery, Messages…).
 */
const ITEMS = [
  { key: "discover", label: "Découvrir", href: ROUTES.discover, Icon: Compass },
  { key: "likes", label: "Likes", href: ROUTES.likes, Icon: Heart },
  {
    key: "messages",
    label: "Messages",
    href: ROUTES.messages,
    Icon: MessageCircle,
  },
  { key: "profile", label: "Profil", href: ROUTES.profile, Icon: User },
] as const;

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Navigation principale"
      className="glass fixed inset-x-0 bottom-0 z-40 mx-auto mb-[env(safe-area-inset-bottom)] flex w-[calc(100%-2rem)] max-w-md items-center justify-around rounded-[var(--radius-pill)] px-2 py-2"
    >
      {ITEMS.map(({ key, label, href, Icon }) => {
        const active = pathname.startsWith(href);
        return (
          <Link
            key={key}
            href={href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex flex-col items-center gap-0.5 rounded-[var(--radius-md)] px-4 py-1.5 text-xs font-medium transition-colors",
              active
                ? "text-primary"
                : "text-subtle-foreground hover:text-foreground",
            )}
          >
            <Icon
              className={cn("size-6", active && "fill-primary/15")}
              aria-hidden
            />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
