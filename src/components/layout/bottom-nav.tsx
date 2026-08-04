"use client";

import { m } from "framer-motion";
import { Compass, Heart, MessageCircle, User } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { ROUTES } from "@/constants/routes";
import { cn } from "@/lib/utils";

/**
 * Barre de navigation principale — dock flottant façon iOS, épuré et lisible :
 * carte pleine (pas de verre laiteux), ancrée dans les zones sûres iPhone, avec
 * une pastille dégradée animée (layoutId) qui glisse sous l'onglet actif.
 * Icône seule au repos, icône + libellé pour l'onglet actif. 100 % vectoriel.
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
      className="border-border bg-card/95 fixed inset-x-0 bottom-0 z-40 mx-auto mb-[calc(env(safe-area-inset-bottom)+0.5rem)] flex w-[calc(100%-2rem)] max-w-md items-center justify-between gap-1 rounded-[var(--radius-pill)] border p-1.5 shadow-[0_12px_40px_-10px_rgba(46,36,64,0.35)] backdrop-blur-xl"
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
              "relative flex flex-1 items-center justify-center gap-2 rounded-[var(--radius-pill)] px-2 py-3 text-[0.8rem] font-bold transition-colors duration-200",
              active
                ? "text-primary-foreground"
                : "text-subtle-foreground hover:text-foreground",
            )}
          >
            {active ? (
              <m.span
                layoutId="nav-active-pill"
                className="gradient-signature shadow-brand absolute inset-0 -z-10 rounded-[var(--radius-pill)]"
                transition={{ type: "spring", stiffness: 380, damping: 32 }}
                aria-hidden
              />
            ) : null}
            <Icon
              className="size-[1.3rem] shrink-0"
              strokeWidth={active ? 2.5 : 2}
              aria-hidden
            />
            {active && <span className="truncate">{label}</span>}
          </Link>
        );
      })}
    </nav>
  );
}
