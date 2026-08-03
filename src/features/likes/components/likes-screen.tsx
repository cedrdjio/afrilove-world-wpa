"use client";

import Image from "next/image";
import Link from "next/link";
import { m } from "framer-motion";
import { Heart, Lock } from "lucide-react";

import { ROUTES } from "@/constants/routes";
import { DEMO_INCOMING_LIKES } from "@/features/profiles/data";
import { initials } from "@/utils/format";
import { useAuth } from "@/providers/auth-provider";
import { useEntitlements, useLikers } from "@/features/premium/hooks";

const EASE = [0.23, 1, 0.32, 1] as const;

/** Modèle unifié de carte, alimenté par les données réelles ou la démo. */
interface LikeItem {
  id: string;
  firstName: string;
  age: number | null;
  photo: string | null;
  locked: boolean;
}

/**
 * « Qui m'a liké » (« 10 »). Grille immersive : en Premium, les vrais visages
 * mènent à la fiche ; sinon des cartes verrouillées (aucune photo divulguée)
 * derrière le paywall. Branché sur `get_my_entitlements` + `get_my_likers` ;
 * l'aperçu non authentifié retombe sur la démo.
 */
export function LikesScreen() {
  const { isAuthenticated } = useAuth();
  const { data: entitlements } = useEntitlements();
  const isPremium = Boolean(entitlements?.isPremium);
  const { data: likers, isLoading } = useLikers(isPremium);

  const likersCount = entitlements?.likersCount ?? 0;

  let items: LikeItem[];
  if (!isAuthenticated) {
    items = DEMO_INCOMING_LIKES.map((l) => ({
      id: l.profile.id,
      firstName: l.profile.firstName,
      age: l.profile.age,
      photo: l.profile.photos[0],
      locked: l.locked,
    }));
  } else if (isPremium) {
    items = (likers ?? []).map((l) => ({
      id: l.id,
      firstName: l.firstName,
      age: null,
      photo: l.avatarUrl,
      locked: false,
    }));
  } else {
    // Non-premium : on connaît le nombre, pas les visages — cartes verrouillées.
    items = Array.from({ length: Math.min(likersCount, 12) }).map((_, i) => ({
      id: `locked-${i}`,
      firstName: "",
      age: null,
      photo: null,
      locked: true,
    }));
  }

  const total = isAuthenticated ? likersCount : 18;
  const showEmpty = isAuthenticated && !isLoading && total === 0;

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
          {showEmpty ? (
            "Personne pour l'instant — continue à explorer"
          ) : (
            <>
              <span className="text-brand-300 font-bold">
                {total} personne{total > 1 ? "s" : ""}
              </span>{" "}
              {total > 1 ? "attendent" : "attend"} ton like
            </>
          )}
        </p>
      </header>

      {isLoading && isAuthenticated ? (
        <div className="relative z-10 mt-6 grid flex-1 grid-cols-2 gap-3.5">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="aspect-3/4 animate-pulse rounded-[var(--radius-lg)] bg-white/10"
            />
          ))}
        </div>
      ) : showEmpty ? (
        <div className="relative z-10 mt-10 flex flex-1 flex-col items-center justify-center text-center">
          <span className="glass grid size-16 place-items-center rounded-full border-white/20 bg-white/10">
            <Heart className="size-7" aria-hidden />
          </span>
          <p className="mt-4 max-w-[16rem] text-sm text-white/70">
            Dès qu&apos;une personne te likera, elle apparaîtra ici.
          </p>
          <Link
            href={ROUTES.discover}
            className="glass mt-5 rounded-[var(--radius-pill)] border-white/25 bg-white/10 px-6 py-2.5 text-sm font-bold"
          >
            Découvrir des profils
          </Link>
        </div>
      ) : (
        <m.div
          initial="hidden"
          animate="show"
          variants={{ show: { transition: { staggerChildren: 0.06 } } }}
          className="relative z-10 mt-6 grid flex-1 grid-cols-2 gap-3.5"
        >
          {items.map((item) => (
            <LikeCard key={item.id} item={item} />
          ))}
        </m.div>
      )}

      {!showEmpty && !isPremium && (
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
      )}
    </div>
  );
}

function LikeCard({ item }: { item: LikeItem }) {
  const { firstName, age, photo, locked } = item;

  const media = photo ? (
    <Image
      src={photo}
      alt={locked ? "Profil masqué" : firstName}
      fill
      sizes="(max-width: 448px) 45vw, 190px"
      className={
        locked ? "scale-110 object-cover blur-xl brightness-75" : "object-cover"
      }
    />
  ) : (
    <div className="gradient-signature grid size-full place-items-center">
      {firstName ? (
        <span className="font-display text-2xl font-extrabold text-white/90">
          {initials(firstName)}
        </span>
      ) : null}
    </div>
  );

  const inner = (
    <>
      {media}
      {locked ? (
        <div className="bg-brand-950/35 absolute inset-0 grid place-items-center backdrop-blur-[2px]">
          <Lock className="size-8" aria-hidden />
        </div>
      ) : (
        <>
          <div className="from-brand-950/80 absolute inset-0 bg-gradient-to-t to-transparent" />
          <span className="font-display absolute bottom-3 left-3 font-bold">
            {firstName}
            {age != null ? `, ${age}` : ""}
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
        href={`${ROUTES.discover}/${item.id}`}
        className="relative block size-full overflow-hidden rounded-[var(--radius-lg)] shadow-xl"
      >
        {inner}
      </Link>
    </m.div>
  );
}
