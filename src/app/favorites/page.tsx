"use client";

import { Spinner } from "@/components/ui/spinner";
import { BottomNav } from "@/components/layout/bottom-nav";
import { FavoritesScreen } from "@/features/favorites/components/favorites-screen";
import { useAuth } from "@/providers/auth-provider";

export default function FavoritesPage() {
  const { user, isLoading } = useAuth();

  if (isLoading || !user) {
    return (
      <div className="grid min-h-dvh place-items-center">
        <Spinner />
      </div>
    );
  }

  return (
    <>
      <FavoritesScreen />
      <BottomNav />
    </>
  );
}
