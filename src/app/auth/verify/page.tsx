import {
  VerifyOtpScreen,
  type VerifyMode,
} from "@/features/auth/components/verify-otp-screen";

/**
 * L'e-mail et le mode sont lus CÔTÉ SERVEUR depuis les paramètres de requête :
 * le rendu est donc dynamique et l'écran correct est présent dès le HTML
 * initial. (Avec `useSearchParams()` côté client, le pré-rendu statique
 * affichait « Lien incomplet » tant que le JS n'était pas hydraté — visible
 * sur connexion lente.)
 */
export default async function VerifyOtpPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string; type?: string }>;
}) {
  const { email, type } = await searchParams;
  const mode: VerifyMode = type === "recovery" ? "recovery" : "signup";
  return <VerifyOtpScreen email={email ?? null} mode={mode} />;
}
