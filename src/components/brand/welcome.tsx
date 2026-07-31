"use client";

import { m } from "framer-motion";
import { Globe2, ShieldCheck, Sparkles } from "lucide-react";
import { toast } from "sonner";

import { Logo } from "@/components/brand/logo";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { Button } from "@/components/ui/button";
import { useHaptics } from "@/hooks/use-haptics";

const EASE = [0.23, 1, 0.32, 1] as const;

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06, delayChildren: 0.05 } },
};

const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE } },
};

const CHIPS = [
  { icon: ShieldCheck, label: "Profils vérifiés" },
  { icon: Globe2, label: "Sans frontières" },
  { icon: Sparkles, label: "Rencontres sincères" },
] as const;

/**
 * Écran d'accueil (« 01 - Accueil » du mockup), branché sur la charte.
 * Les CTA sont présents mais inertes au Sprint 00 (l'auth arrive au Sprint 01).
 */
export function Welcome() {
  const haptic = useHaptics();

  const soon = () => {
    haptic("medium");
    toast("Bientôt disponible", {
      description: "L'inscription arrive au prochain sprint. ✨",
    });
  };

  return (
    <m.div
      variants={container}
      initial="hidden"
      animate="show"
      className="flex min-h-dvh flex-col px-6 pt-6 pb-10"
    >
      <m.header variants={item} className="flex items-center justify-between">
        <Logo size="sm" />
        <ThemeToggle />
      </m.header>

      {/* Visuel héro — glassmorphisme, sans photo (identité de marque pure) */}
      <m.div
        variants={item}
        className="gradient-signature shadow-brand relative mt-8 aspect-[4/5] w-full overflow-hidden rounded-[var(--radius-2xl)]"
      >
        <div className="absolute -top-10 -left-10 size-40 rounded-full bg-white/20 blur-2xl" />
        <div className="bg-brand-950/20 absolute right-0 bottom-6 size-52 rounded-full blur-3xl" />
        <m.div
          initial={{ scale: 0.92, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.7, ease: EASE, delay: 0.15 }}
          className="absolute inset-0 grid place-items-center"
        >
          <Logo size="lg" showWordmark={false} className="scale-[2.2]" />
        </m.div>
        <div className="glass absolute inset-x-5 bottom-5 rounded-[var(--radius-lg)] px-4 py-3 text-white">
          <p className="text-sm/relaxed opacity-90">
            Aujourd’hui près de chez vous
          </p>
          <p className="font-display text-lg font-bold">
            134 profils vous attendent
          </p>
        </div>
      </m.div>

      <m.div variants={item} className="mt-3 flex flex-wrap gap-2">
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
        className="mt-6 text-[2rem] leading-[1.1] font-extrabold tracking-tight text-balance"
      >
        Rencontrez le monde entier
      </m.h1>
      <m.p
        variants={item}
        className="text-muted-foreground mt-3 text-[0.98rem] leading-relaxed text-pretty"
      >
        Des rencontres afro-européennes sincères, portées par la culture et le
        cœur.
      </m.p>

      <m.div variants={item} className="mt-auto flex flex-col gap-3 pt-8">
        <Button size="lg" block onClick={soon}>
          Créer mon compte
        </Button>
        <button
          onClick={soon}
          className="text-muted-foreground hover:text-foreground text-center text-sm font-medium transition-colors"
        >
          Déjà membre ?{" "}
          <span className="text-primary font-bold">Se connecter</span>
        </button>
      </m.div>
    </m.div>
  );
}
