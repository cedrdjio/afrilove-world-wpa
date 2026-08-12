"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { PageHeader } from "@/components/layout/page-header";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Spinner } from "@/components/ui/spinner";
import { Choice } from "@/features/onboarding/components/choice";
import {
  CHILDREN_OPTIONS,
  DRINKING_OPTIONS,
  GENDER_OPTIONS,
  GYM_OPTIONS,
  LOOKING_FOR_OPTIONS,
  PETS_OPTIONS,
  SMOKING_OPTIONS,
  type Option,
} from "@/features/onboarding/config";
import { MIN_INTERESTS, MIN_LANGUAGES } from "@/features/onboarding/types";

import type { EditableProfile } from "../edit-service";
import {
  useEditableProfile,
  useProfileCatalogs,
  useSaveProfile,
} from "../edit-hooks";

/**
 * « Modifier mon profil ». Formulaire unique préremrempli avec les valeurs
 * réelles (Supabase), réutilisant le modèle de données de l'onboarding.
 * Enregistre les champs + intérêts + langues ; `profile_completed` est
 * recalculé par trigger côté base.
 */
export function EditProfileScreen() {
  const router = useRouter();
  const { data, isLoading } = useEditableProfile();
  const catalogs = useProfileCatalogs();
  const save = useSaveProfile();

  const [form, setForm] = useState<EditableProfile | null>(null);

  // Hydrate le formulaire quand les valeurs réelles arrivent — réinitialisation
  // pendant le rendu (motif React recommandé, pas d'effet).
  const [hydratedFrom, setHydratedFrom] = useState<EditableProfile | null>(
    null,
  );
  if (data && data !== hydratedFrom) {
    setHydratedFrom(data);
    setForm(data);
  }

  if (isLoading || !form) {
    return (
      <div className="grid min-h-dvh place-items-center">
        <Spinner />
      </div>
    );
  }

  const set = <K extends keyof EditableProfile>(
    key: K,
    value: EditableProfile[K],
  ) => setForm((f) => (f ? { ...f, [key]: value } : f));

  const toggleId = (list: string[], id: string) =>
    list.includes(id) ? list.filter((x) => x !== id) : [...list, id];

  const canSave =
    form.bio.trim().length > 0 &&
    form.interestIds.length >= MIN_INTERESTS &&
    form.languageIds.length >= MIN_LANGUAGES;

  const onSave = () => {
    save.mutate(form, {
      onSuccess: () => {
        toast.success("Profil mis à jour");
        router.push("/profile");
      },
      onError: () => toast.error("Enregistrement impossible. Réessayez."),
    });
  };

  return (
    <div className="mx-auto w-full max-w-md px-5 pb-40">
      <PageHeader title="Modifier mon profil" back />

      <div className="mt-4 space-y-7">
        {/* Identité */}
        <Section title="Identité">
          <Field label="Prénom (public)" htmlFor="displayName">
            <Input
              id="displayName"
              value={form.displayName}
              maxLength={40}
              onChange={(e) => set("displayName", e.target.value)}
              placeholder="Votre prénom"
            />
          </Field>
          <Field label="Métier" htmlFor="profession">
            <Input
              id="profession"
              value={form.profession}
              maxLength={60}
              onChange={(e) => set("profession", e.target.value)}
              placeholder="Ex. Ingénieure"
            />
          </Field>
          <div className="flex gap-3">
            <div className="flex-1">
              <Field label="Ville" htmlFor="city">
                <Input
                  id="city"
                  value={form.city ?? ""}
                  maxLength={60}
                  onChange={(e) => set("city", e.target.value || null)}
                  placeholder="Ex. Paris"
                />
              </Field>
            </div>
            <div className="w-28">
              <Field label="Taille (cm)" htmlFor="height">
                <Input
                  id="height"
                  type="number"
                  inputMode="numeric"
                  min={140}
                  max={220}
                  value={form.heightCm ?? ""}
                  onChange={(e) =>
                    set(
                      "heightCm",
                      e.target.value ? Number(e.target.value) : null,
                    )
                  }
                  placeholder="170"
                />
              </Field>
            </div>
          </div>
        </Section>

        {/* Bio */}
        <Section title="Ma bio">
          <Textarea
            value={form.bio}
            maxLength={500}
            rows={4}
            onChange={(e) => set("bio", e.target.value)}
            placeholder="Parlez un peu de vous…"
          />
          <p className="text-muted-foreground mt-1 text-right text-xs">
            {form.bio.trim().length}/500
          </p>
        </Section>

        {/* Genre / recherche */}
        <Section title="Je suis">
          <TileGroup
            options={GENDER_OPTIONS}
            value={form.gender}
            onSelect={(v) => set("gender", v)}
          />
        </Section>
        <Section title="Je recherche">
          <TileGroup
            options={LOOKING_FOR_OPTIONS}
            value={form.lookingFor}
            onSelect={(v) => set("lookingFor", v)}
          />
        </Section>

        {/* Style de vie */}
        <Section title="Tabac">
          <TileGroup
            options={SMOKING_OPTIONS}
            value={form.smoking}
            onSelect={(v) => set("smoking", v)}
          />
        </Section>
        <Section title="Alcool">
          <TileGroup
            options={DRINKING_OPTIONS}
            value={form.drinking}
            onSelect={(v) => set("drinking", v)}
          />
        </Section>
        <Section title="Sport">
          <TileGroup
            options={GYM_OPTIONS}
            value={form.gymHabit}
            onSelect={(v) => set("gymHabit", v)}
          />
        </Section>
        <Section title="Animaux">
          <TileGroup
            options={PETS_OPTIONS}
            value={form.hasPets}
            onSelect={(v) => set("hasPets", v)}
          />
        </Section>
        <Section title="Enfants">
          <TileGroup
            options={CHILDREN_OPTIONS}
            value={form.wantsChildren}
            onSelect={(v) => set("wantsChildren", v)}
          />
        </Section>

        {/* Objectif de relation */}
        <Section title="Objectif de relation">
          <PillGroup
            options={(catalogs.relationshipGoals.data ?? []).map((o) => ({
              id: o.id,
              label: o.label,
            }))}
            selectedIds={
              form.relationshipGoalId ? [form.relationshipGoalId] : []
            }
            onToggle={(id) =>
              set(
                "relationshipGoalId",
                form.relationshipGoalId === id ? null : id,
              )
            }
          />
        </Section>

        {/* Études / religion */}
        <Section title="Niveau d'études">
          <PillGroup
            options={(catalogs.educationLevels.data ?? []).map((o) => ({
              id: o.id,
              label: o.label,
            }))}
            selectedIds={form.educationLevelId ? [form.educationLevelId] : []}
            onToggle={(id) =>
              set("educationLevelId", form.educationLevelId === id ? null : id)
            }
          />
        </Section>
        <Section title="Religion">
          <PillGroup
            options={(catalogs.religions.data ?? []).map((o) => ({
              id: o.id,
              label: o.label,
            }))}
            selectedIds={form.religionId ? [form.religionId] : []}
            onToggle={(id) =>
              set("religionId", form.religionId === id ? null : id)
            }
          />
        </Section>

        {/* Intérêts */}
        <Section
          title="Centres d'intérêt"
          hint={`Au moins ${MIN_INTERESTS} — sélectionnés : ${form.interestIds.length}`}
        >
          <PillGroup
            options={(catalogs.interests.data ?? []).map((o) => ({
              id: o.id,
              label: o.label,
            }))}
            selectedIds={form.interestIds}
            onToggle={(id) =>
              set("interestIds", toggleId(form.interestIds, id))
            }
          />
        </Section>

        {/* Langues */}
        <Section
          title="Langues"
          hint={`Au moins ${MIN_LANGUAGES} — sélectionnées : ${form.languageIds.length}`}
        >
          <PillGroup
            options={(catalogs.languages.data ?? []).map((o) => ({
              id: o.id,
              label: o.label,
            }))}
            selectedIds={form.languageIds}
            onToggle={(id) =>
              set("languageIds", toggleId(form.languageIds, id))
            }
          />
        </Section>
      </div>

      {/* Barre de sauvegarde ancrée */}
      <div className="border-border/60 bg-background/90 fixed inset-x-0 bottom-0 z-40 border-t px-5 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur-xl">
        <div className="mx-auto max-w-md">
          <button
            type="button"
            onClick={onSave}
            disabled={!canSave || save.isPending}
            className="gradient-signature shadow-brand font-display h-13 w-full rounded-[var(--radius-pill)] font-bold text-white transition active:scale-[0.99] disabled:opacity-50"
          >
            {save.isPending
              ? "Enregistrement…"
              : "Enregistrer les modifications"}
          </button>
          {!canSave && (
            <p className="text-muted-foreground mt-2 text-center text-xs">
              Bio, {MIN_INTERESTS} centres d&apos;intérêt et {MIN_LANGUAGES}{" "}
              langue minimum.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function Section({
  title,
  hint,
  children,
}: {
  title: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <div className="mb-2.5 flex items-baseline justify-between">
        <h2 className="font-display text-sm font-bold">{title}</h2>
        {hint && <span className="text-muted-foreground text-xs">{hint}</span>}
      </div>
      <div className="space-y-3">{children}</div>
    </section>
  );
}

/** Groupe de tuiles pour un choix unique typé (style de vie, genre…). */
function TileGroup<T extends string>({
  options,
  value,
  onSelect,
}: {
  options: Option<T>[];
  value: T | null;
  onSelect: (value: T) => void;
}) {
  return (
    <div className="grid grid-cols-3 gap-3">
      {options.map((opt) => (
        <Choice
          key={opt.value}
          variant="tile"
          selected={value === opt.value}
          onSelect={() => onSelect(opt.value)}
          label={opt.label}
          icon={opt.icon}
        />
      ))}
    </div>
  );
}

/** Groupe de puces pour une sélection (mono ou multi) par id de catalogue. */
function PillGroup({
  options,
  selectedIds,
  onToggle,
}: {
  options: { id: string; label: string }[];
  selectedIds: string[];
  onToggle: (id: string) => void;
}) {
  if (options.length === 0) {
    return <p className="text-muted-foreground text-sm">Chargement…</p>;
  }
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => (
        <Choice
          key={opt.id}
          variant="pill"
          selected={selectedIds.includes(opt.id)}
          onSelect={() => onToggle(opt.id)}
          label={opt.label}
        />
      ))}
    </div>
  );
}
