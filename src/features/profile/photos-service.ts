import { db } from "@/services/supabase/browser";

/** Une photo de profil telle que stockée (`profile_photos`). */
export interface ProfilePhoto {
  id: string;
  url: string;
  position: number;
  isPrimary: boolean;
}

async function fetchPhotos(): Promise<ProfilePhoto[]> {
  const {
    data: { user },
  } = await db().auth.getUser();
  if (!user) return [];
  const { data, error } = await db()
    .from("profile_photos")
    .select("id, url, position, is_primary")
    .eq("profile_id", user.id)
    .order("position");
  if (error) throw error;
  return (data ?? []).map((row) => ({
    id: row.id,
    url: row.url,
    position: row.position,
    isPrimary: row.is_primary,
  }));
}

/**
 * Ajoute une photo via l'Edge Function `upload-photo` (écriture Storage côté
 * serveur en S3, insertion RLS de la ligne `profile_photos`).
 */
async function addPhoto(file: Blob, position: number): Promise<ProfilePhoto> {
  const { data, error } = await db().functions.invoke("upload-photo", {
    body: file,
    headers: {
      "x-upload-mode": "add",
      "x-upload-position": String(position),
      "Content-Type": "image/jpeg",
    },
  });
  if (error) throw error;
  const row = data as {
    id: string;
    url: string;
    position: number;
    is_primary: boolean;
  };
  return {
    id: row.id,
    url: row.url,
    position: row.position,
    isPrimary: row.is_primary,
  };
}

/** Supprime une photo (RLS : seul le propriétaire peut supprimer sa ligne). */
async function deletePhoto(id: string): Promise<void> {
  const { error } = await db().from("profile_photos").delete().eq("id", id);
  if (error) throw error;
}

/**
 * Réordonne : réécrit `position` pour chaque photo (la première devient la
 * photo principale). Passé l'ordre complet des identifiants.
 */
async function reorder(orderedIds: string[]): Promise<void> {
  const client = db();
  await Promise.all(
    orderedIds.map((id, index) =>
      client
        .from("profile_photos")
        .update({ position: index, is_primary: index === 0 })
        .eq("id", id),
    ),
  );
}

export const photosService = {
  fetchPhotos,
  addPhoto,
  deletePhoto,
  reorder,
};
