import { db } from "@/services/supabase/browser";

/** Type de pièce d'identité présentée pour la vérification. */
export type KycDocType = "id_card" | "passport" | "driver_license";

export const KYC_DOC_TYPES: { value: KycDocType; label: string }[] = [
  { value: "id_card", label: "Carte d'identité" },
  { value: "passport", label: "Passeport" },
  { value: "driver_license", label: "Permis de conduire" },
];

/** Partie de document téléversée (aligne l'en-tête `x-kyc-part`). */
export type KycPart = "front" | "back" | "selfie";

export type KycStatus = "none" | "pending" | "approved" | "rejected";

export interface KycState {
  status: KycStatus;
  rejectionReason: string | null;
}

/** Téléverse une image KYC via l'Edge Function `upload-kyc`, renvoie son chemin. */
async function uploadPart(file: Blob, part: KycPart): Promise<string> {
  const { data, error } = await db().functions.invoke("upload-kyc", {
    body: file,
    headers: { "x-kyc-part": part, "Content-Type": "image/jpeg" },
  });
  if (error) throw error;
  return (data as { path: string }).path;
}

/** Crée la demande de vérification (statut « pending », revue par un admin). */
async function submit(input: {
  docType: KycDocType;
  idFrontPath: string;
  idBackPath: string | null;
  selfiePath: string;
}): Promise<void> {
  const {
    data: { user },
  } = await db().auth.getUser();
  if (!user) throw new Error("Not authenticated");
  const { error } = await db().from("kyc_submissions").insert({
    profile_id: user.id,
    doc_type: input.docType,
    id_front_path: input.idFrontPath,
    id_back_path: input.idBackPath,
    selfie_path: input.selfiePath,
    status: "pending",
  });
  if (error) throw error;
}

/** État de la dernière demande de vérification du membre. */
async function fetchStatus(): Promise<KycState> {
  const { data, error } = await db()
    .from("kyc_submissions")
    .select("status, rejection_reason, submitted_at")
    .order("submitted_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  if (!data) return { status: "none", rejectionReason: null };
  return {
    status: (data.status as KycStatus) ?? "pending",
    rejectionReason: data.rejection_reason,
  };
}

export const kycService = {
  uploadPart,
  submit,
  fetchStatus,
};
