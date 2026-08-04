"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

import { FullScreenLoader } from "@/components/feedback";
import { cn } from "@/lib/utils";
import { useOtherProfileQuery } from "@/features/profile/hooks/use-profile";

/**
 * Galerie plein écran — port de `FullscreenGalleryScreen`. Défilement au doigt
 * (scroll-snap), flèches de secours, compteur et barres d'avancement. Le zoom
 * pincé natif du mobile est remplacé par un zoom au clic (contain ↔ cover).
 */
export default function GalleryPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const profileQuery = useOtherProfileQuery(params.id);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const [zoomed, setZoomed] = useState(false);

  const photos = profileQuery.data?.photos ?? [];

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") router.back();
      if (e.key === "ArrowLeft") goTo(index - 1);
      if (e.key === "ArrowRight") goTo(index + 1);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, photos.length]);

  if (!profileQuery.data) return <FullScreenLoader />;

  function goTo(i: number) {
    const el = scrollRef.current;
    if (!el) return;
    const clamped = Math.max(0, Math.min(photos.length - 1, i));
    el.scrollTo({ left: clamped * el.clientWidth, behavior: "smooth" });
    setIndex(clamped);
  }

  function onScroll() {
    const el = scrollRef.current;
    if (!el) return;
    setIndex(Math.round(el.scrollLeft / el.clientWidth));
  }

  return (
    <div className="fixed inset-0 z-[60] bg-black">
      <div
        ref={scrollRef}
        onScroll={onScroll}
        className="flex size-full snap-x snap-mandatory [scrollbar-width:none] overflow-x-auto [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
      >
        {photos.map((photo) => (
          <button
            key={photo.id}
            type="button"
            onClick={() => setZoomed((z) => !z)}
            className="flex size-full shrink-0 snap-center items-center justify-center"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={photo.url}
              alt=""
              className={cn(
                "size-full transition-[object-fit]",
                zoomed ? "object-cover" : "object-contain",
              )}
            />
          </button>
        ))}
      </div>

      {/* Barres d'avancement */}
      <div className="absolute inset-x-0 top-[58px] flex justify-center gap-1.5 px-6">
        {photos.map((photo, i) => (
          <span
            key={photo.id}
            className={cn(
              "h-1 flex-1 rounded-full",
              i === index ? "bg-white/90" : "bg-white/30",
            )}
          />
        ))}
      </div>

      {photos.length > 1 ? (
        <div className="absolute top-[76px] left-5 rounded-full bg-white/[0.15] px-3 py-1.5">
          <span className="text-[11px] font-semibold text-white">
            {index + 1} / {photos.length}
          </span>
        </div>
      ) : null}

      {photos.length > 1 && index > 0 ? (
        <button
          type="button"
          onClick={() => goTo(index - 1)}
          aria-label="Photo précédente"
          className="absolute top-1/2 left-3 grid size-11 -translate-y-1/2 place-items-center rounded-full bg-white/[0.14]"
        >
          <ChevronLeft
            className="size-[22px] text-white"
            strokeWidth={2.4}
            aria-hidden
          />
        </button>
      ) : null}
      {photos.length > 1 && index < photos.length - 1 ? (
        <button
          type="button"
          onClick={() => goTo(index + 1)}
          aria-label="Photo suivante"
          className="absolute top-1/2 right-3 grid size-11 -translate-y-1/2 place-items-center rounded-full bg-white/[0.14]"
        >
          <ChevronRight
            className="size-[22px] text-white"
            strokeWidth={2.4}
            aria-hidden
          />
        </button>
      ) : null}

      <button
        type="button"
        onClick={() => router.back()}
        aria-label="Fermer"
        className="absolute top-[76px] right-5 grid size-10 place-items-center rounded-full bg-white/[0.15]"
      >
        <X className="size-[18px] text-white" aria-hidden />
      </button>
    </div>
  );
}
