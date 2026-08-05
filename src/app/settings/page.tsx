"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Spinner } from "@/components/ui/spinner";
import { SettingsScreen } from "@/features/settings/components/settings-screen";
import { deleteMyAccount } from "@/features/settings/account-service";
import { DEMO_ME } from "@/features/profiles/data";
import { ROUTES } from "@/constants/routes";
import { useAuth } from "@/providers/auth-provider";

export default function SettingsPage() {
  const router = useRouter();
  const { user, profile, isLoading, signOut } = useAuth();
  const [deleting, setDeleting] = useState(false);

  if (isLoading || !user) {
    return (
      <div className="grid min-h-dvh place-items-center">
        <Spinner />
      </div>
    );
  }

  const name =
    [profile?.first_name, profile?.last_name].filter(Boolean).join(" ") ||
    user.email ||
    DEMO_ME.firstName;

  return (
    <SettingsScreen
      name={name}
      avatar={profile?.avatar_url ?? null}
      onSignOut={() => {
        void signOut().then(() => router.replace(ROUTES.login));
      }}
      deleting={deleting}
      onDeleteAccount={() => {
        setDeleting(true);
        deleteMyAccount()
          .then(() => router.replace(ROUTES.login))
          .catch(() => {
            setDeleting(false);
            toast.error("Suppression impossible. Réessayez.");
          });
      }}
    />
  );
}
