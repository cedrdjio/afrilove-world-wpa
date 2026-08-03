"use client";

import Image from "next/image";
import Link from "next/link";
import { m } from "framer-motion";

import { ThemeToggle } from "@/components/layout/theme-toggle";
import { Button } from "@/components/ui/button";
import { InstallButton } from "@/components/pwa/install-button";
import { ROUTES } from "@/constants/routes";
import { useHaptics } from "@/hooks/use-haptics";

const EASE = [0.23, 1, 0.32, 1] as const;

/**
 * Accueil public (« 01 »). Photo héro plein cadre, badge logo en verre, panneau
 * inférieur translucide avec titre et appels à l'action. Fidèle à la maquette.
 */
export function Welcome() {
  const haptic = useHaptics();
  const tap = () => haptic("medium");

  return (
    <div className="relative mx-auto flex min-h-dvh w-full max-w-md flex-col overflow-hidden">
      {/* Photo héro */}
      <div className="absolute inset-x-0 top-0 h-[68vh]">
        <Image
          src="/demo/aicha.webp"
          alt=""
          fill
          priority
          sizes="(max-width: 448px) 100vw, 448px"
          className="object-cover"
          style={{ objectPosition: "50% 22%" }}
        />
        <div className="from-brand-950/30 via-background/0 to-background absolute inset-0 bg-gradient-to-b" />
      </div>

      <div className="relative flex items-center justify-end px-5 pt-[max(1rem,env(safe-area-inset-top))]">
        <ThemeToggle />
      </div>

      <m.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: EASE }}
        className="glass relative mx-auto mt-6 inline-flex items-center gap-2.5 rounded-[var(--radius-pill)] py-2 pr-4 pl-2.5"
      >
        <Image
          src="/brand/logo.png"
          alt=""
          width={28}
          height={28}
          className="size-7 object-contain"
        />
        <span className="font-display text-sm font-extrabold tracking-[0.12em] text-white drop-shadow">
          AFRILOVE WORLD
        </span>
      </m.div>

      {/* Panneau inférieur */}
      <m.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: EASE, delay: 0.1 }}
        className="glass relative mt-auto flex flex-col rounded-t-[var(--radius-2xl)] px-7 pt-8 pb-[max(2rem,env(safe-area-inset-bottom))]"
      >
        <div className="flex gap-1.5" aria-hidden>
          <span className="gradient-signature h-1.5 w-6 rounded-full" />
          <span className="bg-accent/30 h-1.5 w-1.5 rounded-full" />
          <span className="bg-accent/30 h-1.5 w-1.5 rounded-full" />
        </div>

        <h1 className="font-display mt-5 text-[2rem] leading-[1.1] font-extrabold tracking-tight text-balance">
          Rencontrez le monde entier
        </h1>
        <p className="text-muted-foreground mt-3.5 text-[0.95rem] leading-relaxed text-pretty">
          Des rencontres afro-européennes sincères, portées par la culture et le
          cœur.
        </p>

        <div className="mt-7 flex flex-col gap-3">
          <Button size="lg" block asChild onClick={tap}>
            <Link href={ROUTES.register}>Créer mon compte</Link>
          </Button>
          <InstallButton variant="outline" />
          <Link
            href={ROUTES.login}
            onClick={tap}
            className="text-muted-foreground hover:text-foreground text-center text-sm font-medium transition-colors"
          >
            Déjà membre ?{" "}
            <span className="text-primary font-bold">Se connecter</span>
          </Link>
        </div>
      </m.div>
    </div>
  );
}
