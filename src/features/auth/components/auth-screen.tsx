"use client";

import { type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { m } from "framer-motion";
import { ChevronLeft } from "lucide-react";

import { Logo } from "@/components/brand/logo";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { ROUTES } from "@/constants/routes";

const EASE = [0.23, 1, 0.32, 1] as const;

interface AuthScreenProps {
  title: string;
  subtitle?: ReactNode;
  children: ReactNode;
  /** Zone basse (liens secondaires). */
  footer?: ReactNode;
  /** Où renvoie la flèche retour (défaut : accueil). */
  backTo?: string;
}

/**
 * Cadre commun des écrans d'authentification : barre haute (retour + logo +
 * thème), titre/sous-titre, contenu, pied. Mobile-first, safe-areas gérées
 * par le body (Sprint 00).
 */
export function AuthScreen({
  title,
  subtitle,
  children,
  footer,
  backTo,
}: AuthScreenProps) {
  const router = useRouter();

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col px-6 pt-4 pb-10">
      <header className="flex items-center justify-between">
        {backTo ? (
          <Link
            href={backTo}
            aria-label="Retour"
            className="text-muted-foreground hover:text-foreground -ml-2 grid size-10 place-items-center rounded-full transition-colors"
          >
            <ChevronLeft className="size-6" aria-hidden />
          </Link>
        ) : (
          <button
            type="button"
            onClick={() => router.back()}
            aria-label="Retour"
            className="text-muted-foreground hover:text-foreground -ml-2 grid size-10 place-items-center rounded-full transition-colors"
          >
            <ChevronLeft className="size-6" aria-hidden />
          </button>
        )}
        <Link href={ROUTES.home} aria-label="Accueil AfroLove World">
          <Logo size="sm" showWordmark={false} />
        </Link>
        <ThemeToggle />
      </header>

      <m.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: EASE }}
        className="mt-8 flex flex-1 flex-col"
      >
        <h1 className="text-[1.75rem] leading-tight font-extrabold tracking-tight text-balance">
          {title}
        </h1>
        {subtitle ? (
          <p className="text-muted-foreground mt-2 text-[0.95rem] leading-relaxed text-pretty">
            {subtitle}
          </p>
        ) : null}

        <div className="mt-8 flex flex-1 flex-col">{children}</div>

        {footer ? <div className="mt-8">{footer}</div> : null}
      </m.div>
    </div>
  );
}
