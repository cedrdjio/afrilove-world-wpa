"use client";

import Image from "next/image";
import { m } from "framer-motion";
import { ShieldOff } from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/layout/page-header";
import { Spinner } from "@/components/ui/spinner";
import { initials } from "@/utils/format";
import {
  useBlockedProfiles,
  useUnblockProfile,
} from "@/features/moderation/hooks";
import type { BlockedProfile } from "@/features/moderation/service";

/** « Utilisateurs bloqués » : liste des membres bloqués + déblocage. */
export function BlockedScreen() {
  const { data, isLoading } = useBlockedProfiles();

  return (
    <div className="mx-auto w-full max-w-md px-5 pb-16">
      <PageHeader title="Utilisateurs bloqués" back />

      {isLoading ? (
        <div className="mt-24 grid place-items-center">
          <Spinner />
        </div>
      ) : !data || data.length === 0 ? (
        <EmptyBlocked />
      ) : (
        <div className="mt-6 space-y-2.5">
          {data.map((profile, i) => (
            <BlockedRow key={profile.id} profile={profile} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}

function BlockedRow({
  profile,
  index,
}: {
  profile: BlockedProfile;
  index: number;
}) {
  const unblock = useUnblockProfile();

  return (
    <m.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.3 }}
      className="glass flex items-center gap-3 rounded-[var(--radius-md)] p-3"
    >
      <span className="bg-muted relative size-12 shrink-0 overflow-hidden rounded-[var(--radius-md)]">
        {profile.avatarUrl ? (
          <Image
            src={profile.avatarUrl}
            alt={profile.firstName}
            fill
            sizes="48px"
            className="object-cover"
          />
        ) : (
          <span className="text-muted-foreground font-display grid size-full place-items-center text-sm font-bold">
            {initials(profile.firstName)}
          </span>
        )}
      </span>
      <div className="min-w-0 flex-1">
        <div className="font-display truncate font-bold">
          {profile.firstName || "Membre"}
        </div>
        <div className="text-muted-foreground text-sm">Bloqué</div>
      </div>
      <button
        type="button"
        onClick={() =>
          unblock.mutate(profile.id, {
            onSuccess: () => toast.success(`${profile.firstName} débloqué·e.`),
            onError: () => toast.error("Déblocage impossible. Réessayez."),
          })
        }
        disabled={unblock.isPending}
        className="border-border text-foreground hover:bg-muted shrink-0 rounded-[var(--radius-pill)] border px-4 py-2 text-sm font-bold disabled:opacity-50"
      >
        Débloquer
      </button>
    </m.div>
  );
}

function EmptyBlocked() {
  return (
    <div className="mt-24 flex flex-col items-center text-center">
      <span className="bg-accent/15 grid size-16 place-items-center rounded-full">
        <ShieldOff className="text-primary size-8" aria-hidden />
      </span>
      <p className="font-display mt-4 text-lg font-bold">
        Aucun utilisateur bloqué
      </p>
      <p className="text-muted-foreground mt-1 max-w-xs text-sm">
        Les personnes que vous bloquez depuis un profil apparaîtront ici.
      </p>
    </div>
  );
}
