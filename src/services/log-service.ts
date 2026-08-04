import { createClient } from "@/services/supabase/client";

type LogLevel = "info" | "warn" | "error";

/**
 * Journal applicatif — port de `shared/services/logService.ts` (mobile).
 * Trace en base (table `client_logs`) les événements importants : crashs,
 * étapes de paiement, erreurs marquantes. Consultable par les admins et par le
 * membre dans Paramètres → Journal (Jalon 12), sans outil externe.
 *
 * Fire-and-forget : ne bloque jamais l'UI et n'échoue jamais visiblement
 * (un journal qui plante l'app serait pire que pas de journal). RLS : seule
 * une insertion pour son propre `profile_id` est autorisée.
 *
 * À n'appeler que côté client (navigateur) — s'appuie sur la session cookie.
 */
export function logEvent(
  level: LogLevel,
  event: string,
  message?: string,
  context?: Record<string, unknown>,
): void {
  void (async () => {
    try {
      const supabase = createClient();
      const { data } = await supabase.auth.getSession();
      const profileId = data.session?.user.id;
      if (!profileId) return; // RLS : insertion propre uniquement

      await supabase.from("client_logs").insert({
        profile_id: profileId,
        level,
        event,
        message: message?.slice(0, 1000) ?? null,
        context: (context ?? null) as never,
      });
    } catch {
      // silencieux par design
    }
  })();
}
