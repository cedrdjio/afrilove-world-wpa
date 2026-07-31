"use client";

import { useState } from "react";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { m } from "framer-motion";
import { MailCheck } from "lucide-react";
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
  const haptic = useHaptics();
  const [pending, setPending] = useState(false);
  const [sentTo, setSentTo] = useState<string | null>(null);

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
    const { error } = await sendPasswordReset(supabase, values.email);
    setPending(false);
    if (error) {
      haptic("error");
      toast.error(authErrorMessage(error) ?? "Envoi impossible.");
      return;
    }
    haptic("success");
    // Message identique qu'un compte existe ou non (anti-énumération).
    setSentTo(values.email.trim().toLowerCase());
  }

  if (sentTo) {
    return (
      <AuthScreen title="E-mail envoyé" backTo={ROUTES.login}>
        <m.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-1 flex-col items-center justify-center text-center"
        >
          <span className="gradient-signature shadow-brand grid size-20 place-items-center rounded-full text-white">
            <MailCheck className="size-9" aria-hidden />
          </span>
          <p className="text-muted-foreground mt-6 text-[0.95rem] leading-relaxed">
            Si un compte est associé à{" "}
            <span className="text-foreground font-semibold">{sentTo}</span>, un
            lien de réinitialisation vient d’être envoyé.
          </p>
          <Link href={ROUTES.login} className="mt-8 w-full">
            <Button size="lg" block variant="secondary">
              Revenir à la connexion
            </Button>
          </Link>
        </m.div>
      </AuthScreen>
    );
  }

  return (
    <AuthScreen
      title="Mot de passe oublié"
      subtitle="Saisissez votre e-mail : nous vous enverrons un lien pour choisir un nouveau mot de passe."
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
          {pending ? "Envoi…" : "Envoyer le lien"}
        </Button>
      </form>
    </AuthScreen>
  );
}
