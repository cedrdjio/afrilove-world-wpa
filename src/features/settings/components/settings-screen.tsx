"use client";

import { useState } from "react";
import Link from "next/link";
import { useTheme } from "next-themes";
import {
  BadgeCheck,
  Bell,
  ChevronRight,
  Lock,
  MapPin,
  Moon,
  Pencil,
  ShieldOff,
  Trash2,
  type LucideIcon,
} from "lucide-react";

import { PageHeader } from "@/components/layout/page-header";
import { Avatar } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import { ROUTES } from "@/constants/routes";
import { useMounted } from "@/hooks/use-mounted";
import { useSettingsStore } from "@/store/settings-store";

/**
 * Réglages (« 12 »). Compte, préférences (notifications, localisation,
 * confidentialité, langue, aide) et déconnexion. Les interrupteurs sont câblés
 * sur le `useSettingsStore` ; les lignes de navigation pointent vers leurs
 * écrans dédiés.
 */
export function SettingsScreen({
  name,
  avatar,
  onSignOut,
  onDeleteAccount,
  deleting = false,
}: {
  name: string;
  avatar: string | null;
  onSignOut: () => void;
  onDeleteAccount: () => void;
  deleting?: boolean;
}) {
  const [confirmDelete, setConfirmDelete] = useState(false);

  return (
    <div className="mx-auto w-full max-w-md px-5 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
      <PageHeader title="Réglages" />

      <div className="mt-6 space-y-4">
        <Link
          href={ROUTES.profile}
          className="glass flex items-center gap-3.5 rounded-[var(--radius-lg)] p-4"
        >
          <Avatar src={avatar} alt={name} size={56} rounded="lg" />
          <div className="min-w-0 flex-1">
            <div className="font-display truncate font-bold">{name}</div>
            <div className="text-muted-foreground text-sm">
              Modifier mon compte
            </div>
          </div>
          <ChevronRight className="text-subtle-foreground size-5" aria-hidden />
        </Link>

        <div className="glass overflow-hidden rounded-[var(--radius-lg)]">
          <NavRow
            icon={Pencil}
            label="Modifier mon profil"
            href={ROUTES.editProfile}
          />
          <NavRow
            icon={BadgeCheck}
            label="Vérifier mon compte"
            href={ROUTES.verify}
            last
          />
        </div>

        <div className="glass overflow-hidden rounded-[var(--radius-lg)]">
          <ThemeRow />
          <ToggleRow icon={Bell} label="Notifications" />
          <NavRow
            icon={MapPin}
            label="Ma localisation"
            href={ROUTES.editProfile}
            last
          />
        </div>

        <div className="glass overflow-hidden rounded-[var(--radius-lg)]">
          <NavRow
            icon={Lock}
            label="Changer le mot de passe"
            href={ROUTES.settingsPassword}
          />
          <NavRow
            icon={ShieldOff}
            label="Utilisateurs bloqués"
            href={ROUTES.settingsBlocked}
            last
          />
        </div>

        <button
          type="button"
          onClick={onSignOut}
          className="bg-accent/15 text-primary font-display h-13 w-full rounded-[var(--radius-pill)] py-4 font-bold active:scale-[0.99]"
        >
          Se déconnecter
        </button>

        {/* Zone de danger : suppression de compte avec confirmation. */}
        {confirmDelete ? (
          <div className="border-danger/30 bg-danger/5 rounded-[var(--radius-lg)] border p-4">
            <p className="text-danger font-display flex items-center gap-2 font-bold">
              <Trash2 className="size-4" aria-hidden />
              Supprimer définitivement mon compte ?
            </p>
            <p className="text-muted-foreground mt-1.5 text-sm">
              Votre profil sera désactivé et disparaîtra de l&apos;application.
              Cette action est irréversible.
            </p>
            <div className="mt-4 flex gap-3">
              <button
                type="button"
                onClick={() => setConfirmDelete(false)}
                disabled={deleting}
                className="border-border h-11 flex-1 rounded-[var(--radius-pill)] border text-sm font-bold disabled:opacity-50"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={onDeleteAccount}
                disabled={deleting}
                className="bg-danger h-11 flex-1 rounded-[var(--radius-pill)] text-sm font-bold text-white disabled:opacity-50"
              >
                {deleting ? "Suppression…" : "Supprimer"}
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setConfirmDelete(true)}
            className="text-danger flex h-12 w-full items-center justify-center gap-2 text-sm font-bold"
          >
            <Trash2 className="size-4" aria-hidden />
            Supprimer mon compte
          </button>
        )}
      </div>
    </div>
  );
}

function RowIcon({ icon: Icon }: { icon: LucideIcon }) {
  return (
    <span className="bg-accent/15 grid size-9 shrink-0 place-items-center rounded-[var(--radius-sm)]">
      <Icon className="text-primary size-5" aria-hidden />
    </span>
  );
}

/** Bascule « Fond sombre » — pilote next-themes (SSR-safe, valeur réelle après montage). */
function ThemeRow() {
  const { resolvedTheme, setTheme } = useTheme();
  const mounted = useMounted();
  const isDark = mounted && resolvedTheme === "dark";
  return (
    <div className="border-border/60 flex items-center gap-3.5 border-b px-4 py-3.5">
      <RowIcon icon={Moon} />
      <span className="flex-1 text-sm font-semibold">Fond sombre</span>
      <Switch
        checked={isDark}
        onCheckedChange={(v) => setTheme(v ? "dark" : "light")}
        aria-label="Fond sombre"
      />
    </div>
  );
}

function ToggleRow({ icon, label }: { icon: LucideIcon; label: string }) {
  const value = useSettingsStore((s) => s.notifications);
  const setNotifications = useSettingsStore((s) => s.setNotifications);
  return (
    <div className="border-border/60 flex items-center gap-3.5 border-b px-4 py-3.5">
      <RowIcon icon={icon} />
      <span className="flex-1 text-sm font-semibold">{label}</span>
      <Switch
        checked={value}
        onCheckedChange={setNotifications}
        aria-label={label}
      />
    </div>
  );
}

function NavRow({
  icon,
  label,
  value,
  href,
  last = false,
}: {
  icon: LucideIcon;
  label: string;
  value?: string;
  href: string;
  last?: boolean;
}) {
  return (
    <Link
      href={href}
      className={
        last
          ? "flex items-center gap-3.5 px-4 py-3.5"
          : "border-border/60 flex items-center gap-3.5 border-b px-4 py-3.5"
      }
    >
      <RowIcon icon={icon} />
      <span className="flex-1 text-sm font-semibold">{label}</span>
      {value && <span className="text-subtle-foreground text-sm">{value}</span>}
      <ChevronRight
        className="text-subtle-foreground size-[18px]"
        aria-hidden
      />
    </Link>
  );
}
