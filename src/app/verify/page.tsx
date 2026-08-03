"use client";

import { Spinner } from "@/components/ui/spinner";
import { KycScreen } from "@/features/kyc/components/kyc-screen";
import { useAuth } from "@/providers/auth-provider";

export default function VerifyPage() {
  const { user, isLoading } = useAuth();

  if (isLoading || !user) {
    return (
      <div className="grid min-h-dvh place-items-center">
        <Spinner />
      </div>
    );
  }

  return <KycScreen />;
}
