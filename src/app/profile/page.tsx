"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { BottomNav } from "@/components/layout/bottom-nav";
import { Spinner } from "@/components/ui/spinner";
import { ROUTES } from "@/constants/routes";
import {
  MyProfileScreen,
  type ProfileViewModel,
} from "@/features/profile/components/my-profile-screen";
import { useProfileStats } from "@/features/profile/hooks";
import { useAuth } from "@/providers/auth-provider";

function ageFrom(birthDate: string | null): number | null {
  if (!birthDate) return null;
  return Math.floor((Date.now() - new Date(birthDate).getTime()) / 3.15576e10);
}

/** Complétion réelle estimée à partir des champs clés renseignés (aucune
 *  valeur de démonstration en production). */
function completionOf(p: {
  first_name: string | null;
  bio: string | null;
  avatar_url: string | null;
  birth_date: string | null;
  city: string | null;
}): number {
  const filled = [
    p.first_name,
    p.bio,
    p.avatar_url,
    p.birth_date,
    p.city,
  ].filter(Boolean).length;
  return Math.round((filled / 5) * 100);
}

/**
 * « Mon profil » (« 08 »). Garde d'authentification + redirection onboarding
 * conservées ; le view-model est alimenté UNIQUEMENT par les données Supabase
 * réelles. Aucun repli sur des données de démonstration : un vrai utilisateur
 * ne doit jamais voir de fausses statistiques, ville ou photo.
 */
export default function ProfilePage() {
  const router = useRouter();
  const { user, profile, isLoading } = useAuth();
  const { data: stats } = useProfileStats();

  useEffect(() => {
    if (!isLoading && profile && !profile.onboarding_completed) {
      router.replace(ROUTES.onboarding);
    }
  }, [isLoading, profile, router]);

  if (isLoading || !user || !profile || !profile.onboarding_completed) {
    return (
      <div className="grid min-h-dvh place-items-center">
        <Spinner />
      </div>
    );
  }

  const city = [profile.city, profile.country].filter(Boolean).join(", ");

  const vm: ProfileViewModel = {
    firstName: profile.first_name ?? "",
    age: ageFrom(profile.birth_date),
    city,
    avatar: profile.avatar_url ?? null,
    bio: profile.bio ?? "",
    verified: profile.is_verified ?? false,
    completion: profile.profile_completed ? 100 : completionOf(profile),
    stats: stats ?? { views: 0, likes: 0, matches: 0 },
  };

  return (
    <>
      <MyProfileScreen vm={vm} />
      <BottomNav />
    </>
  );
}
