"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { m } from "framer-motion";
import { Bookmark, Heart, Lock, X } from "lucide-react";

import { ROUTES } from "@/constants/routes";
import { DEMO_INCOMING_LIKES } from "@/features/profiles/data";
import { initials } from "@/utils/format";
import { useAuth } from "@/providers/auth-provider";
import { useEntitlements, useLikers } from "@/features/premium/hooks";
import {
  useSavedFavorites,
  useToggleFavorite,
} from "@/features/favorites/hooks";
import type { SavedFavorite } from "@/features/favorites/service";
import { cn } from "@/lib/utils";

const EASE = [0.23, 1, 0.32, 1] as const;

type Tab = "received" | "favorites";

/** Modèle unifié de carte, alimenté par les données réelles ou la démo. */
interface LikeItem {
  id: string;
  firstName: string;
  age: number | null;
  photo: string | null;
  locked: boolean;
}

/**
 * Hub « Mes likes » (« 10 »). Deux onglets sur un même fond premium :
 * - « Reçus » : qui m'a liké (`get_my_likers` + paywall Premium) ;
 * - « Favoris » : mes signets (`get_saved_favorites`), invisibles pour autrui.
 * Regroupe ce qui était auparavant deux écrans, dont l'un (favoris) n'était
 * plus accessible depuis la navigation — parité migration précédente.
 */
export function LikesScreen() {
  const [tab, setTab] = useState<Tab>("received");

  return (
    <div
      className="dark relative flex min-h-dvh flex-col overflow-hidden px-5 pt-[max(1.25rem,env(safe-area-inset-top))] pb-28 text-white"
      style={{
        background:
          "linear-gradient(158deg,#2E2440 0%,#3B2C5C 55%,#4A3C7A 100%)",
      }}
    >
      <div className="bg-accent/25 pointer-events-none absolute top-36 -right-24 size-72 rounded-full blur-3xl" />

      <header className="relative z-10">
        <h1 className="font-display text-center text-2xl font-extrabold">
          Mes likes
        </h1>
        <TabSwitch tab={tab} onChange={setTab} />
      </header>

      {tab === "received" ? <ReceivedPanel /> : <FavoritesPanel />}
    </div>
  );
}

/** Sélecteur segmenté « Reçus / Favoris », lisible sur le fond sombre. */
function TabSwitch({
  tab,
  onChange,
}: {
  tab: Tab;
  onChange: (tab: Tab) => void;
}) {
  const tabs: { key: Tab; label: string; Icon: typeof Heart }[] = [
    { key: "received", label: "Reçus", Icon: Heart },
    { key: "favorites", label: "Favoris", Icon: Bookmark },
  ];

  return (
    <div className="relative z-10 mx-auto mt-4 flex w-fit items-center gap-1 rounded-[var(--radius-pill)] border border-white/15 bg-white/10 p-1 backdrop-blur-md">
      {tabs.map(({ key, label, Icon }) => {
        const active = tab === key;
        return (
          <button
            key={key}
            type="button"
            onClick={() => onChange(key)}
            aria-pressed={active}
            className={cn(
              "relative flex items-center gap-1.5 rounded-[var(--radius-pill)] px-4 py-2 text-[0.82rem] font-bold whitespace-nowrap transition-colors",
              active ? "text-white" : "text-white/60 hover:text-white/85",
            )}
          >
            {active && (
              <m.span
                layoutId="likes-tab-active"
                className="gradient-signature shadow-brand absolute inset-0 -z-10 rounded-[var(--radius-pill)]"
                transition={{ type: "spring", stiffness: 420, damping: 34 }}
                aria-hidden
              />
            )}
            <Icon className="size-4" aria-hidden />
            {label}
          </button>
        );
      })}
    </div>
  );
}

/* ------------------------------- Onglet Reçus ------------------------------ */

function ReceivedPanel() {
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
    <>
      <p className="relative z-10 mt-3 text-center text-sm text-white/65">
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
    </>
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
    <m.div variants={variants} className="relative aspect-3/4">
      {/* Carte verrouillée : le clic invite à souscrire (on ne dévoile jamais
          le visage tant que le compte n'est pas Premium). */}
      <Link
        href={ROUTES.premium}
        aria-label="Débloquer avec Premium"
        className="relative block size-full overflow-hidden rounded-[var(--radius-lg)] shadow-xl active:scale-[0.98]"
      >
        {inner}
      </Link>
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

/* ------------------------------ Onglet Favoris ----------------------------- */

function FavoritesPanel() {
  const { isAuthenticated } = useAuth();
  const { data, isLoading } = useSavedFavorites();

  if (!isAuthenticated) {
    return (
      <div className="relative z-10 mt-16 flex flex-1 flex-col items-center justify-center text-center">
        <span className="grid size-16 place-items-center rounded-full bg-white/10">
          <Bookmark className="size-7" aria-hidden />
        </span>
        <p className="mt-4 max-w-[16rem] text-sm text-white/70">
          Connectez-vous pour retrouver les profils mis de côté.
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="relative z-10 mt-6 space-y-2.5">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="h-[76px] animate-pulse rounded-[var(--radius-md)] bg-white/10"
          />
        ))}
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="relative z-10 mt-16 flex flex-1 flex-col items-center justify-center text-center">
        <span className="grid size-16 place-items-center rounded-full bg-white/10">
          <Bookmark className="size-8" aria-hidden />
        </span>
        <p className="font-display mt-4 text-lg font-bold">
          Aucun favori pour l&apos;instant
        </p>
        <p className="mt-1 max-w-xs text-sm text-white/70">
          Depuis un profil, touchez « ⋯ » puis « Ajouter aux favoris » pour le
          retrouver ici.
        </p>
        <Link
          href={ROUTES.discover}
          className="glass mt-6 rounded-[var(--radius-pill)] border-white/25 bg-white/10 px-6 py-2.5 text-sm font-bold"
        >
          Découvrir des profils
        </Link>
      </div>
    );
  }

  return (
    <m.div
      initial="hidden"
      animate="show"
      variants={{ show: { transition: { staggerChildren: 0.05 } } }}
      className="relative z-10 mt-6 space-y-2.5"
    >
      {data.map((fav) => (
        <FavoriteRow key={fav.id} fav={fav} />
      ))}
    </m.div>
  );
}

function FavoriteRow({ fav }: { fav: SavedFavorite }) {
  const toggle = useToggleFavorite();

  return (
    <m.div
      variants={{
        hidden: { opacity: 0, y: 8 },
        show: { opacity: 1, y: 0, transition: { duration: 0.3 } },
      }}
      className="flex items-center gap-3 rounded-[var(--radius-md)] border border-white/12 bg-white/10 p-3 backdrop-blur-md"
    >
      <Link
        href={`${ROUTES.discover}/${fav.id}`}
        className="flex min-w-0 flex-1 items-center gap-3"
      >
        <span className="relative size-13 shrink-0 overflow-hidden rounded-[var(--radius-md)] bg-white/10">
          {fav.avatarUrl ? (
            <Image
              src={fav.avatarUrl}
              alt={fav.firstName}
              fill
              sizes="52px"
              className="object-cover"
            />
          ) : (
            <span className="font-display grid size-full place-items-center text-sm font-bold text-white/80">
              {initials(fav.firstName)}
            </span>
          )}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <span className="font-display truncate font-bold">
              {fav.firstName}
            </span>
            {fav.isVerified && (
              <Heart
                className="text-brand-300 size-3.5 fill-current"
                aria-hidden
              />
            )}
          </div>
          {fav.city && (
            <p className="truncate text-sm text-white/60">{fav.city}</p>
          )}
        </div>
      </Link>
      <button
        type="button"
        onClick={() => toggle.mutate({ targetId: fav.id, isFavorite: true })}
        disabled={toggle.isPending}
        aria-label={`Retirer ${fav.firstName} des favoris`}
        className="grid size-9 shrink-0 place-items-center rounded-full text-white/60 hover:text-white disabled:opacity-50"
      >
        <X className="size-5" aria-hidden />
      </button>
    </m.div>
  );
}
