"use client";

import { Spinner } from "@/components/ui/spinner";
import { PasswordScreen } from "@/features/settings/components/password-screen";
import { useAuth } from "@/providers/auth-provider";

export default function PasswordPage() {
  const { user, isLoading } = useAuth();

  if (isLoading || !user) {
    return (
      <div className="grid min-h-dvh place-items-center">
        <Spinner />
      </div>
    );
  }

  return <PasswordScreen />;
}
