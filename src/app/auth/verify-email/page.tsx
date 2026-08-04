"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { AuthScreen } from "@/features/auth/components/auth-screen";
import { otpSchema } from "@/features/auth/schema";
import { resendSignupEmail, verifySignupOtp } from "@/features/auth/service";
import { GradientButton } from "@/components/ui/gradient-button";
import { OtpInput } from "@/components/ui/otp-input";
import { ErrorState } from "@/components/feedback";
import { ROUTES } from "@/constants/routes";
import { mapToAppError } from "@/lib/errors";
import { useHaptics } from "@/hooks/use-haptics";
import { useSupabase } from "@/providers/supabase-provider";

const RESEND_COOLDOWN_S = 60;

/**
 * Vérification d'e-mail à l'inscription — port de `VerifyEmailScreen` (mobile).
 * Saisie du code reçu (verifyOtp type signup), indépendante du retour du lien
 * navigateur, avec renvoi limité à un par minute (parité GoTrue). Le lien reçu
 * par e-mail reste un raccourci pour ceux dont le retour app fonctionne.
 */
export default function VerifyEmailPage() {
  const supabase = useSupabase();
  const router = useRouter();
  const params = useSearchParams();
  const haptic = useHaptics();
  const email = params.get("email") ?? "";

  const [code, setCode] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState<ReturnType<typeof mapToAppError> | null>(
    null,
  );
  const [cooldown, setCooldown] = useState(0);
  // Change de clé à chaque renvoi pour remonter un OtpInput vide.
  const [resendCount, setResendCount] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  const codeValid = otpSchema.safeParse(code).success;

  async function handleVerify() {
    if (!email || !codeValid) return;
    setVerifying(true);
    setError(null);
    const { error: verifyError } = await verifySignupOtp(supabase, {
      email,
      token: code,
    });
    setVerifying(false);
    if (verifyError) {
      haptic("error");
      setError(mapToAppError(verifyError));
      return;
    }
    haptic("success");
    router.replace(ROUTES.authSuccess);
  }

  async function handleResend() {
    if (!email || cooldown > 0) return;
    setResending(true);
    setError(null);
    const { error: resendError } = await resendSignupEmail(supabase, email);
    setResending(false);
    if (resendError) {
      haptic("error");
      setError(mapToAppError(resendError));
      return;
    }
    // Un renvoi invalide le code précédent — on efface la saisie.
    setCode("");
    setResendCount((n) => n + 1);
    setCooldown(RESEND_COOLDOWN_S);
  }

  return (
    <AuthScreen
      title="Vérifiez votre e-mail"
      subtitle={
        <>
          Saisissez le code envoyé à{" "}
          <span className="text-foreground font-semibold">
            {email || "votre adresse e-mail"}
          </span>
          , ou ouvrez directement le lien reçu par e-mail.
        </>
      }
      backTo={ROUTES.register}
    >
      <div className="flex flex-1 flex-col gap-5">
        {error ? (
          <ErrorState
            error={error}
            inline
            onRetry={() => void handleVerify()}
          />
        ) : null}

        <OtpInput key={resendCount} onComplete={setCode} disabled={verifying} />

        <p className="text-muted-foreground text-center text-[12.5px]">
          {cooldown > 0 ? (
            `Code renvoyé ! Nouvel envoi possible dans ${cooldown}s`
          ) : resending ? (
            "Envoi en cours…"
          ) : (
            <>
              Vous n’avez rien reçu ?{" "}
              <button
                type="button"
                onClick={() => void handleResend()}
                className="text-primary font-semibold hover:underline"
              >
                Renvoyer le code
              </button>
            </>
          )}
        </p>

        <GradientButton
          label="Vérifier"
          className="mt-auto"
          disabled={!codeValid}
          loading={verifying}
          onClick={() => void handleVerify()}
        />
      </div>
    </AuthScreen>
  );
}
