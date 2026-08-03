"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { m } from "framer-motion";
import {
  ChevronLeft,
  Heart,
  MapPin,
  MessageCircle,
  MoreHorizontal,
  X,
} from "lucide-react";

import { VerifiedBadge } from "@/components/brand/verified-badge";
import { Chip } from "@/components/ui/chip";
import { IconButton } from "@/components/ui/icon-button";
import { ROUTES } from "@/constants/routes";
import type { Profile } from "@/features/profiles/types";
import { useHaptics } from "@/hooks/use-haptics";

/**
 * Fiche profil détaillée (« 05 »). En-tête photo, identité, statistiques,
 * bio et centres d'intérêt sur cartes de verre, barre d'action ancrée en bas.
 */
export function ProfileDetail({ profile }: { profile: Profile }) {
  const router = useRouter();
  const haptic = useHaptics();

  return (
    <div className="relative mx-auto min-h-dvh w-full max-w-md pb-28">
      {/* En-tête photo */}
      <div className="relative h-[45vh] max-h-[400px] min-h-[320px] w-full overflow-hidden">
        <Image
          src={profile.photos[0]}
          alt={`Photo de ${profile.firstName}`}
          fill
          priority
          sizes="(max-width: 448px) 100vw, 400px"
          className="object-cover"
          style={{ objectPosition: "50% 26%" }}
        />
        <div className="from-brand-950/35 to-brand-950/60 absolute inset-0 bg-gradient-to-b via-transparent" />

        <div className="absolute inset-x-0 top-[max(1rem,env(safe-area-inset-top))] flex items-center justify-between px-5">
          <IconButton
            tone="glassDark"
            aria-label="Retour"
            onClick={() => router.back()}
          >
            <ChevronLeft className="size-5" aria-hidden />
          </IconButton>
          <IconButton tone="glassDark" aria-label="Options">
            <MoreHorizontal className="size-5" aria-hidden />
          </IconButton>
        </div>

        <div className="absolute inset-x-5 bottom-4 text-white">
          <div className="flex items-center gap-2">
            <h1 className="font-display text-3xl font-extrabold drop-shadow-lg">
              {profile.firstName}, {profile.age}
            </h1>
            {profile.verified && <VerifiedBadge size={22} />}
          </div>
          <p className="mt-1 flex items-center gap-1.5 text-sm text-white/90 drop-shadow">
            <MapPin className="size-4" aria-hidden />
            {profile.origin} · vit à {profile.city} · à {profile.distanceKm} km
          </p>
        </div>
      </div>

      {/* Contenu */}
      <m.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
        className="space-y-4 px-5 pt-5"
      >
        <div className="flex gap-3">
          <Stat value={`${profile.compatibility}%`} label="compatibilité" />
          <Stat value={String(profile.mutualFriends)} label="amis en commun" />
        </div>

        <section className="glass rounded-[var(--radius-lg)] p-4">
          <h2 className="font-display text-base font-bold">À propos</h2>
          <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
            {profile.bio}
          </p>
        </section>

        <section className="glass rounded-[var(--radius-lg)] p-4">
          <h2 className="font-display text-base font-bold">
            Centres d&apos;intérêt
          </h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {profile.interests.map((interest) => (
              <Chip key={interest} tone="soft">
                {interest}
              </Chip>
            ))}
          </div>
        </section>
      </m.div>

      {/* Barre d'action */}
      <div className="fixed inset-x-0 bottom-0 z-30 mx-auto w-full max-w-md">
        <div className="from-background flex items-center gap-3.5 bg-gradient-to-t to-transparent px-5 pt-6 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
          <IconButton
            tone="glass"
            shape="round"
            size="lg"
            aria-label="Passer"
            className="text-subtle-foreground"
            onClick={() => {
              haptic("light");
              router.push(ROUTES.discover);
            }}
          >
            <X className="size-6" strokeWidth={2.4} aria-hidden />
          </IconButton>
          <Link
            href={`${ROUTES.messages}/${profile.id}`}
            className="gradient-signature shadow-brand font-display flex h-14 flex-1 items-center justify-center gap-2 rounded-[var(--radius-pill)] font-bold text-white active:scale-[0.98]"
          >
            <MessageCircle className="size-5" aria-hidden />
            Envoyer un message
          </Link>
          <IconButton
            tone="gradient"
            shape="round"
            size="lg"
            aria-label="J'aime"
            onClick={() => {
              haptic("success");
              router.push(ROUTES.discover);
            }}
          >
            <Heart className="size-6 fill-current" aria-hidden />
          </IconButton>
        </div>
      </div>
    </div>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="glass flex-1 rounded-[var(--radius-lg)] p-4">
      <div className="text-primary font-display text-2xl font-extrabold">
        {value}
      </div>
      <div className="text-muted-foreground mt-0.5 text-xs">{label}</div>
    </div>
  );
}
