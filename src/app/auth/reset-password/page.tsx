"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { AuthScreen } from "@/features/auth/components/auth-screen";
import {
  resetPasswordSchema,
  type ResetPasswordValues,
} from "@/features/auth/schema";
import { authErrorMessage, updatePassword } from "@/features/auth/service";
import { useAuthFlowStore } from "@/features/auth/store";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { PasswordInput } from "@/components/ui/password-input";
import { Spinner } from "@/components/ui/spinner";
import { ROUTES } from "@/constants/routes";
import { useAuth } from "@/providers/auth-provider";
import { useHaptics } from "@/hooks/use-haptics";
import { useSupabase } from "@/providers/supabase-provider";

export default function ResetPasswordPage() {
  const supabase = useSupabase();
  const router = useRouter();
  const params = useSearchParams();
  const haptic = useHaptics();
  const { user, isLoading } = useAuth();
  const setPendingRecovery = useAuthFlowStore((s) => s.setPendingRecovery);
  const [pending, setPending] = useState(false);
  const fromRecoveryLink = params.get("recovery") === "1";

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: "", confirmPassword: "" },
  });

  // Le lien de récupération (`recovery=1`) ouvre une session : on arme le
  // verrou pour que la résolution reste sur cet écran tant que le mot de passe
  // n'est pas changé (parité `pendingAction=recovery` mobile). Le chemin OTP
  // (forgot-password) a déjà armé le verrou avant de naviguer ici.
  useEffect(() => {
    if (user && fromRecoveryLink) setPendingRecovery(true);
  }, [user, fromRecoveryLink, setPendingRecovery]);

  async function onSubmit(values: ResetPasswordValues) {
    setPending(true);
    const { error } = await updatePassword(supabase, values.password);
    if (error) {
      setPending(false);
      haptic("error");
      toast.error(authErrorMessage(error) ?? "Mise à jour impossible.");
      return;
    }
    haptic("success");
    // Le verrou a fait son office : on le lève, puis écran de succès (contexte
    // reset) → résolution → app.
    setPendingRecovery(false);
    router.replace(`${ROUTES.authSuccess}?context=reset`);
  }

  if (isLoading) {
    return (
      <AuthScreen title="Réinitialisation" backTo={ROUTES.login}>
        <div className="grid flex-1 place-items-center">
          <Spinner />
        </div>
      </AuthScreen>
    );
  }

  if (!user) {
    return (
      <AuthScreen
        title="Lien invalide ou expiré"
        subtitle="Ce lien de réinitialisation n’est plus valide. Demandez-en un nouveau."
        backTo={ROUTES.login}
      >
        <Link href={ROUTES.forgotPassword} className="mt-auto w-full">
          <Button size="lg" block>
            Demander un nouveau lien
          </Button>
        </Link>
      </AuthScreen>
    );
  }

  return (
    <AuthScreen
      title="Nouveau mot de passe"
      subtitle="Choisissez un mot de passe sécurisé pour votre compte."
      backTo={ROUTES.login}
    >
      <form
        onSubmit={handleSubmit(onSubmit)}
        noValidate
        className="flex flex-1 flex-col gap-5"
      >
        <Field
          label="Nouveau mot de passe"
          htmlFor="password"
          error={errors.password?.message}
          hint="8 caractères minimum."
        >
          <PasswordInput
            id="password"
            autoComplete="new-password"
            placeholder="••••••••"
            invalid={!!errors.password}
            {...register("password")}
          />
        </Field>

        <Field
          label="Confirmer le mot de passe"
          htmlFor="confirmPassword"
          error={errors.confirmPassword?.message}
        >
          <PasswordInput
            id="confirmPassword"
            autoComplete="new-password"
            placeholder="••••••••"
            invalid={!!errors.confirmPassword}
            {...register("confirmPassword")}
          />
        </Field>

        <Button
          type="submit"
          size="lg"
          block
          disabled={pending}
          className="mt-auto"
        >
          {pending ? "Enregistrement…" : "Enregistrer"}
        </Button>
      </form>
    </AuthScreen>
  );
}
