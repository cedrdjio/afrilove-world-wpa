"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MailCheck } from "lucide-react";
import { toast } from "sonner";

import { AuthScreen } from "@/features/auth/components/auth-screen";
import { OtpInput } from "@/features/auth/components/otp-input";
import {
  authErrorMessage,
  resendSignupOtp,
  sendPasswordReset,
  verifyRecoveryOtp,
  verifySignupOtp,
} from "@/features/auth/service";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes";
import { useHaptics } from "@/hooks/use-haptics";
import { useSupabase } from "@/providers/supabase-provider";

export type VerifyMode = "signup" | "recovery";

/** Longueur minimale avant d'activer « Vérifier » (OTP e-mail Supabase = 6). */
const MIN_OTP_LENGTH = 6;
const RESEND_COOLDOWN = 60;

/**
 * Écran de saisie du code (inscription ou récupération). Tout se joue dans
 * l'app : on ne dépend jamais du clic sur un lien reçu par e-mail. Le succès
 * ouvre la session, puis on route vers l'onboarding (inscription) ou l'écran
 * « Nouveau mot de passe » (récupération).
 */
export function VerifyOtpScreen({
  email,
  mode,
}: {
  email: string | null;
  mode: VerifyMode;
}) {
  const supabase = useSupabase();
  const router = useRouter();
  const haptic = useHaptics();
  const [code, setCode] = useState("");
  const [pending, setPending] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  const isSignup = mode === "signup";

  if (!email) {
    return (
      <AuthScreen
        title="Lien incomplet"
        subtitle="Reprenez depuis le début pour recevoir un nouveau code."
        backTo={isSignup ? ROUTES.register : ROUTES.forgotPassword}
      >
        <Link
          href={isSignup ? ROUTES.register : ROUTES.forgotPassword}
          className="mt-auto w-full"
        >
          <Button size="lg" block>
            {isSignup ? "Créer mon compte" : "Réessayer"}
          </Button>
        </Link>
      </AuthScreen>
    );
  }

  async function onVerify() {
    if (!email || code.length < MIN_OTP_LENGTH || pending) return;
    setPending(true);
    setError(null);
    const { error: err } = isSignup
      ? await verifySignupOtp(supabase, { email, token: code })
      : await verifyRecoveryOtp(supabase, { email, token: code });
    if (err) {
      setPending(false);
      haptic("error");
      const message = authErrorMessage(err) ?? "Vérification impossible.";
      setError(message);
      toast.error(message);
      return;
    }
    haptic("success");
    // Session ouverte : la destination réelle est arbitrée par la garde de la
    // page cible (onboarding renvoie vers découverte si déjà complété).
    router.replace(isSignup ? ROUTES.onboarding : ROUTES.resetPassword);
  }

  async function onResend() {
    if (!email || cooldown > 0 || resending) return;
    setResending(true);
    setError(null);
    const { error: err } = isSignup
      ? await resendSignupOtp(supabase, email)
      : await sendPasswordReset(supabase, email);
    setResending(false);
    if (err) {
      haptic("error");
      toast.error(authErrorMessage(err) ?? "Envoi impossible.");
      return;
    }
    // Renvoyer invalide l'ancien code : on efface la saisie en cours.
    setCode("");
    setCooldown(RESEND_COOLDOWN);
    toast.success("Nouveau code envoyé.");
  }

  return (
    <AuthScreen
      title={isSignup ? "Vérifiez votre e-mail" : "Code de récupération"}
      subtitle={
        <>
          Saisissez le code envoyé à{" "}
          <span className="text-foreground font-semibold">{email}</span>.
        </>
      }
      backTo={isSignup ? ROUTES.register : ROUTES.forgotPassword}
    >
      <div className="flex flex-1 flex-col gap-5">
        <span className="gradient-signature shadow-brand grid size-14 place-items-center rounded-[var(--radius-lg)] text-white">
          <MailCheck className="size-7" aria-hidden />
        </span>

        <OtpInput
          value={code}
          onChange={(next) => {
            setCode(next);
            if (error) setError(null);
          }}
          invalid={!!error}
          autoFocus
        />

        {error ? (
          <p className="text-danger -mt-2 text-sm font-medium">{error}</p>
        ) : null}

        <p className="text-muted-foreground text-center text-sm">
          {cooldown > 0 ? (
            `Nouvel envoi possible dans ${cooldown}s`
          ) : resending ? (
            "Envoi en cours…"
          ) : (
            <>
              Vous n’avez rien reçu ?{" "}
              <button
                type="button"
                onClick={onResend}
                className="text-primary font-semibold hover:underline"
              >
                Renvoyer le code
              </button>
            </>
          )}
        </p>

        <Button
          type="button"
          size="lg"
          block
          onClick={onVerify}
          disabled={code.length < MIN_OTP_LENGTH || pending}
          className="mt-auto"
        >
          {pending ? "Vérification…" : "Vérifier"}
        </Button>
      </div>
    </AuthScreen>
  );
}
