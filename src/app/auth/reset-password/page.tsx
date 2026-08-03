"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { AuthScreen } from "@/features/auth/components/auth-screen";
import {
  resetPasswordSchema,
  type ResetPasswordValues,
} from "@/features/auth/schema";
import { authErrorMessage, updatePassword } from "@/features/auth/service";
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
  const haptic = useHaptics();
  const { user, isLoading } = useAuth();
  const [pending, setPending] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: "", confirmPassword: "" },
  });

  async function onSubmit(values: ResetPasswordValues) {
    setPending(true);
    const { error } = await updatePassword(supabase, values.password);
    setPending(false);
    if (error) {
      haptic("error");
      toast.error(authErrorMessage(error) ?? "Mise à jour impossible.");
      return;
    }
    haptic("success");
    toast.success("Mot de passe mis à jour.");
    router.replace(ROUTES.discover);
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
        title="Session expirée"
        subtitle="Votre code de récupération n’est plus valide. Demandez-en un nouveau."
        backTo={ROUTES.login}
      >
        <Link href={ROUTES.forgotPassword} className="mt-auto w-full">
          <Button size="lg" block>
            Demander un nouveau code
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
