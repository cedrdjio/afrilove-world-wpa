"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { m } from "framer-motion";
import {
  Star,
  BadgeCheck,
  Lock,
  ChevronRight,
  Bookmark,
  Search as SearchIcon,
} from "lucide-react";

import { ScreenBackground } from "@/components/layout/screen-background";
import { GlowOrb } from "@/components/layout/glow-orb";
import { Avatar } from "@/components/ui/avatar";
import { Spinner } from "@/components/ui/spinner";
import { EmptyState } from "@/components/feedback";
import { ROUTES } from "@/constants/routes";
import { isRecentlyOnline } from "@/lib/presence";
import {
  useSavedFavorites,
  useToggleFavorite,
} from "@/features/favorites/hooks/use-favorites";
import {
  useEntitlements,
  useLikers,
} from "@/features/premium/hooks/use-entitlements";
import { useConversationsQuery } from "@/features/messaging/hooks/use-messaging";
import { usePresenceStore } from "@/features/presence/store";

type MatchesTab = "matchs" | "favoris";

function SectionTitle({ children }: { children: string }) {
  return (
    <p className="font-display text-foreground/60 mb-3 text-[13px]">
      {children}
    </p>
  );
}

export default function MatchesPage() {
  const router = useRouter();
  const [tab, setTab] = useState<MatchesTab>("matchs");

  const entitlements = useEntitlements();
  const isPremium = entitlements.data?.isPremium ?? false;
  const likersCount = entitlements.data?.likersCount ?? 0;
  const likersQuery = useLikers(isPremium);

  // Favoris = signets gardés depuis Découvrir (table profile_favorites), pas
  // les likes envoyés — deux notions distinctes.
  const favoritesQuery = useSavedFavorites();
  const toggleFavorite = useToggleFavorite();

  // Matchs = conversations (un match surface via `get_my_conversations`).
  const conversationsQuery = useConversationsQuery();
  const onlineIds = usePresenceStore((s) => s.onlineIds);

  const likers = likersQuery.data ?? [];
  const favorites = favoritesQuery.data ?? [];
  const matches = conversationsQuery.data ?? [];
  const newMatchesCount = matches.filter((mtc) => !mtc.lastMessage).length;

  const openPremium = () => router.push(ROUTES.premium);

  return (
    <div className="relative flex flex-1 flex-col">
      <ScreenBackground theme="cream">
        <GlowOrb
          size={230}
          color="rgba(106,79,192,0.09)"
          top={-50}
          right={-50}
          duration={9.5}
        />
      </ScreenBackground>

      <div className="relative z-10 px-[22px] pt-8">
        <div className="mb-[18px] flex items-center justify-between">
          <h1 className="font-display text-foreground text-[30px]">
            Mes Matches
          </h1>
          {newMatchesCount > 0 ? (
            <span className="bg-brand-500/10 text-brand-600 font-display rounded-full px-3 py-1.5 text-[11.5px]">
              {newMatchesCount} nouveaux
            </span>
          ) : null}
        </div>

        <button
          type="button"
          onClick={() => router.push(ROUTES.matchesSearch)}
          className="border-border/70 bg-card/45 mb-4 flex w-full items-center gap-2.5 rounded-2xl border-[1.5px] px-4 py-3.5 text-left"
        >
          <SearchIcon
            className="text-muted-foreground size-4 shrink-0"
            aria-hidden
          />
          <span className="text-foreground/30 text-[13px]">
            Rechercher un match…
          </span>
        </button>

        {/* Onglets Matchs | Favoris */}
        <div className="border-border/70 bg-card/45 mb-5 flex rounded-full border-[1.5px] p-1">
          {(
            [
              { key: "matchs", label: "Matchs" },
              {
                key: "favoris",
                label: `Favoris${favorites.length > 0 ? ` (${favorites.length})` : ""}`,
              },
            ] as { key: MatchesTab; label: string }[]
          ).map(({ key, label }) => {
            const active = tab === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => setTab(key)}
                className={`font-display flex-1 rounded-full py-[9px] text-center text-[12.5px] transition-colors ${
                  active
                    ? "gradient-signature text-white"
                    : "text-foreground/45"
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {tab === "matchs" ? (
        <div className="relative z-10 flex-1 px-[22px] pb-4">
          {/* Qui vous a aimé — Premium ; sinon un rappel discret. */}
          {isPremium && likers.length > 0 ? (
            <>
              <SectionTitle>Qui vous a aimé</SectionTitle>
              <div className="mb-6 flex flex-wrap gap-2.5">
                {likers.slice(0, 12).map((liker, index) => (
                  <m.button
                    key={liker.id}
                    type="button"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: Math.min(index, 6) * 0.05 }}
                    onClick={() => router.push(`/profile/${liker.id}`)}
                    className="flex w-[72px] flex-col items-center gap-1.5"
                  >
                    <span className="relative">
                      <Avatar
                        src={liker.avatarUrl ?? undefined}
                        seed={liker.firstName}
                        size={72}
                        ringColor={
                          liker.action === "super_like" ? "#D99B2B" : "#6A4FC0"
                        }
                      />
                      {liker.action === "super_like" ? (
                        <span className="absolute -right-0.5 -bottom-0.5 grid size-6 place-items-center rounded-full bg-[#D99B2B]">
                          <Star
                            className="size-[11px] fill-current text-white"
                            aria-hidden
                          />
                        </span>
                      ) : null}
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="font-display text-foreground truncate text-[10px]">
                        {liker.firstName}
                      </span>
                      {liker.isVerified ? (
                        <BadgeCheck
                          className="size-[9px] text-[#D99B2B]"
                          strokeWidth={2.8}
                          aria-hidden
                        />
                      ) : null}
                    </span>
                  </m.button>
                ))}
              </div>
            </>
          ) : likersCount > 0 ? (
            <button
              type="button"
              onClick={openPremium}
              className="border-border/70 bg-card/45 mb-6 flex w-full items-center gap-3 rounded-2xl border-[1.5px] px-4 py-3 text-left"
            >
              <span className="bg-brand-500/10 grid size-9 place-items-center rounded-full">
                <Lock
                  className="text-brand-600 size-3.5"
                  strokeWidth={2.2}
                  aria-hidden
                />
              </span>
              <span className="text-muted-foreground flex-1 text-[12.5px]">
                <span className="text-foreground font-display font-semibold">
                  {likersCount}
                </span>{" "}
                personne{likersCount > 1 ? "s" : ""} t
                {likersCount > 1 ? "'ont" : "'a"} liké — visible avec Premium
              </span>
              <ChevronRight className="text-foreground/25 size-4" aria-hidden />
            </button>
          ) : null}

          {/* Nouveaux matchs — rangée d'avatars (un tap ouvre le chat). */}
          {conversationsQuery.isLoading ? (
            <div className="flex justify-center pt-6">
              <Spinner className="size-8" />
            </div>
          ) : matches.length === 0 ? (
            <EmptyState
              title="Pas encore de match"
              description="Continuez à explorer pour trouver vos premiers matches."
              actionLabel="Découvrir des profils"
              onAction={() => router.push(ROUTES.discover)}
            />
          ) : (
            <>
              <SectionTitle>Nouveaux matchs</SectionTitle>
              <div className="-mx-[22px] flex gap-3.5 overflow-x-auto px-[22px] pb-2">
                {matches.map((item, index) => (
                  <m.button
                    key={item.matchId}
                    type="button"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: Math.min(index, 8) * 0.05 }}
                    onClick={() => router.push(`/chat/${item.matchId}`)}
                    className="flex w-[62px] shrink-0 flex-col items-center gap-1.5"
                  >
                    <Avatar
                      src={item.partnerAvatarUrl ?? undefined}
                      seed={item.partnerFirstName}
                      size={62}
                      ringColor={
                        onlineIds.has(item.partnerId) ||
                        isRecentlyOnline(item.partnerLastActiveAt)
                          ? "#3ECf8E"
                          : "#D99B2B"
                      }
                    />
                    <span className="font-display text-foreground w-full truncate text-center text-[10px]">
                      {item.partnerFirstName}
                    </span>
                  </m.button>
                ))}
              </div>
            </>
          )}
        </div>
      ) : (
        <div className="relative z-10 flex-1 px-[22px] pb-4">
          {favoritesQuery.isLoading ? (
            <div className="flex justify-center pt-10">
              <Spinner className="size-8" />
            </div>
          ) : favorites.length === 0 ? (
            <EmptyState
              icon={
                <Bookmark
                  className="text-primary size-8"
                  strokeWidth={1.6}
                  aria-hidden
                />
              }
              title="Aucun favori"
              description="Dans Découvrir, touchez le signet sur un profil qui vous plaît : il restera ici."
              actionLabel="Découvrir des profils"
              onAction={() => router.push(ROUTES.discover)}
            />
          ) : (
            favorites.map((favorite, index) => (
              <m.div
                key={favorite.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(index, 8) * 0.045 }}
              >
                <div className="border-border/70 bg-card/45 mb-2 flex items-center gap-3.5 rounded-2xl border-[1.5px] px-4 py-3">
                  <button
                    type="button"
                    onClick={() => router.push(`/profile/${favorite.id}`)}
                    className="flex flex-1 items-center gap-3.5 text-left"
                  >
                    <Avatar
                      src={favorite.avatarUrl ?? undefined}
                      seed={favorite.firstName}
                      size={46}
                    />
                    <span className="flex-1">
                      <span className="flex items-center gap-1.5">
                        <span className="font-display text-foreground text-[13.5px]">
                          {favorite.firstName}
                        </span>
                        {favorite.isVerified ? (
                          <BadgeCheck
                            className="size-[11px] text-[#D99B2B]"
                            strokeWidth={2.7}
                            aria-hidden
                          />
                        ) : null}
                      </span>
                      {favorite.city ? (
                        <span className="text-muted-foreground block text-[11.5px]">
                          {favorite.city}
                        </span>
                      ) : null}
                    </span>
                  </button>
                  <button
                    type="button"
                    aria-label="Retirer des favoris"
                    onClick={() =>
                      toggleFavorite.mutate({
                        targetId: favorite.id,
                        isFavorite: true,
                      })
                    }
                    className="text-brand-600 shrink-0"
                  >
                    <Bookmark
                      className="size-[17px] fill-current"
                      aria-hidden
                    />
                  </button>
                </div>
              </m.div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
