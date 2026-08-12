"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { PasswordInput } from "@/components/ui/password-input";
import { ROUTES } from "@/constants/routes";
import { updatePassword } from "@/features/auth/service";
import { useSupabase } from "@/providers/supabase-provider";

/** « Changer mon mot de passe ». Met à jour le mot de passe de la session. */
export function PasswordScreen() {
  const router = useRouter();
  const supabase = useSupabase();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [pending, setPending] = useState(false);

  const tooShort = password.length > 0 && password.length < 8;
  const mismatch = confirm.length > 0 && confirm !== password;
  const canSave = password.length >= 8 && confirm === password && !pending;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSave) return;
    setPending(true);
    const { error } = await updatePassword(supabase, password);
    setPending(false);
    if (error) {
      toast.error("Mise à jour impossible. Réessayez.");
      return;
    }
    toast.success("Mot de passe mis à jour");
    router.push(ROUTES.settings);
  }

  return (
    <div className="mx-auto w-full max-w-md px-5 pb-10">
      <PageHeader title="Mot de passe" back />

      <form onSubmit={onSubmit} className="mt-6 space-y-5">
        <Field
          label="Nouveau mot de passe"
          htmlFor="new-password"
          error={tooShort ? "8 caractères minimum." : undefined}
        >
          <PasswordInput
            id="new-password"
            autoComplete="new-password"
            placeholder="••••••••"
            value={password}
            invalid={tooShort}
            onChange={(e) => setPassword(e.target.value)}
          />
        </Field>

        <Field
          label="Confirmer le mot de passe"
          htmlFor="confirm-password"
          error={
            mismatch ? "Les mots de passe ne correspondent pas." : undefined
          }
        >
          <PasswordInput
            id="confirm-password"
            autoComplete="new-password"
            placeholder="••••••••"
            value={confirm}
            invalid={mismatch}
            onChange={(e) => setConfirm(e.target.value)}
          />
        </Field>

        <Button type="submit" size="lg" block disabled={!canSave}>
          {pending ? "Enregistrement…" : "Mettre à jour"}
        </Button>
      </form>
    </div>
  );
}
