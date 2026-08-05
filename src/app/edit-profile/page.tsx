"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { Spinner } from "@/components/ui/spinner";
import { ROUTES } from "@/constants/routes";
import { EditProfileScreen } from "@/features/profile/components/edit-profile-screen";
import { useAuth } from "@/providers/auth-provider";

/**
 * « Modifier mon profil ». Garde d'authentification ; renvoie vers l'onboarding
 * tant qu'il n'est pas terminé (l'édition suppose un profil déjà créé).
 */
export default function EditProfilePage() {
  const router = useRouter();
  const { user, profile, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && profile && !profile.onboarding_completed) {
      router.replace(ROUTES.onboarding);
    }
  }, [isLoading, profile, router]);

  if (isLoading || !user) {
    return (
      <div className="grid min-h-dvh place-items-center">
        <Spinner />
      </div>
    );
  }

  return <EditProfileScreen />;
}
