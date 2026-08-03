"use client";

import { m } from "framer-motion";
import { Compass, Heart, MessageCircle, User } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { ROUTES } from "@/constants/routes";
import { cn } from "@/lib/utils";

/**
 * Barre de navigation principale — dock flottant façon iOS : verre translucide,
 * ancré en bas dans les zones sûres iPhone, avec une pastille dégradée animée
 * (layoutId) qui glisse sous l'onglet actif. 100 % icônes vectorielles.
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
      className="glass fixed inset-x-0 bottom-0 z-40 mx-auto mb-[calc(env(safe-area-inset-bottom)+0.5rem)] flex w-[calc(100%-2rem)] max-w-md items-center justify-between gap-1 rounded-[var(--radius-pill)] p-1.5"
    >
      {ITEMS.map(({ key, label, href, Icon }) => {
        const active = pathname.startsWith(href);
        return (
          <Link
            key={key}
            href={href}
            aria-current={active ? "page" : undefined}
            aria-label={label}
            className={cn(
              "relative flex flex-1 items-center justify-center gap-1.5 rounded-[var(--radius-pill)] px-2 py-2.5 text-[0.8rem] font-semibold transition-colors duration-200",
              active
                ? "text-primary-foreground"
                : "text-subtle-foreground hover:text-foreground",
            )}
          >
            {active ? (
              <m.span
                layoutId="nav-active-pill"
                className="gradient-signature absolute inset-0 -z-10 rounded-[var(--radius-pill)] shadow-[var(--shadow-brand)]"
                transition={{ type: "spring", stiffness: 380, damping: 32 }}
                aria-hidden
              />
            ) : null}
            <Icon
              className={cn("size-[1.35rem] shrink-0")}
              strokeWidth={active ? 2.4 : 2}
              aria-hidden
            />
            <span
              className={cn(
                "truncate",
                active ? "inline" : "sr-only sm:not-sr-only",
              )}
            >
              {label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
