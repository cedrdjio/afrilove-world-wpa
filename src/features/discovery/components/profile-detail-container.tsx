"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

import { ROUTES } from "@/constants/routes";
import { useAuth } from "@/providers/auth-provider";
import { useHaptics } from "@/hooks/use-haptics";
import { findProfile } from "@/features/profiles/data";
import { useFavoriteIds } from "@/features/favorites/hooks";

import { discoveryService } from "../service";
import { usePublicProfile, useSwipe } from "../hooks";
import type { SwipeAction } from "../types";
import { ProfileDetail, type ProfileDetailView } from "./profile-detail";
import { ProfileActionSheet } from "./profile-action-sheet";
import { MatchOverlayView, type MatchView } from "./match-overlay";

/**
 * Fiche profil : données réelles (`get_public_profile`) pour un membre
 * connecté, ou données de démo pour l'aperçu design. L'UI reste identique
 * (`ProfileDetail` présentationnel).
 */
export function ProfileDetailContainer({ id }: { id: string }) {
  const { isAuthenticated } = useAuth();
  if (isAuthenticated) return <RealProfileDetail id={id} />;
  return <DemoProfileDetail id={id} />;
}

function DemoProfileDetail({ id }: { id: string }) {
  const router = useRouter();
  const haptic = useHaptics();
  const profile = findProfile(id);
  if (!profile) return <NotFoundProfile />;

  const view: ProfileDetailView = {
    id: profile.id,
    firstName: profile.firstName,
    age: profile.age,
    heroPhoto: profile.photos[0],
    verified: profile.verified,
    locationLine: `${profile.origin} · vit à ${profile.city} · à ${profile.distanceKm} km`,
    bio: profile.bio,
    interests: profile.interests,
    stats: [
      { value: `${profile.compatibility}%`, label: "compatibilité" },
      { value: String(profile.mutualFriends), label: "amis en commun" },
    ],
  };

  return (
    <ProfileDetail
      view={view}
      onBack={() => router.back()}
      onPass={() => {
        haptic("light");
        router.push(ROUTES.discover);
      }}
      onLike={() => {
        haptic("success");
        router.push(ROUTES.discover);
      }}
      onMessage={() => router.push(`${ROUTES.messages}/${profile.id}`)}
    />
  );
}

function RealProfileDetail({ id }: { id: string }) {
  const router = useRouter();
  const haptic = useHaptics();
  const { profile: me } = useAuth();
  const { data, isLoading } = usePublicProfile(id);
  const swipeMutation = useSwipe();
  const favoriteIds = useFavoriteIds();
  const [match, setMatch] = useState<MatchView | null>(null);
  const [optionsOpen, setOptionsOpen] = useState(false);

  useEffect(() => {
    discoveryService.recordView(id).catch(() => {});
  }, [id]);

  if (isLoading) {
    return (
      <div className="grid min-h-dvh place-items-center">
        <Loader2 className="text-muted-foreground size-6 animate-spin" />
      </div>
    );
  }
  if (!data) return <NotFoundProfile />;

  const p = data;
  const view: ProfileDetailView = {
    id: p.id,
    firstName: p.firstName,
    age: p.age,
    heroPhoto: p.photos[0] ?? null,
    verified: p.verified,
    locationLine: [
      p.city,
      p.country,
      p.distanceKm != null ? `à ${Math.round(p.distanceKm)} km` : null,
    ]
      .filter(Boolean)
      .join(" · "),
    bio: p.bio,
    interests: p.interests,
    stats: p.profession ? [{ value: p.profession, label: "profession" }] : [],
  };

  const doSwipe = (
    action: SwipeAction,
    after: (isMatch: boolean, matchId: string | null) => void,
  ) => {
    swipeMutation.mutate(
      { targetId: id, action },
      { onSuccess: (res) => after(res.isMatch, res.matchId) },
    );
  };

  const onLike = () => {
    haptic("success");
    doSwipe("like", (isMatch, matchId) => {
      if (isMatch && matchId) {
        setMatch({
          conversationId: matchId,
          firstName: p.firstName,
          photo: p.photos[0] ?? null,
        });
      } else {
        router.push(ROUTES.discover);
      }
    });
  };

  return (
    <>
      <ProfileDetail
        view={view}
        onBack={() => router.back()}
        onPass={() => {
          haptic("light");
          doSwipe("pass", () => router.push(ROUTES.discover));
        }}
        onLike={onLike}
        onMessage={onLike}
        onOptions={() => setOptionsOpen(true)}
      />
      {optionsOpen && (
        <ProfileActionSheet
          targetId={id}
          firstName={p.firstName}
          isFavorite={favoriteIds.has(id)}
          onClose={() => setOptionsOpen(false)}
          onBlocked={() => {
            setOptionsOpen(false);
            router.push(ROUTES.discover);
          }}
        />
      )}
      <MatchOverlayView
        match={match}
        myPhoto={me?.avatar_url ?? null}
        onClose={() => {
          setMatch(null);
          router.push(ROUTES.discover);
        }}
      />
    </>
  );
}

function NotFoundProfile() {
  return (
    <div className="mx-auto grid min-h-dvh max-w-md place-items-center px-6 text-center">
      <div>
        <p className="text-muted-foreground text-sm">
          Ce profil est introuvable.
        </p>
        <Link
          href={ROUTES.discover}
          className="gradient-signature mt-5 inline-block rounded-[var(--radius-pill)] px-6 py-2.5 text-sm font-bold text-white"
        >
          Retour à la découverte
        </Link>
      </div>
    </div>
  );
}
