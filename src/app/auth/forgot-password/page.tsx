"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { AuthScreen } from "@/features/auth/components/auth-screen";
import {
  forgotPasswordSchema,
  type ForgotPasswordValues,
} from "@/features/auth/schema";
import { authErrorMessage, sendPasswordReset } from "@/features/auth/service";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { ROUTES } from "@/constants/routes";
import { useHaptics } from "@/hooks/use-haptics";
import { useSupabase } from "@/providers/supabase-provider";

export default function ForgotPasswordPage() {
  const supabase = useSupabase();
  const router = useRouter();
  const haptic = useHaptics();
  const [pending, setPending] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  async function onSubmit(values: ForgotPasswordValues) {
    setPending(true);
    const email = values.email.trim().toLowerCase();
    const { error } = await sendPasswordReset(supabase, email);
    setPending(false);
    if (error) {
      haptic("error");
      toast.error(authErrorMessage(error) ?? "Envoi impossible.");
      return;
    }
    haptic("success");
    // Un code de récupération a été envoyé → saisie in-app (pas de lien).
    router.replace(
      `${ROUTES.verifyOtp}?type=recovery&email=${encodeURIComponent(email)}`,
    );
  }

  return (
    <AuthScreen
      title="Mot de passe oublié"
      subtitle="Saisissez votre e-mail : nous vous enverrons un code pour choisir un nouveau mot de passe."
      backTo={ROUTES.login}
    >
      <form
        onSubmit={handleSubmit(onSubmit)}
        noValidate
        className="flex flex-1 flex-col gap-5"
      >
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
          disabled={pending}
          className="mt-auto"
        >
          {pending ? "Envoi…" : "Envoyer le code"}
        </Button>
      </form>
    </AuthScreen>
  );
}
