"use client";

import Image from "next/image";
import Link from "next/link";
import { m } from "framer-motion";
import { Heart, Lock } from "lucide-react";

import { ROUTES } from "@/constants/routes";
import { DEMO_INCOMING_LIKES } from "@/features/profiles/data";
import type { IncomingLike } from "@/features/profiles/types";

const EASE = [0.23, 1, 0.32, 1] as const;

/**
 * « Qui m'a liké » (« 10 »). Grille de profils : le premier est révélé, les
 * autres floutés derrière le paywall Premium. Fond nuit immersif.
 */
export function LikesScreen() {
  const total = 18;

  return (
    <div
      className="dark relative flex min-h-dvh flex-col overflow-hidden px-5 pt-[max(1.25rem,env(safe-area-inset-top))] pb-28 text-white"
      style={{
        background:
          "linear-gradient(158deg,#2E2440 0%,#3B2C5C 55%,#4A3C7A 100%)",
      }}
    >
      <div className="bg-accent/25 pointer-events-none absolute top-36 -right-24 size-72 rounded-full blur-3xl" />

      <header className="relative z-10 text-center">
        <h1 className="font-display text-2xl font-extrabold">
          Ils t&apos;ont liké
        </h1>
        <p className="mt-1 text-sm text-white/65">
          <span className="text-brand-300 font-bold">{total} personnes</span>{" "}
          attendent ton like
        </p>
      </header>

      <m.div
        initial="hidden"
        animate="show"
        variants={{ show: { transition: { staggerChildren: 0.06 } } }}
        className="relative z-10 mt-6 grid flex-1 grid-cols-2 gap-3.5"
      >
        {DEMO_INCOMING_LIKES.map((like) => (
          <LikeCard key={like.profile.id} like={like} />
        ))}
      </m.div>

      <div className="glass relative z-10 mt-4 rounded-[var(--radius-lg)] border-white/25 bg-white/10 p-5 text-center">
        <h2 className="font-display text-lg font-extrabold">
          Vois qui craque pour toi
        </h2>
        <p className="mt-1 text-sm text-white/70">
          Débloque tous les likes avec Premium
        </p>
        <Link
          href={ROUTES.premium}
          className="gradient-signature shadow-brand font-display mt-4 flex h-13 items-center justify-center rounded-[var(--radius-pill)] py-3.5 font-bold text-white active:scale-[0.98]"
        >
          Passer à Premium
        </Link>
      </div>
    </div>
  );
}

function LikeCard({ like }: { like: IncomingLike }) {
  const { profile, locked } = like;

  const inner = (
    <>
      <Image
        src={profile.photos[0]}
        alt={locked ? "Profil masqué" : profile.firstName}
        fill
        sizes="(max-width: 448px) 45vw, 190px"
        className={
          locked
            ? "scale-110 object-cover blur-xl brightness-75"
            : "object-cover"
        }
      />
      {locked ? (
        <div className="bg-brand-950/35 absolute inset-0 grid place-items-center">
          <Lock className="size-8" aria-hidden />
        </div>
      ) : (
        <>
          <div className="from-brand-950/80 absolute inset-0 bg-gradient-to-t to-transparent" />
          <span className="font-display absolute bottom-3 left-3 font-bold">
            {profile.firstName}, {profile.age}
          </span>
          <span className="gradient-signature absolute top-2.5 right-2.5 grid size-7 place-items-center rounded-full">
            <Heart className="size-4 fill-white text-white" aria-hidden />
          </span>
        </>
      )}
    </>
  );

  const variants = {
    hidden: { opacity: 0, scale: 0.94 },
    show: { opacity: 1, scale: 1, transition: { ease: EASE, duration: 0.4 } },
  };

  return locked ? (
    <m.div
      variants={variants}
      className="relative aspect-3/4 overflow-hidden rounded-[var(--radius-lg)] shadow-xl"
    >
      {inner}
    </m.div>
  ) : (
    <m.div variants={variants} className="relative aspect-3/4">
      <Link
        href={`${ROUTES.discover}/${profile.id}`}
        className="relative block size-full overflow-hidden rounded-[var(--radius-lg)] shadow-xl"
      >
        {inner}
      </Link>
    </m.div>
  );
}
