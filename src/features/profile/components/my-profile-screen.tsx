"use client";

import Link from "next/link";
import { m } from "framer-motion";
import { Bookmark, Crown, Pencil, Settings, Sparkles } from "lucide-react";

import { VerifiedBadge } from "@/components/brand/verified-badge";
import { Avatar } from "@/components/ui/avatar";
import { IconButton } from "@/components/ui/icon-button";
import { ROUTES } from "@/constants/routes";
import { useEntitlements } from "@/features/premium/hooks";
import { VerificationBanner } from "@/features/kyc/components/verification-banner";

export interface ProfileViewModel {
  firstName: string;
  age: number | null;
  city: string;
  avatar: string;
  bio: string;
  verified: boolean;
  completion: number;
  stats: { views: number; likes: number; matches: number };
}

/**
 * « Mon profil » (« 08 »). Carte d'identité avec progression, statistiques,
 * bio éditable et bannière Premium. Présentation pure : la page fournit le
 * view-model (données Supabase réelles + valeurs de démo en repli).
 */
export function MyProfileScreen({ vm }: { vm: ProfileViewModel }) {
  return (
    <div className="mx-auto w-full max-w-md px-6 pt-[max(1.25rem,env(safe-area-inset-top))] pb-28">
      <header className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-extrabold">Mon profil</h1>
        <div className="flex items-center gap-2">
          <IconButton tone="glass" aria-label="Mes favoris" asChild>
            <Link href={ROUTES.favorites}>
              <Bookmark className="size-5" aria-hidden />
            </Link>
          </IconButton>
          <IconButton tone="glass" aria-label="Réglages" asChild>
            <Link href={ROUTES.settings}>
              <Settings className="size-5" aria-hidden />
            </Link>
          </IconButton>
        </div>
      </header>

      <m.div
        initial="hidden"
        animate="show"
        variants={{ show: { transition: { staggerChildren: 0.06 } } }}
        className="mt-6 space-y-4"
      >
        <Section>
          <div className="glass flex items-center gap-4 rounded-[var(--radius-lg)] p-4">
            <div className="relative">
              <Avatar
                src={vm.avatar}
                alt={vm.firstName}
                size={78}
                rounded="lg"
              />
              <Link
                href={ROUTES.photos}
                aria-label="Modifier mes photos"
                className="gradient-signature border-card absolute -right-1.5 -bottom-1.5 grid size-7 place-items-center rounded-full border-2"
              >
                <Pencil className="size-3.5 text-white" aria-hidden />
              </Link>
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <span className="font-display truncate text-xl font-extrabold">
                  {vm.firstName}
                  {vm.age ? `, ${vm.age}` : ""}
                </span>
                {vm.verified && <VerifiedBadge size={19} />}
              </div>
              <p className="text-muted-foreground truncate text-sm">
                {vm.city}
              </p>
              <div className="bg-accent/20 mt-2.5 h-1.5 overflow-hidden rounded-full">
                <div
                  className="gradient-signature h-full rounded-full transition-[width] duration-500"
                  style={{ width: `${vm.completion}%` }}
                />
              </div>
              <p className="text-primary mt-1.5 text-xs font-bold">
                Profil complété à {vm.completion}%
              </p>
            </div>
          </div>
        </Section>

        {!vm.verified && (
          <Section>
            <VerificationBanner />
          </Section>
        )}

        <Section>
          <div className="flex gap-3">
            <StatCard value={vm.stats.views} label="Vues" />
            <StatCard value={vm.stats.likes} label="Likes" />
            <StatCard value={vm.stats.matches} label="Matchs" />
          </div>
        </Section>

        <Section>
          <div className="glass rounded-[var(--radius-lg)] p-4">
            <div className="flex items-center justify-between">
              <h2 className="font-display font-bold">Ma bio</h2>
              <Link href={ROUTES.editProfile} aria-label="Modifier ma bio">
                <Pencil className="text-accent size-4" aria-hidden />
              </Link>
            </div>
            <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
              {vm.bio}
            </p>
          </div>
        </Section>

        <Section>
          <Link
            href={ROUTES.editProfile}
            className="glass flex items-center gap-3.5 rounded-[var(--radius-lg)] p-4 active:scale-[0.99]"
          >
            <span className="bg-accent/15 grid size-11 place-items-center rounded-[var(--radius-sm)]">
              <Pencil className="text-primary size-5" aria-hidden />
            </span>
            <span className="flex-1">
              <span className="font-display block font-bold">
                Modifier mon profil
              </span>
              <span className="text-muted-foreground block text-sm">
                Bio, infos, style de vie, centres d&apos;intérêt
              </span>
            </span>
          </Link>
        </Section>

        <Section>
          <PremiumBanner />
        </Section>
      </m.div>
    </div>
  );
}

/**
 * Bannière Premium contextuelle : les abonnés actifs voient leur statut (et la
 * date d'échéance) au lieu du CTA « Essayer ». On ne propose jamais de souscrire
 * à quelqu'un qui l'est déjà — jusqu'à la fin de son abonnement.
 */
function PremiumBanner() {
  const { data: ent } = useEntitlements();

  if (ent?.isPremium) {
    const until = ent.premiumUntil
      ? new Date(ent.premiumUntil).toLocaleDateString("fr-FR", {
          day: "numeric",
          month: "long",
          year: "numeric",
        })
      : null;
    return (
      <div className="gradient-signature shadow-brand flex items-center gap-3.5 rounded-[var(--radius-lg)] p-4 text-white">
        <span className="grid size-11 place-items-center rounded-[var(--radius-sm)] bg-white/20">
          <Crown className="size-6 fill-white text-white" aria-hidden />
        </span>
        <span className="flex-1">
          <span className="font-display block font-extrabold">
            Premium actif{ent.planLabel ? ` · ${ent.planLabel}` : ""}
          </span>
          <span className="block text-sm text-white/85">
            {until ? `Jusqu'au ${until}` : "Abonnement en cours"}
          </span>
        </span>
      </div>
    );
  }

  return (
    <Link
      href={ROUTES.premium}
      className="gradient-signature shadow-brand flex items-center gap-3.5 rounded-[var(--radius-lg)] p-4 text-white active:scale-[0.99]"
    >
      <span className="grid size-11 place-items-center rounded-[var(--radius-sm)] bg-white/20">
        <Sparkles className="size-6 fill-white text-white" aria-hidden />
      </span>
      <span className="flex-1">
        <span className="font-display block font-extrabold">
          Afrilove Premium
        </span>
        <span className="block text-sm text-white/85">
          Vois qui t&apos;a déjà liké
        </span>
      </span>
      <span className="text-primary font-display rounded-[var(--radius-pill)] bg-white px-4 py-2 text-sm font-bold">
        Essayer
      </span>
    </Link>
  );
}

function Section({ children }: { children: React.ReactNode }) {
  return (
    <m.div
      variants={{
        hidden: { opacity: 0, y: 12 },
        show: {
          opacity: 1,
          y: 0,
          transition: { ease: [0.23, 1, 0.32, 1], duration: 0.4 },
        },
      }}
    >
      {children}
    </m.div>
  );
}

function StatCard({ value, label }: { value: number; label: string }) {
  return (
    <div className="glass flex-1 rounded-[var(--radius-lg)] p-4 text-center">
      <div className="text-primary font-display text-2xl font-extrabold">
        {value}
      </div>
      <div className="text-muted-foreground mt-0.5 text-xs">{label}</div>
    </div>
  );
}
