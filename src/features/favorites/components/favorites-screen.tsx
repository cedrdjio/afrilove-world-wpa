"use client";

import Link from "next/link";
import { m } from "framer-motion";
import { Bookmark, X } from "lucide-react";

import { PageHeader } from "@/components/layout/page-header";
import { Avatar } from "@/components/ui/avatar";
import { Spinner } from "@/components/ui/spinner";
import { VerifiedBadge } from "@/components/brand/verified-badge";
import { ROUTES } from "@/constants/routes";

import { useSavedFavorites, useToggleFavorite } from "../hooks";
import type { SavedFavorite } from "../service";

/**
 * Onglet « Favoris » (signets). Liste les profils mis de côté, invisible pour
 * les personnes concernées. Alimenté par `get_saved_favorites` ; on peut
 * retirer un favori à la volée.
 */
export function FavoritesScreen() {
  const { data, isLoading } = useSavedFavorites();

  return (
    <div className="mx-auto w-full max-w-md px-5 pb-28">
      <PageHeader title="Mes favoris" back center />

      {isLoading ? (
        <div className="mt-24 grid place-items-center">
          <Spinner />
        </div>
      ) : !data || data.length === 0 ? (
        <EmptyFavorites />
      ) : (
        <div className="mt-6 space-y-2.5">
          {data.map((fav, i) => (
            <FavoriteRow key={fav.id} fav={fav} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}

function FavoriteRow({ fav, index }: { fav: SavedFavorite; index: number }) {
  const toggle = useToggleFavorite();

  return (
    <m.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.3 }}
      className="glass flex items-center gap-3 rounded-[var(--radius-md)] p-3"
    >
      <Link
        href={`${ROUTES.discover}/${fav.id}`}
        className="flex min-w-0 flex-1 items-center gap-3"
      >
        <Avatar
          src={fav.avatarUrl}
          alt={fav.firstName}
          size={52}
          rounded="lg"
        />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <span className="font-display truncate font-bold">
              {fav.firstName}
            </span>
            {fav.isVerified && <VerifiedBadge size={16} />}
          </div>
          {fav.city && (
            <p className="text-muted-foreground truncate text-sm">{fav.city}</p>
          )}
        </div>
      </Link>
      <button
        type="button"
        onClick={() => toggle.mutate({ targetId: fav.id, isFavorite: true })}
        disabled={toggle.isPending}
        aria-label={`Retirer ${fav.firstName} des favoris`}
        className="text-muted-foreground hover:text-foreground grid size-9 shrink-0 place-items-center rounded-full disabled:opacity-50"
      >
        <X className="size-5" aria-hidden />
      </button>
    </m.div>
  );
}

function EmptyFavorites() {
  return (
    <div className="mt-24 flex flex-col items-center text-center">
      <span className="bg-accent/15 grid size-16 place-items-center rounded-full">
        <Bookmark className="text-primary size-8" aria-hidden />
      </span>
      <p className="font-display mt-4 text-lg font-bold">
        Aucun favori pour l&apos;instant
      </p>
      <p className="text-muted-foreground mt-1 max-w-xs text-sm">
        Depuis un profil, touchez « ⋯ » puis « Ajouter aux favoris » pour le
        retrouver ici.
      </p>
      <Link
        href={ROUTES.discover}
        className="gradient-signature mt-6 inline-block rounded-[var(--radius-pill)] px-6 py-2.5 text-sm font-bold text-white"
      >
        Découvrir des profils
      </Link>
    </div>
  );
}
