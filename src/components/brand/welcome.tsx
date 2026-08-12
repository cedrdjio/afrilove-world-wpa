"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { m } from "framer-motion";

import { ThemeToggle } from "@/components/layout/theme-toggle";
import { Button } from "@/components/ui/button";
import { InstallButton } from "@/components/pwa/install-button";
import { ROUTES } from "@/constants/routes";
import { useHaptics } from "@/hooks/use-haptics";
import { cn } from "@/lib/utils";

const EASE = [0.23, 1, 0.32, 1] as const;

/**
 * Slides de présentation — parité avec le carrousel du jalon mobile
 * (`CarouselScreen`). Chaque slide porte SON image et SON texte : le message
 * défile donc avec la photo au fil du swipe.
 */
const SLIDES = [
  {
    image: "/welcome/slide-amour.webp",
    title: "L'amour sans frontières",
    description:
      "Des rencontres afro-européennes sincères, portées par la culture et le cœur.",
  },
  {
    image: "/welcome/slide-diaspora.webp",
    title: "La diaspora,\npartout dans le monde",
    description:
      "Rencontrez des membres de la communauté africaine où que vous soyez.",
  },
  {
    image: "/welcome/slide-confiance.webp",
    title: "Une communauté\nvérifiée",
    description:
      "Profils vérifiés et modération active pour des rencontres en toute confiance.",
  },
] as const;

/**
 * Accueil public (« 01 ») — carrousel plein cadre et swipable. On garde le
 * badge logo en verre et les appels à l'action (créer un compte / se connecter)
 * fixés en bas, au-dessus d'un scrim sombre lisible sur toutes les photos.
 */
export function Welcome() {
  const haptic = useHaptics();
  const tap = () => haptic("medium");

  const scrollerRef = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);

  // Défilement automatique : le carrousel avance seul et boucle. On met en
  // pause pendant que l'utilisateur interagit, puis on reprend après un délai.
  const pausedRef = useRef(false);
  const resumeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (reduce) return;

    const id = setInterval(() => {
      const el = scrollerRef.current;
      if (!el || pausedRef.current) return;
      const current = Math.round(el.scrollLeft / el.clientWidth);
      const next = (current + 1) % SLIDES.length;
      el.scrollTo({ left: next * el.clientWidth, behavior: "smooth" });
    }, 4500);

    return () => {
      clearInterval(id);
      if (resumeTimer.current) clearTimeout(resumeTimer.current);
    };
  }, []);

  const pause = () => {
    pausedRef.current = true;
    if (resumeTimer.current) clearTimeout(resumeTimer.current);
  };

  const resumeSoon = () => {
    if (resumeTimer.current) clearTimeout(resumeTimer.current);
    resumeTimer.current = setTimeout(() => {
      pausedRef.current = false;
    }, 6000);
  };

  const handleScroll = () => {
    const el = scrollerRef.current;
    if (!el) return;
    const next = Math.round(el.scrollLeft / el.clientWidth);
    if (next !== index) setIndex(next);
  };

  const goTo = (i: number) => {
    const el = scrollerRef.current;
    if (!el) return;
    pause();
    resumeSoon();
    el.scrollTo({ left: i * el.clientWidth, behavior: "smooth" });
  };

  return (
    <div className="bg-brand-950 relative mx-auto flex min-h-dvh w-full max-w-md flex-col overflow-hidden">
      {/* Carrousel plein écran (swipe horizontal, accroche par slide). */}
      <div
        ref={scrollerRef}
        onScroll={handleScroll}
        onPointerDown={pause}
        onPointerUp={resumeSoon}
        onPointerCancel={resumeSoon}
        onTouchEnd={resumeSoon}
        aria-roledescription="carousel"
        aria-label="Présentation d'AfriLove World"
        className="flex h-dvh snap-x snap-mandatory [scrollbar-width:none] overflow-x-auto overflow-y-hidden [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
      >
        {SLIDES.map((slide, i) => (
          <section
            key={slide.image}
            aria-roledescription="slide"
            aria-label={`${i + 1} sur ${SLIDES.length}`}
            className="relative h-full w-full shrink-0 snap-center"
          >
            <Image
              src={slide.image}
              alt=""
              fill
              priority={i === 0}
              sizes="(max-width: 448px) 100vw, 448px"
              className="object-cover"
            />
            {/* Scrim : léger en haut, dense en bas pour le texte et les CTA. */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/45 via-black/10 to-black/85" />

            <div className="relative flex h-full flex-col justify-end px-6 pb-[clamp(15rem,32vh,17rem)]">
              <m.div
                key={index === i ? "on" : "off"}
                initial={{ opacity: 0, y: 14 }}
                animate={index === i ? { opacity: 1, y: 0 } : { opacity: 0.35 }}
                transition={{ duration: 0.5, ease: EASE }}
                className="rounded-[var(--radius-2xl)] bg-black/25 p-6 ring-1 ring-white/10 backdrop-blur-md"
              >
                <h1 className="font-display text-[2rem] leading-[1.1] font-extrabold tracking-tight text-balance whitespace-pre-line text-white">
                  {slide.title}
                </h1>
                <p className="mt-3 text-[0.95rem] leading-relaxed text-pretty text-white/80">
                  {slide.description}
                </p>
              </m.div>
            </div>
          </section>
        ))}
      </div>

      {/* Barre du haut : badge logo + bascule de thème (au-dessus du carrousel). */}
      <div className="absolute inset-x-0 top-0 z-20 flex items-start justify-between px-5 pt-[max(1rem,env(safe-area-inset-top))]">
        <m.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: EASE }}
          className="inline-flex items-center gap-2.5 rounded-[var(--radius-pill)] bg-black/25 py-2 pr-4 pl-2.5 ring-1 ring-white/15 backdrop-blur-md"
        >
          <Image
            src="/brand/logo.png"
            alt=""
            width={28}
            height={28}
            className="size-7 object-contain"
          />
          <span className="font-display text-sm font-extrabold tracking-tight text-white drop-shadow">
            AfriLove World
          </span>
        </m.div>
        <ThemeToggle className="bg-black/25 text-white ring-1 ring-white/15 backdrop-blur-md" />
      </div>

      {/* Contrôles fixes : pastilles de progression + appels à l'action. */}
      <m.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: EASE, delay: 0.1 }}
        className="absolute inset-x-0 bottom-0 z-20 flex flex-col px-7 pt-10 pb-[max(2rem,env(safe-area-inset-bottom))]"
      >
        {/* Dégradé de lisibilité derrière les contrôles (non interactif). */}
        <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-t from-black/90 via-black/60 to-transparent" />

        <div className="mb-6 flex items-center gap-1.5" aria-hidden={false}>
          {SLIDES.map((slide, i) => {
            const active = i === index;
            return (
              <button
                key={slide.image}
                type="button"
                onClick={() => goTo(i)}
                aria-label={`Aller à la présentation ${i + 1}`}
                aria-current={active}
                className={cn(
                  "h-1.5 rounded-full transition-all duration-300",
                  active ? "gradient-signature w-6" : "w-1.5 bg-white/40",
                )}
              />
            );
          })}
        </div>

        <div className="flex flex-col gap-3">
          <Button size="lg" block asChild onClick={tap}>
            <Link href={ROUTES.register}>Créer mon compte</Link>
          </Button>
          <InstallButton
            variant="outline"
            className="border-white/35 bg-white/5 text-white hover:bg-white/10"
          />
          <Link
            href={ROUTES.login}
            onClick={tap}
            className="text-center text-sm font-medium text-white/75 transition-colors hover:text-white"
          >
            Déjà membre ?{" "}
            <span className="text-primary font-bold">Se connecter</span>
          </Link>
        </div>
      </m.div>
    </div>
  );
}
