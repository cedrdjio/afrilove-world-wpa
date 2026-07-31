"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { m } from "framer-motion";
import { MailCheck } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { AuthScreen } from "@/features/auth/components/auth-screen";
import { registerSchema, type RegisterValues } from "@/features/auth/schema";
import { authErrorMessage, signUpWithPassword } from "@/features/auth/service";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { cn } from "@/lib/utils";
import { ROUTES } from "@/constants/routes";
import { useHaptics } from "@/hooks/use-haptics";
import { useSupabase } from "@/providers/supabase-provider";

export default function RegisterPage() {
  const supabase = useSupabase();
  const router = useRouter();
  const haptic = useHaptics();
  const [pending, setPending] = useState(false);
  const [sentTo, setSentTo] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: "",
      email: "",
      password: "",
      confirmPassword: "",
      acceptTerms: false as unknown as true,
    },
  });

  const accepted = watch("acceptTerms");

  async function onSubmit(values: RegisterValues) {
    setPending(true);
    const { data, error } = await signUpWithPassword(supabase, values);
    if (error) {
      setPending(false);
      haptic("error");
      toast.error(authErrorMessage(error) ?? "Inscription impossible.");
      return;
    }
    haptic("success");
    // Session immédiate (confirmation désactivée) → onboarding directement.
    if (data.session) {
      router.replace(ROUTES.onboarding);
      return;
    }
    // Sinon : e-mail de confirmation envoyé.
    setSentTo(values.email.trim().toLowerCase());
    setPending(false);
  }

  if (sentTo) {
    return (
      <AuthScreen title="Vérifiez vos e-mails" backTo={ROUTES.login}>
        <m.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-1 flex-col items-center justify-center text-center"
        >
          <span className="gradient-signature shadow-brand grid size-20 place-items-center rounded-full text-white">
            <MailCheck className="size-9" aria-hidden />
          </span>
          <p className="text-foreground mt-6 text-lg font-bold">
            C’est presque fait !
          </p>
          <p className="text-muted-foreground mt-2 text-[0.95rem] leading-relaxed">
            Nous avons envoyé un lien de confirmation à{" "}
            <span className="text-foreground font-semibold">{sentTo}</span>.
            Ouvrez-le pour activer votre compte.
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
      title="Créer mon compte"
      subtitle="Rejoignez une communauté de rencontres sincères."
      backTo={ROUTES.home}
      footer={
        <p className="text-muted-foreground text-center text-sm">
          Déjà membre ?{" "}
          <Link
            href={ROUTES.login}
            className="text-primary font-bold hover:underline"
          >
            Se connecter
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
          label="Prénom"
          htmlFor="firstName"
          error={errors.firstName?.message}
        >
          <Input
            id="firstName"
            autoComplete="given-name"
            placeholder="Votre prénom"
            invalid={!!errors.firstName}
            {...register("firstName")}
          />
        </Field>

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

        <div>
          <label className="flex cursor-pointer items-start gap-3">
            <input
              type="checkbox"
              className="peer sr-only"
              checked={accepted === true}
              onChange={(e) =>
                setValue("acceptTerms", e.target.checked as unknown as true, {
                  shouldValidate: true,
                })
              }
            />
            <span
              className={cn(
                "mt-0.5 grid size-5 shrink-0 place-items-center rounded-[6px] border transition-colors",
                accepted
                  ? "gradient-signature border-transparent text-white"
                  : "border-border bg-muted/40",
              )}
              aria-hidden
            >
              {accepted ? "✓" : null}
            </span>
            <span className="text-muted-foreground text-sm leading-snug">
              J’accepte les{" "}
              <span className="text-primary font-semibold">
                conditions d’utilisation
              </span>{" "}
              et la{" "}
              <span className="text-primary font-semibold">
                politique de confidentialité
              </span>
              .
            </span>
          </label>
          {errors.acceptTerms ? (
            <p className="text-danger mt-1.5 text-xs font-medium">
              {errors.acceptTerms.message}
            </p>
          ) : null}
        </div>

        <Button
          type="submit"
          size="lg"
          block
          disabled={pending}
          className="mt-2"
        >
          {pending ? "Création…" : "Créer mon compte"}
        </Button>
      </form>
    </AuthScreen>
  );
}
