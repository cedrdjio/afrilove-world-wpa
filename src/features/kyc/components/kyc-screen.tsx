"use client";

import { useMemo, useRef, useState } from "react";
import Image from "next/image";
import { BadgeCheck, Camera, Clock, Loader2, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/layout/page-header";
import { Spinner } from "@/components/ui/spinner";
import { useAuth } from "@/providers/auth-provider";
import { cn } from "@/lib/utils";

import { KYC_DOC_TYPES, type KycDocType, type KycPart } from "../service";
import { useKycStatus, useSubmitKyc } from "../hooks";

/**
 * Vérification d'identité (« KYC »). Choix du document, capture recto / verso /
 * selfie, puis soumission (`upload-kyc` + `kyc_submissions`). Les états déjà
 * vérifié / en attente / refusé sont gérés. Fonctionnalité portée du mobile.
 */
export function KycScreen() {
  const { profile } = useAuth();
  const { data: kyc, isLoading } = useKycStatus();

  if (profile?.is_verified) {
    return <StatusPanel variant="verified" />;
  }
  if (isLoading) {
    return (
      <Shell>
        <div className="mt-24 grid place-items-center">
          <Spinner />
        </div>
      </Shell>
    );
  }
  if (kyc?.status === "pending") {
    return <StatusPanel variant="pending" />;
  }

  return <KycForm rejectionReason={kyc?.rejectionReason ?? null} />;
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto w-full max-w-md px-5 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
      <PageHeader title="Vérifier mon compte" back center />
      {children}
    </div>
  );
}

function KycForm({ rejectionReason }: { rejectionReason: string | null }) {
  const submit = useSubmitKyc();
  const [docType, setDocType] = useState<KycDocType>("id_card");
  const [front, setFront] = useState<File | null>(null);
  const [back, setBack] = useState<File | null>(null);
  const [selfie, setSelfie] = useState<File | null>(null);

  const needsBack = docType !== "passport";
  const ready = front && selfie && (!needsBack || back);

  const onSubmit = () => {
    if (!front || !selfie) return;
    submit.mutate(
      { docType, front, back: needsBack ? back : null, selfie },
      {
        onSuccess: () =>
          toast.success("Demande envoyée ! Vérification sous 24–48 h."),
        onError: () =>
          toast.error("L'envoi a échoué. Vérifiez vos images et réessayez."),
      },
    );
  };

  return (
    <Shell>
      <div className="glass mt-4 flex items-start gap-3.5 rounded-[var(--radius-lg)] p-4">
        <span className="bg-accent/15 grid size-10 shrink-0 place-items-center rounded-[var(--radius-sm)]">
          <ShieldCheck className="text-primary size-5" aria-hidden />
        </span>
        <p className="text-muted-foreground text-sm leading-relaxed">
          Obtiens le badge vérifié et rassure tes rencontres. Tes documents sont
          privés et ne servent qu&apos;à la vérification.
        </p>
      </div>

      {rejectionReason && (
        <div className="border-danger/40 bg-danger/10 text-danger mt-4 rounded-[var(--radius-md)] border p-3.5 text-sm">
          <b className="font-display">Demande refusée.</b> {rejectionReason}
        </div>
      )}

      <h2 className="font-display mt-6 font-bold">Type de document</h2>
      <div className="mt-3 grid grid-cols-3 gap-2">
        {KYC_DOC_TYPES.map((d) => {
          const active = d.value === docType;
          return (
            <button
              key={d.value}
              type="button"
              aria-pressed={active}
              onClick={() => setDocType(d.value)}
              className={cn(
                "rounded-[var(--radius-md)] border px-2 py-3 text-center text-xs font-bold transition-colors",
                active
                  ? "gradient-signature border-transparent text-white"
                  : "border-border bg-muted/40 text-muted-foreground",
              )}
            >
              {d.label}
            </button>
          );
        })}
      </div>

      <div className="mt-6 space-y-3">
        <CaptureTile
          label={needsBack ? "Recto du document" : "Page du document"}
          part="front"
          file={front}
          onPick={setFront}
        />
        {needsBack && (
          <CaptureTile
            label="Verso du document"
            part="back"
            file={back}
            onPick={setBack}
          />
        )}
        <CaptureTile
          label="Selfie avec le document"
          part="selfie"
          file={selfie}
          onPick={setSelfie}
        />
      </div>

      <button
        type="button"
        onClick={onSubmit}
        disabled={!ready || submit.isPending}
        className="gradient-signature shadow-brand font-display mt-6 flex h-14 w-full items-center justify-center gap-2 rounded-[var(--radius-pill)] font-bold text-white active:scale-[0.98] disabled:opacity-50"
      >
        {submit.isPending ? (
          <>
            <Loader2 className="size-5 animate-spin" aria-hidden />
            Envoi…
          </>
        ) : (
          "Envoyer pour vérification"
        )}
      </button>
    </Shell>
  );
}

function CaptureTile({
  label,
  part,
  file,
  onPick,
}: {
  label: string;
  part: KycPart;
  file: File | null;
  onPick: (file: File) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const previewUrl = useMemo(
    () => (file ? URL.createObjectURL(file) : null),
    [file],
  );

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture={part === "selfie" ? "user" : "environment"}
        className="sr-only"
        onChange={(e) => {
          const picked = e.target.files?.[0];
          if (picked) onPick(picked);
          e.target.value = "";
        }}
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className={cn(
          "flex w-full items-center gap-3.5 rounded-[var(--radius-lg)] border p-3 text-left transition-colors",
          file
            ? "border-success/50 bg-success/5"
            : "border-accent/50 border-dashed bg-white/40 dark:bg-white/5",
        )}
      >
        <span className="bg-muted relative grid size-16 shrink-0 place-items-center overflow-hidden rounded-[var(--radius-md)]">
          {previewUrl ? (
            <Image
              src={previewUrl}
              alt={label}
              fill
              sizes="64px"
              className="object-cover"
              unoptimized
            />
          ) : (
            <Camera className="text-muted-foreground size-6" aria-hidden />
          )}
        </span>
        <span className="min-w-0 flex-1">
          <span className="font-display block text-sm font-bold">{label}</span>
          <span className="text-muted-foreground text-xs">
            {file ? "Touchez pour remplacer" : "Touchez pour ajouter une photo"}
          </span>
        </span>
        {file && <BadgeCheck className="text-success size-5" aria-hidden />}
      </button>
    </div>
  );
}

function StatusPanel({ variant }: { variant: "verified" | "pending" }) {
  const verified = variant === "verified";
  return (
    <Shell>
      <div className="mt-20 flex flex-col items-center text-center">
        <span
          className={cn(
            "grid size-20 place-items-center rounded-full text-white",
            verified ? "gradient-signature shadow-brand" : "bg-warning",
          )}
        >
          {verified ? (
            <BadgeCheck className="size-10" aria-hidden />
          ) : (
            <Clock className="size-10" aria-hidden />
          )}
        </span>
        <p className="font-display mt-5 text-xl font-extrabold">
          {verified ? "Compte vérifié" : "Vérification en cours"}
        </p>
        <p className="text-muted-foreground mt-2 max-w-xs text-sm leading-relaxed">
          {verified
            ? "Ton badge vérifié est actif. Tes rencontres te font davantage confiance."
            : "Nous examinons tes documents. Cela prend généralement 24 à 48 heures."}
        </p>
      </div>
    </Shell>
  );
}
