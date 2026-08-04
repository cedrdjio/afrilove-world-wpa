"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { AuthScreen } from "@/features/auth/components/auth-screen";
import {
  forgotPasswordSchema,
  otpSchema,
  type ForgotPasswordValues,
} from "@/features/auth/schema";
import { sendPasswordReset, verifyRecoveryOtp } from "@/features/auth/service";
import { useAuthFlowStore } from "@/features/auth/store";
import { GradientButton } from "@/components/ui/gradient-button";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { OtpInput } from "@/components/ui/otp-input";
import { ErrorState } from "@/components/feedback";
import { ROUTES } from "@/constants/routes";
import { mapToAppError, type AppError } from "@/lib/errors";
import { useHaptics } from "@/hooks/use-haptics";
import { useSupabase } from "@/providers/supabase-provider";

const RESEND_COOLDOWN_S = 60;

/**
 * Réinitialisation en deux temps, entièrement dans l'app — port de
 * `ForgotPasswordScreen` (mobile) : envoi de l'e-mail, puis saisie du code
 * qu'il contient (verifyOtp type recovery). Le lien de l'e-mail reste un
 * raccourci pour ceux dont le retour app fonctionne, mais le flux n'en dépend
 * plus. Une fois la session de récupération établie, le verrou `pendingRecovery`
 * force le routage vers « Nouveau mot de passe » jusqu'au changement effectif.
 */
export default function ForgotPasswordPage() {
  const supabase = useSupabase();
  const router = useRouter();
  const haptic = useHaptics();
  const setPendingRecovery = useAuthFlowStore((s) => s.setPendingRecovery);

  const [sentTo, setSentTo] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState<AppError | null>(null);
  const [cooldown, setCooldown] = useState(0);
  const [resendCount, setResendCount] = useState(0);

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  const codeValid = otpSchema.safeParse(code).success;

  async function sendTo(email: string): Promise<boolean> {
    setError(null);
    const { error: sendError } = await sendPasswordReset(supabase, email);
    if (sendError) {
      haptic("error");
      setError(mapToAppError(sendError));
      return false;
    }
    return true;
  }

  async function onSubmit(values: ForgotPasswordValues) {
    setSending(true);
    const email = values.email.trim().toLowerCase();
    const ok = await sendTo(email);
    setSending(false);
    if (!ok) return;
    haptic("success");
    setSentTo(email);
    setCooldown(RESEND_COOLDOWN_S);
  }

  async function handleResend() {
    if (!sentTo || cooldown > 0) return;
    setSending(true);
    const ok = await sendTo(sentTo);
    setSending(false);
    if (!ok) return;
    // Un renvoi invalide le code précédent — on efface la saisie.
    setCode("");
    setResendCount((n) => n + 1);
    setCooldown(RESEND_COOLDOWN_S);
  }

  async function handleVerify() {
    if (!sentTo || !codeValid) return;
    setVerifying(true);
    setError(null);
    const { error: verifyError } = await verifyRecoveryOtp(supabase, {
      email: sentTo,
      token: code,
    });
    setVerifying(false);
    if (verifyError) {
      haptic("error");
      setError(mapToAppError(verifyError));
      return;
    }
    haptic("success");
    // Session de récupération établie : on arme le verrou avant de router.
    setPendingRecovery(true);
    router.replace(ROUTES.resetPassword);
  }

  // Phase 2 : saisie du code reçu par e-mail.
  if (sentTo) {
    return (
      <AuthScreen
        title="Vérifiez vos e-mails"
        subtitle={
          <>
            Saisissez le code envoyé à{" "}
            <span className="text-foreground font-semibold">{sentTo}</span>, ou
            ouvrez directement le lien reçu.
          </>
        }
        backTo={ROUTES.login}
      >
        <div className="flex flex-1 flex-col gap-5">
          {error ? (
            <ErrorState
              error={error}
              inline
              onRetry={() => void handleVerify()}
            />
          ) : null}

          <OtpInput
            key={resendCount}
            onComplete={setCode}
            disabled={verifying}
          />

          <p className="text-muted-foreground text-center text-[12.5px]">
            {cooldown > 0 ? (
              `E-mail envoyé ! Nouvel envoi possible dans ${cooldown}s`
            ) : sending ? (
              "Envoi en cours…"
            ) : (
              <>
                Vous n’avez rien reçu ?{" "}
                <button
                  type="button"
                  onClick={() => void handleResend()}
                  className="text-primary font-semibold hover:underline"
                >
                  Renvoyer l’e-mail
                </button>
              </>
            )}
          </p>

          <GradientButton
            label="Valider le code"
            className="mt-auto"
            disabled={!codeValid}
            loading={verifying}
            onClick={() => void handleVerify()}
          />
        </div>
      </AuthScreen>
    );
  }

  // Phase 1 : saisie de l'e-mail.
  return (
    <AuthScreen
      title="Mot de passe oublié"
      subtitle="Saisissez votre e-mail : nous vous enverrons un code (et un lien) pour choisir un nouveau mot de passe."
      backTo={ROUTES.login}
    >
      <form
        onSubmit={handleSubmit(onSubmit)}
        noValidate
        className="flex flex-1 flex-col gap-5"
      >
        {error ? (
          <ErrorState
            error={error}
            inline
            onRetry={() => void onSubmit(getValues())}
          />
        ) : null}

        <Field
          label="Adresse e-mail"
          htmlFor="email"
          error={errors.email?.message}
        >
          <Input
            id="email"
            type="email"
            autoComplete="email"
            inputMode="email"
            placeholder="vous@exemple.com"
            invalid={!!errors.email}
            {...register("email")}
          />
        </Field>

        <Button
          type="submit"
          size="lg"
          block
          disabled={sending}
          className="mt-auto"
        >
          {sending ? "Envoi…" : "Envoyer le code"}
        </Button>
      </form>
    </AuthScreen>
  );
}
