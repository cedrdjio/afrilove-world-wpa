"use client";

import { RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";

/** Recharge la page courante — utile depuis le repli hors-ligne du SW. */
export function RetryButton() {
  return (
    <Button
      size="lg"
      onClick={() => window.location.reload()}
      className="gap-2"
    >
      <RefreshCw className="size-5" aria-hidden />
      Réessayer
    </Button>
  );
}
