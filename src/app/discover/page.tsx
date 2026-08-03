"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { BottomNav } from "@/components/layout/bottom-nav";
import { Spinner } from "@/components/ui/spinner";
import { ROUTES } from "@/constants/routes";
import { DiscoverScreen } from "@/features/discovery/components/discover-screen";
import { useAuth } from "@/providers/auth-provider";

/**
 * Découverte (« 04 »). Garde d'authentification + redirection onboarding
 * conservées ; le corps rend le deck de swipe immersif.
 */
export default function DiscoverPage() {
  const router = useRouter();
  const { user, profile, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && profile && !profile.onboarding_completed) {
      router.replace(ROUTES.onboarding);
    }
  }, [isLoading, profile, router]);

  if (isLoading || !user || (profile && !profile.onboarding_completed)) {
    return (
      <div className="grid min-h-dvh place-items-center">
        <Spinner />
      </div>
    );
  }

  return (
    <>
      <DiscoverScreen />
      <BottomNav />
    </>
  );
}
