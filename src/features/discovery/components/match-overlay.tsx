"use client";

import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, m } from "framer-motion";
import { Heart, Send, X } from "lucide-react";

import { ROUTES } from "@/constants/routes";
import { DEMO_ME } from "@/features/profiles/data";
import type { Profile } from "@/features/profiles/types";
import { useDiscoveryStore } from "../store";

const EASE = [0.23, 1, 0.32, 1] as const;

/**
 * Overlay « C'est un match ! » (« 06 Match »). Plein écran, dégradé nuit,
 * photos des deux profils qui se rejoignent autour d'un cœur battant.
 */
export function MatchOverlay() {
  const matched = useDiscoveryStore((s) => s.matched);
  const clearMatch = useDiscoveryStore((s) => s.clearMatch);

  return (
    <AnimatePresence>
      {matched && <MatchContent profile={matched} onClose={clearMatch} />}
    </AnimatePresence>
  );
}

function MatchContent({
  profile,
  onClose,
}: {
  profile: Profile;
  onClose: () => void;
}) {
  return (
    <m.div
      role="dialog"
      aria-modal="true"
      aria-label={`C'est un match avec ${profile.firstName}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[70] flex flex-col items-center justify-center overflow-hidden px-8 text-center text-white"
      style={{
        background:
          "linear-gradient(160deg,#2E2440 0%,#4A3C7A 60%,#6A4FC0 130%)",
      }}
    >
      <div className="bg-accent/40 pointer-events-none absolute top-24 left-1/2 size-[420px] -translate-x-1/2 rounded-full blur-3xl" />

      <button
        type="button"
        onClick={onClose}
        aria-label="Fermer"
        className="absolute top-[max(1.5rem,env(safe-area-inset-top))] right-6 grid size-11 place-items-center rounded-[var(--radius-md)] border border-white/20 bg-white/10 backdrop-blur-lg"
      >
        <X className="size-5" aria-hidden />
      </button>

      <m.div
        initial={{ y: 24, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ ease: EASE, duration: 0.5 }}
        className="relative flex flex-col items-center"
      >
        <p className="font-display text-brand-300 text-sm font-bold tracking-[0.3em] uppercase">
          Coup de cœur mutuel
        </p>
        <h1 className="font-display mt-3 text-5xl leading-none font-extrabold drop-shadow-lg">
          C&apos;est un
          <br />
          match !
        </h1>

        <div className="relative my-12 flex h-44 items-center justify-center">
          <m.div
            initial={{ x: 60, rotate: 0, opacity: 0 }}
            animate={{ x: 26, rotate: -6, opacity: 1 }}
            transition={{ ease: EASE, duration: 0.6, delay: 0.1 }}
            className="size-36 overflow-hidden rounded-full border-4 border-white/90 shadow-2xl"
          >
            <Image
              src={profile.photos[0]}
              alt={profile.firstName}
              width={144}
              height={144}
              className="size-full object-cover"
            />
          </m.div>
          <m.div
            initial={{ x: -60, rotate: 0, opacity: 0 }}
            animate={{ x: -26, rotate: 6, opacity: 1 }}
            transition={{ ease: EASE, duration: 0.6, delay: 0.1 }}
            className="size-36 overflow-hidden rounded-full border-4 border-white/90 shadow-2xl"
          >
            <Image
              src={DEMO_ME.avatar}
              alt="Vous"
              width={144}
              height={144}
              className="size-full object-cover"
            />
          </m.div>
          <m.span
            animate={{ scale: [1, 1.16, 1] }}
            transition={{ repeat: Infinity, duration: 1.6, ease: "easeInOut" }}
            className="gradient-signature shadow-brand absolute grid size-16 -translate-y-0.5 place-items-center rounded-full border-[3px] border-white/50"
          >
            <Heart className="size-8 fill-white text-white" aria-hidden />
          </m.span>
        </div>

        <p className="text-base leading-relaxed text-white/85">
          Toi et{" "}
          <span className="font-bold text-white">{profile.firstName}</span> vous
          êtes plu.
          <br />
          Lancez la conversation.
        </p>

        <div className="mt-8 flex w-full max-w-xs flex-col gap-3">
          <Link
            href={`${ROUTES.messages}/${profile.id}`}
            onClick={onClose}
            className="font-display text-primary flex h-14 items-center justify-center gap-2 rounded-[var(--radius-pill)] bg-white font-bold shadow-xl active:scale-[0.98]"
          >
            <Send className="size-5" aria-hidden />
            Envoyer un message
          </Link>
          <button
            type="button"
            onClick={onClose}
            className="font-display h-13 rounded-[var(--radius-pill)] border border-white/30 bg-white/10 px-6 py-3.5 font-bold text-white backdrop-blur-lg active:scale-[0.98]"
          >
            Continuer à découvrir
          </button>
        </div>
      </m.div>
    </m.div>
  );
}
