"use client";

import { useRef, useState } from "react";

import { GradientButton } from "@/components/ui/gradient-button";
import { GhostButton } from "@/components/ui/ghost-button";
import { cn } from "@/lib/utils";

/** Slides de présentation — copie identique au `CarouselScreen` mobile. */
const SLIDES = [
  {
    art: "💞",
    gradient: "linear-gradient(135deg,#8B69D6 0%,#5B3E9E 100%)",
    title: "L’amour sans frontières",
    description:
      "Des rencontres afro-européennes sincères, portées par la culture et le cœur.",
  },
  {
    art: "🌍",
    gradient: "linear-gradient(135deg,#6A4FC0 0%,#2E2440 100%)",
    title: "La diaspora, partout dans le monde",
    description:
      "Rencontrez des membres de la communauté africaine où que vous soyez.",
  },
  {
    art: "🛡️",
    gradient: "linear-gradient(135deg,#9B7EDE 0%,#6A4FC0 100%)",
    title: "Une communauté vérifiée",
    description:
      "Profils vérifiés et modération active pour des rencontres en toute confiance.",
  },
] as const;

/**
 * Carousel d'introduction — port de `CarouselScreen` (mobile). Les visuels
 * plein écran natifs (photos) sont remplacés par des cartes au dégradé
 * signature ; titres et descriptions sont identiques. « Passer » et
 * « Commencer » lancent le parcours ; « Suivant » fait défiler.
 */
export function CarouselStep({ onStart }: { onStart: () => void }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const isLast = index === SLIDES.length - 1;

  function handleScroll() {
    const el = scrollRef.current;
    if (!el) return;
    const next = Math.round(el.scrollLeft / el.clientWidth);
    if (next !== index) setIndex(next);
  }

  function handleNext() {
    if (isLast) {
      onStart();
      return;
    }
    const el = scrollRef.current;
    el?.scrollTo({ left: (index + 1) * el.clientWidth, behavior: "smooth" });
  }

  return (
    <div className="flex flex-1 flex-col">
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex flex-1 snap-x snap-mandatory [scrollbar-width:none] overflow-x-auto scroll-smooth [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
      >
        {SLIDES.map((slide) => (
          <div
            key={slide.title}
            className="flex w-full shrink-0 snap-center flex-col justify-end px-1 pb-6"
          >
            <div
              className="relative flex flex-1 flex-col justify-end overflow-hidden rounded-[26px] p-6 text-white"
              style={{ background: slide.gradient }}
            >
              <span
                className="absolute top-8 right-6 text-[88px] opacity-90 select-none"
                aria-hidden
              >
                {slide.art}
              </span>
              <div className="relative rounded-[20px] bg-black/20 p-5 backdrop-blur-sm">
                <h2 className="font-display mb-2 text-[26px] leading-[1.12]">
                  {slide.title}
                </h2>
                <p className="text-[13.5px] leading-[21px] text-white/80">
                  {slide.description}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mb-6 flex items-center justify-center gap-2">
        {SLIDES.map((slide, i) => (
          <span
            key={slide.title}
            className={cn(
              "bg-primary h-2 rounded-full transition-all duration-200",
              i === index ? "w-6" : "w-2 opacity-30",
            )}
          />
        ))}
      </div>

      <div className="flex flex-col gap-3">
        <GradientButton
          label={isLast ? "Commencer" : "Suivant"}
          onClick={handleNext}
        />
        {!isLast ? (
          <GhostButton label="Passer" tone="onLight" onClick={onStart} />
        ) : null}
      </div>
    </div>
  );
}
