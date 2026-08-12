"use client";

import { Spinner } from "@/components/ui/spinner";
import { BlockedScreen } from "@/features/settings/components/blocked-screen";
import { useAuth } from "@/providers/auth-provider";

export default function BlockedPage() {
  const { user, isLoading } = useAuth();

  if (isLoading || !user) {
    return (
      <div className="grid min-h-dvh place-items-center">
        <Spinner />
      </div>
    );
  }

  return <BlockedScreen />;
}
