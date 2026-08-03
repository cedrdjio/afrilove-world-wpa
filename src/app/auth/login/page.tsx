"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { AuthScreen } from "@/features/auth/components/auth-screen";
import { GoogleButton } from "@/features/auth/components/google-button";
import { loginSchema, type LoginValues } from "@/features/auth/schema";
import { authErrorMessage, signInWithPassword } from "@/features/auth/service";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { ROUTES } from "@/constants/routes";
import { useHaptics } from "@/hooks/use-haptics";
import { useSupabase } from "@/providers/supabase-provider";

export default function LoginPage() {
  const supabase = useSupabase();
  const router = useRouter();
  const params = useSearchParams();
  const haptic = useHaptics();
  const [pending, setPending] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  async function onSubmit(values: LoginValues) {
    setPending(true);
    const { error } = await signInWithPassword(supabase, values);
    if (error) {
      setPending(false);
      haptic("error");
      toast.error(authErrorMessage(error) ?? "Connexion impossible.");
      return;
    }
    haptic("success");
    // La destination réelle est arbitrée par la garde de la page cible.
    const next = params.get("next");
    router.replace(next && next.startsWith("/") ? next : ROUTES.discover);
  }

  return (
    <AuthScreen
      title="Bon retour 👋"
      subtitle="Connectez-vous pour retrouver vos rencontres."
      backTo={ROUTES.home}
      footer={
        <p className="text-muted-foreground text-center text-sm">
          Pas encore de compte ?{" "}
          <Link
            href={ROUTES.register}
            className="text-primary font-bold hover:underline"
          >
            Créer un compte
          </Link>
        </p>
      }
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

        <Field
          label="Mot de passe"
          htmlFor="password"
          error={errors.password?.message}
        >
          <PasswordInput
            id="password"
            autoComplete="current-password"
            placeholder="••••••••"
            invalid={!!errors.password}
            {...register("password")}
          />
        </Field>

        <div className="-mt-1 text-right">
          <Link
            href={ROUTES.forgotPassword}
            className="text-muted-foreground hover:text-foreground text-sm font-medium"
          >
            Mot de passe oublié ?
          </Link>
        </div>

        <Button
          type="submit"
          size="lg"
          block
          disabled={pending}
          className="mt-auto"
        >
          {pending ? "Connexion…" : "Se connecter"}
        </Button>

        <div className="flex items-center gap-3">
          <span className="bg-border h-px flex-1" />
          <span className="text-muted-foreground text-xs font-medium">ou</span>
          <span className="bg-border h-px flex-1" />
        </div>

        <GoogleButton next={params.get("next") ?? ROUTES.discover} />
      </form>
    </AuthScreen>
  );
}
