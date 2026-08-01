"use client";

import Image from "next/image";
import Link from "next/link";
import { m } from "framer-motion";
import { Globe2, ShieldCheck, Sparkles } from "lucide-react";

import { Logo } from "@/components/brand/logo";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { Button } from "@/components/ui/button";
import { InstallButton } from "@/components/pwa/install-button";
import { ROUTES } from "@/constants/routes";
import { useHaptics } from "@/hooks/use-haptics";

const EASE = [0.23, 1, 0.32, 1] as const;

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05, delayChildren: 0.04 } },
};
const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: EASE } },
};

const CHIPS = [
  { icon: ShieldCheck, label: "Profils vérifiés" },
  { icon: Globe2, label: "Sans frontières" },
  { icon: Sparkles, label: "Sincères" },
] as const;

/**
 * Écran d'accueil (« 01 - Accueil » du mockup). Mise en page compacte qui tient
 * sur un écran (héro flexible), logo transparent, bascule de thème discrète,
 * et bouton d'installation PWA.
 */
export function Welcome() {
  const haptic = useHaptics();
  const tap = () => haptic("medium");

  return (
    <m.div
      variants={container}
      initial="hidden"
      animate="show"
      className="mx-auto flex min-h-dvh w-full max-w-md flex-col overflow-x-hidden px-6 pt-4 pb-8"
    >
      <m.header variants={item} className="flex items-center justify-between">
        <Logo size="sm" />
        <ThemeToggle />
      </m.header>

      {/* Héro flexible : occupe l'espace restant sans pousser les CTA hors écran. */}
      <m.div
        variants={item}
        className="gradient-signature shadow-brand relative mt-5 min-h-0 flex-1 overflow-hidden rounded-[var(--radius-2xl)]"
      >
        <div className="absolute -top-12 -left-12 size-44 rounded-full bg-white/20 blur-3xl" />
        <div className="bg-brand-950/25 absolute -right-8 bottom-4 size-52 rounded-full blur-3xl" />

        <m.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.7, ease: EASE, delay: 0.1 }}
          className="absolute inset-0 grid place-items-center p-8"
        >
          <Image
            src="/brand/logo.png"
            alt=""
            width={320}
            height={320}
            priority
            className="h-auto max-h-[60%] w-auto max-w-[70%] object-contain drop-shadow-2xl"
          />
        </m.div>

        <div className="glass absolute inset-x-4 bottom-4 rounded-[var(--radius-lg)] px-4 py-3 text-white">
          <p className="text-xs/relaxed opacity-90">
            Aujourd’hui près de chez vous
          </p>
          <p className="font-display text-lg leading-tight font-bold">
            134 profils vous attendent
          </p>
        </div>
      </m.div>

      <m.div variants={item} className="mt-4 flex flex-wrap gap-2">
        {CHIPS.map(({ icon: Icon, label }) => (
          <span
            key={label}
            className="bg-secondary text-secondary-foreground inline-flex items-center gap-1.5 rounded-[var(--radius-pill)] px-3 py-1.5 text-xs font-semibold"
          >
            <Icon className="size-3.5" aria-hidden />
            {label}
          </span>
        ))}
      </m.div>

      <m.h1
        variants={item}
        className="mt-4 text-[1.9rem] leading-[1.1] font-extrabold tracking-tight text-balance"
      >
        Rencontrez le monde entier
      </m.h1>
      <m.p
        variants={item}
        className="text-muted-foreground mt-2 text-[0.95rem] leading-relaxed text-pretty"
      >
        Des rencontres afro-européennes sincères, portées par la culture et le
        cœur.
      </m.p>

      <m.div variants={item} className="mt-5 flex flex-col gap-3">
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
      </m.div>
    </m.div>
  );
}
