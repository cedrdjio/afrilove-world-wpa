"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

import { toast } from "sonner";

import { ROUTES } from "@/constants/routes";
import { useAuth } from "@/providers/auth-provider";
import { useHaptics } from "@/hooks/use-haptics";
import { findProfile } from "@/features/profiles/data";
import { useFavoriteIds, useToggleFavorite } from "@/features/favorites/hooks";
import { useBlockProfile } from "@/features/moderation/hooks";
import { useConversationsQuery } from "@/features/messaging/hooks";

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
    photos: profile.photos,
    verified: profile.verified,
    online: profile.online,
    locationLine: `${profile.origin} · vit à ${profile.city} · à ${profile.distanceKm} km`,
    profession: null,
    bio: profile.bio,
    gender: profile.gender,
    heightCm: null,
    education: null,
    religion: null,
    smoking: null,
    drinking: null,
    gymHabit: null,
    hasPets: null,
    wantsChildren: null,
    interests: profile.interests.map((label) => ({ label, icon: null })),
    languages: [],
    privatePhotoCount: 0,
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
      onReport={() => toast("Connectez-vous pour signaler ce profil.")}
      onBlock={() => toast("Connectez-vous pour bloquer ce profil.")}
    />
  );
}

function RealProfileDetail({ id }: { id: string }) {
  const router = useRouter();
  const haptic = useHaptics();
  const { profile: me } = useAuth();
  const { data, isLoading } = usePublicProfile(id);
  const { data: conversations } = useConversationsQuery();
  const swipeMutation = useSwipe();
  const block = useBlockProfile();
  const favoriteIds = useFavoriteIds();
  const toggleFavorite = useToggleFavorite();
  const [match, setMatch] = useState<MatchView | null>(null);
  const [sheet, setSheet] = useState<"closed" | "menu" | "report">("closed");

  // Conversation déjà ouverte avec cette personne (match existant) ?
  const existingConversation = conversations?.find((c) => c.partnerId === id);

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
    photos: p.photos,
    verified: p.verified,
    online: p.online,
    locationLine: [
      p.city,
      p.country,
      p.distanceKm != null ? `à ${Math.round(p.distanceKm)} km` : null,
    ]
      .filter(Boolean)
      .join(" · "),
    profession: p.profession,
    bio: p.bio,
    gender: p.gender,
    heightCm: p.heightCm,
    education: p.education,
    religion: p.religion,
    smoking: p.smoking,
    drinking: p.drinking,
    gymHabit: p.gymHabit,
    hasPets: p.hasPets,
    wantsChildren: p.wantsChildren,
    interests: p.interests,
    languages: p.languages,
    // L'album privé (18+) n'est pas exposé par `get_public_profile` :
    // pas de tuile verrouillée tant que la fonctionnalité n'est pas branchée.
    privatePhotoCount: 0,
  };

  const doBlock = () => {
    haptic("warning");
    block.mutate(id, {
      onSuccess: () => {
        toast.success(`${p.firstName} a été bloqué·e.`);
        router.push(ROUTES.discover);
      },
      onError: () => toast.error("Blocage impossible. Réessayez."),
    });
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
        toast.success(`Like envoyé à ${p.firstName} 💜`);
        router.push(ROUTES.discover);
      }
    });
  };

  // « Message » : ouvre la conversation si un match existe déjà, sinon envoie un
  // like pour tenter de connecter (on ne peut discuter qu'une fois le match fait).
  const onMessage = () => {
    haptic("light");
    if (existingConversation) {
      router.push(`${ROUTES.messages}/${existingConversation.matchId}`);
      return;
    }
    doSwipe("like", (isMatch, matchId) => {
      if (isMatch && matchId) {
        setMatch({
          conversationId: matchId,
          firstName: p.firstName,
          photo: p.photos[0] ?? null,
        });
      } else {
        toast(
          `Like envoyé à ${p.firstName}. Vous pourrez discuter dès que c'est réciproque.`,
        );
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
        onMessage={onMessage}
        messageLabel={existingConversation ? "Ouvrir le chat" : "Message"}
        onOptions={() => setSheet("menu")}
        onReport={() => setSheet("report")}
        onBlock={doBlock}
        onUnlockPrivate={() => router.push(ROUTES.premium)}
        isFavorite={favoriteIds.has(id)}
        favoriteBusy={toggleFavorite.isPending}
        onToggleFavorite={() => {
          const isFavorite = favoriteIds.has(id);
          haptic(isFavorite ? "light" : "success");
          toggleFavorite.mutate(
            { targetId: id, isFavorite },
            {
              onSuccess: () =>
                toast.success(
                  isFavorite ? "Retiré de vos favoris" : "Ajouté à vos favoris",
                ),
            },
          );
        }}
      />
      {sheet !== "closed" && (
        <ProfileActionSheet
          targetId={id}
          firstName={p.firstName}
          isFavorite={favoriteIds.has(id)}
          initialView={sheet === "report" ? "report" : "menu"}
          onClose={() => setSheet("closed")}
          onBlocked={() => {
            setSheet("closed");
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
