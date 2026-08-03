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
import { DEMO_ME } from "@/features/profiles/data";
import { useAuth } from "@/providers/auth-provider";

function ageFrom(birthDate: string | null): number | null {
  if (!birthDate) return null;
  return Math.floor((Date.now() - new Date(birthDate).getTime()) / 3.15576e10);
}

/**
 * « Mon profil » (« 08 »). Garde d'authentification + redirection onboarding
 * conservées ; les données Supabase réelles alimentent le view-model, avec
 * repli sur les valeurs de démonstration pour les champs non renseignés.
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

  const city =
    [profile.city, profile.country].filter(Boolean).join(", ") ||
    `${DEMO_ME.origin} · vit à ${DEMO_ME.city}`;

  const vm: ProfileViewModel = {
    firstName: profile.first_name ?? DEMO_ME.firstName,
    age: ageFrom(profile.birth_date) ?? DEMO_ME.age,
    city,
    avatar: profile.avatar_url ?? DEMO_ME.avatar,
    bio: profile.bio ?? DEMO_ME.bio,
    verified: profile.is_verified ?? DEMO_ME.verified,
    completion: profile.profile_completed ? 100 : DEMO_ME.completion,
    stats: stats ?? DEMO_ME.stats,
  };

  return (
    <>
      <MyProfileScreen vm={vm} />
      <BottomNav />
    </>
  );
}
