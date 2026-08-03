"use client";

import Link from "next/link";
import {
  Bell,
  ChevronRight,
  Globe,
  HelpCircle,
  MapPin,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";

import { PageHeader } from "@/components/layout/page-header";
import { Avatar } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import { ROUTES } from "@/constants/routes";
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
}: {
  name: string;
  avatar: string | null;
  onSignOut: () => void;
}) {
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
          <ToggleRow icon={Bell} label="Notifications" />
          <NavRow
            icon={MapPin}
            label="Localisation"
            value="Paris"
            href={ROUTES.filters}
          />
          <NavRow
            icon={ShieldCheck}
            label="Confidentialité"
            href={ROUTES.settings}
            last
          />
        </div>

        <div className="glass overflow-hidden rounded-[var(--radius-lg)]">
          <NavRow
            icon={Globe}
            label="Langue"
            value="Français"
            href={ROUTES.settings}
          />
          <NavRow
            icon={HelpCircle}
            label="Aide & support"
            href={ROUTES.settings}
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
