"use client";

import { Compass, Heart, MessageCircle, User } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { ROUTES } from "@/constants/routes";
import { cn } from "@/lib/utils";

/**
 * Barre de navigation principale — dock flottant façon app mobile AfroLove :
 * pill translucide ancré dans les zones sûres iPhone, icônes seules (sans
 * libellé). L'onglet actif est mis en avant par une icône violette dans un
 * léger halo arrondi et un point indicateur dessous. 100 % vectoriel.
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
      className="border-border bg-card/90 fixed bottom-[calc(env(safe-area-inset-bottom)+0.5rem)] left-1/2 z-40 flex w-fit -translate-x-1/2 items-center gap-1.5 rounded-[var(--radius-pill)] border p-1.5 shadow-[0_12px_40px_-10px_rgba(46,36,64,0.35)] backdrop-blur-xl"
    >
      {ITEMS.map(({ key, label, href, Icon }) => {
        const active = pathname.startsWith(href);
        return (
          <Link
            key={key}
            href={href}
            aria-current={active ? "page" : undefined}
            aria-label={label}
            className="relative flex items-center justify-center"
          >
            <span
              className={cn(
                "grid size-11 place-items-center rounded-2xl transition-colors duration-200",
                active ? "bg-primary/10" : "hover:bg-muted/60",
              )}
            >
              <Icon
                className={cn(
                  "size-6 transition-colors",
                  active ? "text-primary" : "text-subtle-foreground",
                )}
                strokeWidth={active ? 2.4 : 2}
                aria-hidden
              />
            </span>
            {active && (
              <span
                className="bg-primary absolute -bottom-0.5 size-1.5 rounded-full"
                aria-hidden
              />
            )}
          </Link>
        );
      })}
    </nav>
  );
}
