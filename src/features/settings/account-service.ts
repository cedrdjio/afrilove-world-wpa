import { db } from "@/services/supabase/browser";

/**
 * Suppression de compte « self-service ». Le garde `guard_account_status`
 * autorise la transition `active → deleted` par le membre lui-même : on marque
 * le profil comme supprimé (soft-delete : il sort de la découverte, des
 * messages et des recherches via la RLS), puis on ferme la session.
 */
export async function deleteMyAccount(): Promise<void> {
  const {
    data: { user },
  } = await db().auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { error } = await db()
    .from("profiles")
    .update({ account_status: "deleted" })
    .eq("id", user.id);
  if (error) throw error;

  await db().auth.signOut();
}
