"use client";

import { useState } from "react";
import { Ban, Trash2, Flag } from "lucide-react";
import { toast } from "sonner";

import { Drawer, DrawerContent } from "@/components/ui/drawer";
import { Spinner } from "@/components/ui/spinner";
import {
  useBlockUser,
  useUnmatch,
} from "@/features/moderation/hooks/use-moderation";
import type { Conversation } from "@/features/messaging/types";

interface ConversationActionSheetProps {
  conversation: Conversation;
  onClose: () => void;
}

type Confirming = "block" | "unmatch" | null;

/**
 * Feuille d'actions d'une conversation — port de `ConversationActionSheet`
 * (mobile) : bloquer, signaler, supprimer la conversation. Les confirmations
 * destructrices (Alert natif du mobile) sont rendues en ligne dans la feuille.
 * « Signaler » ouvrira l'écran de signalement au Jalon 12.
 */
export function ConversationActionSheet({
  conversation,
  onClose,
}: ConversationActionSheetProps) {
  const blockUser = useBlockUser();
  const unmatch = useUnmatch();
  const [confirming, setConfirming] = useState<Confirming>(null);

  const handleBlock = () => {
    blockUser.mutate(conversation.partnerId, {
      onSuccess: () =>
        toast.success("Profil bloqué", {
          description: `${conversation.partnerFirstName} ne peut plus vous contacter.`,
        }),
      onSettled: () => onClose(),
    });
  };

  const handleUnmatch = () => {
    unmatch.mutate(conversation.matchId, { onSettled: () => onClose() });
  };

  return (
    <Drawer open onOpenChange={(open) => (!open ? onClose() : undefined)}>
      <DrawerContent>
        <p className="font-display text-foreground/35 mb-3 text-[11px]">
          {conversation.partnerFirstName}
        </p>

        {confirming === null ? (
          <div className="flex flex-col">
            <button
              type="button"
              onClick={() => setConfirming("block")}
              className="border-foreground/[0.06] flex items-center gap-3.5 border-b py-4 text-left"
            >
              <span className="bg-danger/10 grid size-9 place-items-center rounded-full">
                <Ban className="text-danger size-4" aria-hidden />
              </span>
              <span className="text-foreground font-display text-[14px] font-semibold">
                Bloquer
              </span>
            </button>

            <button
              type="button"
              onClick={() => {
                onClose();
                toast("Modération bientôt disponible", {
                  description: "L'écran de signalement arrive au Jalon 12.",
                });
              }}
              className="border-foreground/[0.06] flex items-center gap-3.5 border-b py-4 text-left"
            >
              <span className="bg-danger/10 grid size-9 place-items-center rounded-full">
                <Flag className="text-danger size-4" aria-hidden />
              </span>
              <span className="text-foreground font-display text-[14px] font-semibold">
                Signaler
              </span>
            </button>

            <button
              type="button"
              onClick={() => setConfirming("unmatch")}
              className="flex items-center gap-3.5 py-4 text-left"
            >
              <span className="bg-danger/10 grid size-9 place-items-center rounded-full">
                <Trash2 className="text-danger size-4" aria-hidden />
              </span>
              <span className="text-danger font-display text-[14px] font-semibold">
                Supprimer la conversation
              </span>
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <p className="text-foreground text-[14px] leading-[20px]">
              {confirming === "block"
                ? `Bloquer ${conversation.partnerFirstName} ? Cette personne disparaîtra de vos conversations et découvertes, et ne pourra plus vous contacter.`
                : "Supprimer la conversation ? Le match et tous les messages seront définitivement supprimés."}
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setConfirming(null)}
                className="border-border/70 bg-card/50 text-foreground font-display flex-1 rounded-2xl border-[1.5px] py-3.5 text-[14px] font-bold"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={confirming === "block" ? handleBlock : handleUnmatch}
                disabled={blockUser.isPending || unmatch.isPending}
                className="bg-danger font-display flex flex-1 items-center justify-center rounded-2xl py-3.5 text-[14px] font-bold text-white disabled:opacity-60"
              >
                {blockUser.isPending || unmatch.isPending ? (
                  <Spinner className="size-5 border-white/40 border-t-white" />
                ) : confirming === "block" ? (
                  "Bloquer"
                ) : (
                  "Supprimer"
                )}
              </button>
            </div>
          </div>
        )}
      </DrawerContent>
    </Drawer>
  );
}
