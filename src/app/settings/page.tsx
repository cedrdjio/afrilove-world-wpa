"use client";

import { Spinner } from "@/components/ui/spinner";
import { SettingsScreen } from "@/features/settings/components/settings-screen";
import { useAuth } from "@/providers/auth-provider";

export default function SettingsPage() {
  const { user, isLoading, signOut } = useAuth();

  if (isLoading || !user) {
    return (
      <div className="grid min-h-dvh place-items-center">
        <Spinner />
      </div>
    );
  }

  return <SettingsScreen onSignOut={() => void signOut()} />;
}
