"use client";

import { useState } from "react";
import { AnimatePresence, m } from "framer-motion";
import { Bookmark, Flag, Loader2, ShieldX } from "lucide-react";
import { toast } from "sonner";

import { useToggleFavorite } from "@/features/favorites/hooks";
import { useBlockProfile, useReportProfile } from "@/features/moderation/hooks";
import {
  REPORT_REASONS,
  type ReportReason,
} from "@/features/moderation/service";

/**
 * Feuille d'actions secondaires d'un profil (bouton « ⋯ ») : mise en favori,
 * blocage et signalement. Portée depuis l'app mobile, câblée sur les tables
 * `profile_favorites`, `blocks` et `reports`.
 */
export function ProfileActionSheet({
  targetId,
  firstName,
  isFavorite,
  onClose,
  onBlocked,
}: {
  targetId: string;
  firstName: string;
  isFavorite: boolean;
  onClose: () => void;
  onBlocked: () => void;
}) {
  const toggleFavorite = useToggleFavorite();
  const block = useBlockProfile();
  const [reporting, setReporting] = useState(false);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[80] flex items-end justify-center">
        <button
          type="button"
          aria-label="Fermer"
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />
        <m.div
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ type: "spring", damping: 30, stiffness: 300 }}
          className="text-foreground bg-background relative z-10 w-full max-w-md rounded-t-[var(--radius-xl)] px-4 pt-4 pb-[max(1.5rem,env(safe-area-inset-bottom))]"
        >
          <div className="mx-auto mb-4 h-1.5 w-10 rounded-full bg-black/15 dark:bg-white/20" />

          {reporting ? (
            <ReportPanel
              targetId={targetId}
              firstName={firstName}
              onDone={onClose}
              onBack={() => setReporting(false)}
            />
          ) : (
            <div className="flex flex-col">
              <SheetButton
                icon={
                  <Bookmark
                    className={isFavorite ? "size-5 fill-current" : "size-5"}
                    aria-hidden
                  />
                }
                label={
                  isFavorite ? "Retirer des favoris" : "Ajouter aux favoris"
                }
                busy={toggleFavorite.isPending}
                onClick={() =>
                  toggleFavorite.mutate(
                    { targetId, isFavorite },
                    {
                      onSuccess: () => {
                        toast.success(
                          isFavorite
                            ? "Retiré de vos favoris"
                            : "Ajouté à vos favoris",
                        );
                        onClose();
                      },
                    },
                  )
                }
              />
              <SheetButton
                icon={<Flag className="size-5" aria-hidden />}
                label="Signaler ce profil"
                onClick={() => setReporting(true)}
              />
              <SheetButton
                icon={<ShieldX className="size-5" aria-hidden />}
                label={`Bloquer ${firstName}`}
                tone="danger"
                busy={block.isPending}
                onClick={() =>
                  block.mutate(targetId, {
                    onSuccess: () => {
                      toast.success(`${firstName} a été bloqué·e.`);
                      onBlocked();
                    },
                    onError: () =>
                      toast.error("Blocage impossible. Réessayez."),
                  })
                }
              />
              <button
                type="button"
                onClick={onClose}
                className="text-muted-foreground mt-2 h-12 rounded-[var(--radius-md)] text-sm font-bold"
              >
                Annuler
              </button>
            </div>
          )}
        </m.div>
      </div>
    </AnimatePresence>
  );
}

function ReportPanel({
  targetId,
  firstName,
  onDone,
  onBack,
}: {
  targetId: string;
  firstName: string;
  onDone: () => void;
  onBack: () => void;
}) {
  const report = useReportProfile();

  const submit = (reason: ReportReason) => {
    report.mutate(
      { targetId, reason },
      {
        onSuccess: () => {
          toast.success("Signalement envoyé. Merci de nous aider.");
          onDone();
        },
        onError: () => toast.error("Envoi impossible. Réessayez."),
      },
    );
  };

  return (
    <div>
      <h2 className="font-display px-2 text-lg font-extrabold">
        Signaler {firstName}
      </h2>
      <p className="text-muted-foreground mt-1 px-2 text-sm">
        Choisissez un motif. Votre signalement reste anonyme.
      </p>
      <div className="mt-3 flex flex-col">
        {REPORT_REASONS.map((r) => (
          <SheetButton
            key={r.value}
            label={r.label}
            busy={report.isPending}
            onClick={() => submit(r.value)}
          />
        ))}
        <button
          type="button"
          onClick={onBack}
          className="text-muted-foreground mt-2 h-12 rounded-[var(--radius-md)] text-sm font-bold"
        >
          Retour
        </button>
      </div>
    </div>
  );
}

function SheetButton({
  icon,
  label,
  onClick,
  busy = false,
  tone = "default",
}: {
  icon?: React.ReactNode;
  label: string;
  onClick: () => void;
  busy?: boolean;
  tone?: "default" | "danger";
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={busy}
      className={`flex h-14 items-center gap-3.5 rounded-[var(--radius-md)] px-4 text-left text-[0.95rem] font-semibold transition-colors active:bg-black/5 disabled:opacity-50 dark:active:bg-white/5 ${
        tone === "danger" ? "text-danger" : ""
      }`}
    >
      {busy ? <Loader2 className="size-5 animate-spin" aria-hidden /> : icon}
      {label}
    </button>
  );
}
