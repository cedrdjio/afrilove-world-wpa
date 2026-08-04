import { type createClient } from "@/services/supabase/client";
import { env } from "@/lib/env";

type Client = ReturnType<typeof createClient>;

/**
 * Enregistrement Web Push — équivalent web de `pushService` (mobile).
 *
 * Sur mobile, `registerDevice` obtient un jeton Expo Push et l'enregistre dans
 * `push_tokens` ; le trigger DB `send_push_on_notification` diffuse ensuite
 * chaque notification in-app vers les appareils enregistrés. Ici, l'appareil
 * est le navigateur : on s'abonne au `PushManager` du service worker (clé
 * publique VAPID) et on stocke la souscription (endpoint + clés) comme `token`,
 * `platform = 'web'`. Le service worker (`public/sw.js`) affiche les pushes
 * reçus et route les clics — pendant du `usePushNavigation` mobile.
 *
 * Sans clé VAPID publique configurée (`NEXT_PUBLIC_VAPID_PUBLIC_KEY`), la
 * fonction ne fait rien silencieusement — exactement comme le mobile no-op
 * sans `projectId` EAS. Le parcours n'est jamais bloqué.
 */

/** Décode une clé VAPID base64url en octets pour `applicationServerKey`. */
function urlBase64ToUint8Array(base64: string): Uint8Array<ArrayBuffer> {
  const padding = "=".repeat((4 - (base64.length % 4)) % 4);
  const normalized = (base64 + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(normalized);
  // Adossé à un ArrayBuffer explicite : `applicationServerKey` exige un
  // BufferSource sur ArrayBuffer (et non ArrayBufferLike) avec la lib TS récente.
  const output = new Uint8Array(new ArrayBuffer(raw.length));
  for (let i = 0; i < raw.length; i += 1) output[i] = raw.charCodeAt(i);
  return output;
}

function pushSupported(): boolean {
  return (
    typeof window !== "undefined" &&
    "serviceWorker" in navigator &&
    "PushManager" in window &&
    "Notification" in window
  );
}

export async function registerDevice(
  supabase: Client,
  userId: string,
): Promise<boolean> {
  try {
    const vapidKey = env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
    if (!pushSupported() || !vapidKey) return false;

    // La permission est DEMANDÉE ici si elle ne l'a jamais été : beaucoup de
    // comptes n'ont jamais vu (ou ont passé) l'étape « notifications » de
    // l'onboarding. Un refus explicite est respecté — on n'insiste pas.
    let permission = Notification.permission;
    if (permission === "default")
      permission = await Notification.requestPermission();
    if (permission !== "granted") return false;

    const registration = await navigator.serviceWorker.ready;

    // Réutilise la souscription existante si présente ; sinon en crée une.
    const subscription =
      (await registration.pushManager.getSubscription()) ??
      (await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidKey),
      }));

    const { error } = await supabase.from("push_tokens").upsert(
      {
        token: JSON.stringify(subscription.toJSON()),
        profile_id: userId,
        platform: "web",
        updated_at: new Date().toISOString(),
      },
      { onConflict: "token" },
    );
    return !error;
  } catch {
    return false;
  }
}

/** Coupe les pushes vers ce navigateur — à appeler avant la déconnexion. */
export async function unregisterDevice(
  supabase: Client,
  userId: string,
): Promise<void> {
  try {
    if (pushSupported()) {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      if (subscription) {
        const token = JSON.stringify(subscription.toJSON());
        await subscription.unsubscribe().catch(() => false);
        await supabase.from("push_tokens").delete().eq("token", token);
        return;
      }
    }
    // Repli : purge toutes les souscriptions du compte sur cet appareil.
    await supabase.from("push_tokens").delete().eq("profile_id", userId);
  } catch {
    // La déconnexion ne doit jamais être bloquée par le nettoyage push.
  }
}
