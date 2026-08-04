"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { ScreenBackground } from "@/components/layout/screen-background";
import { Spinner } from "@/components/ui/spinner";
import { queryRoots } from "@/lib/query-keys";
import { ROUTES } from "@/constants/routes";
import { useSupabase } from "@/providers/supabase-provider";
import {
  PENDING_PAYMENT_KEY,
  pollUntilResolved,
} from "@/features/premium/payments/camerpay-provider";

/**
 * Retour de paiement — port de `premium/callback` (mobile). Utilisé dans le
 * repli redirection pleine page (fenêtre CamerPay bloquée) : on reprend le
 * polling du statut de la transaction en attente, puis on route selon l'issue.
 * Le statut réel est réglé côté serveur (webhook / payment-status).
 */
export default function PremiumCallbackPage() {
  const router = useRouter();
  const supabase = useSupabase();
  const queryClient = useQueryClient();

  useEffect(() => {
    let raw: string | null = null;
    try {
      raw = sessionStorage.getItem(PENDING_PAYMENT_KEY);
      if (raw) sessionStorage.removeItem(PENDING_PAYMENT_KEY);
    } catch {
      raw = null;
    }

    if (!raw) {
      router.replace(ROUTES.premium);
      return;
    }

    let pending: { transactionUuid?: string; planLabel?: string } = {};
    try {
      pending = JSON.parse(raw);
    } catch {
      pending = {};
    }
    const transactionUuid = pending.transactionUuid;
    if (!transactionUuid) {
      router.replace(ROUTES.premium);
      return;
    }

    let cancelled = false;
    void (async () => {
      const result = await pollUntilResolved(supabase, transactionUuid, 90_000);
      if (cancelled) return;
      if (result?.outcome === "succeeded") {
        queryClient.invalidateQueries({ queryKey: [queryRoots.entitlements] });
        queryClient.invalidateQueries({ queryKey: [queryRoots.likers] });
        router.replace(
          `${ROUTES.premiumSuccess}?plan=${encodeURIComponent(pending.planLabel ?? "Premium")}`,
        );
      } else if (result?.outcome === "failed") {
        router.replace(ROUTES.premiumFailed);
      } else {
        toast("Paiement en cours", {
          description:
            "Votre accès Premium s'activera dès confirmation du paiement.",
        });
        router.replace(ROUTES.discover);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [router, supabase, queryClient]);

  return (
    <div className="relative flex min-h-dvh items-center justify-center">
      <ScreenBackground theme="deep" />
      <div className="relative z-10 flex flex-col items-center">
        <Spinner className="size-8 border-white/30 border-t-white" />
        <p className="mt-4 text-[13px] text-white/55">
          Confirmation du paiement…
        </p>
      </div>
    </div>
  );
}
