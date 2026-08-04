"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { m } from "framer-motion";
import {
  ArrowLeft,
  Briefcase,
  ChevronDown,
  Church,
  Coffee,
  Expand,
  GraduationCap,
  Heart,
  Images,
  Languages,
  MapPin,
  Ruler,
  Sparkles,
  UserRound,
} from "lucide-react";

import { ScreenBackground } from "@/components/layout/screen-background";
import { GlassCard } from "@/components/ui/glass-card";
import { Chip } from "@/components/ui/chip";
import { VerifiedBadge } from "@/components/ui/badges";
import { PhotoPlaceholder } from "@/components/ui/photo-placeholder";
import { cn } from "@/lib/utils";
import { type Profile } from "@/features/profile/types";
import { type ProfileDisplayData } from "@/features/profile/hooks/use-profile-display-data";
import { InfoRow } from "./info-row";

function hashToSeed(id: string): number {
  let hash = 0;
  for (let i = 0; i < id.length; i += 1)
    hash = (hash * 31 + id.charCodeAt(i)) | 0;
  return hash;
}

function SectionTitle({
  icon,
  children,
}: {
  icon?: React.ReactNode;
  children: string;
}) {
  return (
    <div className="mb-3 flex items-center gap-2.5">
      {icon ? (
        <span className="bg-primary/[0.1] grid size-7 place-items-center rounded-[9px]">
          {icon}
        </span>
      ) : null}
      <span className="text-foreground/55 font-display text-[12.5px] tracking-wide uppercase">
        {children}
      </span>
    </div>
  );
}

interface ProfileDetailViewProps {
  profile: Profile;
  displayData: ProfileDisplayData;
  /** 'preview' : aperçu de son propre profil (bandeau « Aperçu public »).
   *  'public' : fiche d'un autre membre, lecture seule (actions J8/J12). */
  variant: "preview" | "public";
  isOnline?: boolean;
  onGalleryPress: () => void;
}

/**
 * Fiche profil — port de `ProfileDetailView` : identité sur la photo, contenu
 * en cartes de verre, navigation photo. Variantes lecture seule (aperçu / vue
 * publique) ; la barre d'actions Découverte et signaler/bloquer arrivent aux
 * jalons Découverte (J8) et Modération (J12).
 */
export function ProfileDetailView({
  profile,
  displayData,
  variant,
  isOnline = false,
  onGalleryPress,
}: ProfileDetailViewProps) {
  const router = useRouter();
  const [activePhoto, setActivePhoto] = useState(0);
  const [bioExpanded, setBioExpanded] = useState(false);

  const displayName = profile.firstName ?? "";
  const activePhotoUrl = profile.photos[activePhoto]?.url;
  const locationLine = [profile.city, profile.country]
    .filter(Boolean)
    .join(", ");
  const distanceLabel =
    profile.distanceKm != null
      ? `à ${Math.round(profile.distanceKm).toLocaleString("fr-FR")} km`
      : null;
  const iconColor = "var(--color-primary)";

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <ScreenBackground theme="cream" />

      <div className="relative mx-auto w-full max-w-md pb-16">
        {/* Héros */}
        <div className="relative h-[68vh] max-h-[560px] min-h-[420px] overflow-hidden rounded-b-[34px]">
          {activePhotoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={activePhotoUrl}
              alt={displayName}
              className="size-full object-cover"
            />
          ) : (
            <PhotoPlaceholder
              seed={hashToSeed(profile.id)}
              className="size-full"
            />
          )}
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "linear-gradient(to bottom, rgba(24,15,42,0.32) 0%, transparent 26%, transparent 50%, rgba(24,15,42,0.9) 100%)",
            }}
          />

          {/* Zones de tap : moitié gauche = précédente, droite = suivante. */}
          {profile.photos.length > 1 ? (
            <div className="absolute inset-0 flex">
              <button
                type="button"
                aria-label="Photo précédente"
                className="flex-1"
                onClick={() => setActivePhoto((i) => Math.max(0, i - 1))}
              />
              <button
                type="button"
                aria-label="Photo suivante"
                className="flex-1"
                onClick={() =>
                  setActivePhoto((i) =>
                    Math.min(profile.photos.length - 1, i + 1),
                  )
                }
              />
            </div>
          ) : null}

          {/* Barres d'avancement photo */}
          {profile.photos.length > 1 ? (
            <div className="pointer-events-none absolute inset-x-[18px] top-[68px] flex gap-1.5">
              {profile.photos.map((photo, i) => (
                <span
                  key={photo.id}
                  className={cn(
                    "h-[3px] flex-1 rounded-full",
                    i === activePhoto ? "bg-white/90" : "bg-white/35",
                  )}
                />
              ))}
            </div>
          ) : null}

          {variant === "preview" ? (
            <div className="absolute inset-x-[18px] top-[84px] flex w-fit items-center gap-1.5 rounded-full border border-white/15 bg-black/35 px-3.5 py-2 backdrop-blur-md">
              <span className="text-[11px] font-semibold text-white">
                Aperçu public
              </span>
            </div>
          ) : null}

          {/* Identité sur la photo */}
          <div className="pointer-events-none absolute inset-x-6 bottom-[42px]">
            <div className="flex items-center gap-2">
              <h1 className="font-display text-[34px] text-white">
                {displayName}
                {displayData.age != null ? `, ${displayData.age}` : ""}
              </h1>
              {profile.isVerified ? <VerifiedBadge tone="onDark" /> : null}
            </div>
            {isOnline ? (
              <span className="mt-2 flex w-fit items-center gap-1.5 rounded-full border border-white/20 bg-black/25 px-2.5 py-1">
                <span className="bg-success size-2 rounded-full" />
                <span className="text-[11px] font-semibold text-white">
                  En ligne
                </span>
              </span>
            ) : null}
            {locationLine || distanceLabel ? (
              <div className="mt-2.5 flex flex-wrap items-center gap-2">
                {locationLine ? (
                  <span className="flex items-center gap-1.5 rounded-full border border-white/[0.28] bg-white/[0.16] px-3 py-1.5">
                    <MapPin className="size-3 text-white" aria-hidden />
                    <span className="text-[11px] font-semibold text-white">
                      {locationLine}
                    </span>
                  </span>
                ) : null}
                {distanceLabel ? (
                  <span className="rounded-full border border-white/[0.28] bg-white/[0.16] px-3 py-1.5 text-[11px] font-semibold text-white/90">
                    {distanceLabel}
                  </span>
                ) : null}
              </div>
            ) : null}
          </div>

          {profile.photos.length > 0 ? (
            <button
              type="button"
              onClick={onGalleryPress}
              aria-label="Ouvrir la galerie"
              className="absolute right-[18px] bottom-[48px] grid size-10 place-items-center rounded-[13px] border border-white/15 bg-black/35 backdrop-blur-md"
            >
              <Expand
                className="size-4 text-white"
                strokeWidth={2}
                aria-hidden
              />
            </button>
          ) : null}
        </div>

        {/* Contenu */}
        <div className="flex flex-col gap-3.5 px-5 pt-5">
          {/* Vignettes */}
          {profile.photos.length > 1 ? (
            <div className="-mx-1 flex gap-2.5 overflow-x-auto px-1 pb-1">
              {profile.photos.map((photo, i) => (
                <button
                  key={photo.id}
                  type="button"
                  onClick={() => setActivePhoto(i)}
                  className={cn(
                    "size-[74px] shrink-0 overflow-hidden rounded-2xl",
                    i === activePhoto
                      ? "border-primary border-2"
                      : "border border-white/10",
                  )}
                  style={{ width: 74, height: 92 }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={photo.url}
                    alt=""
                    className="size-full object-cover"
                  />
                </button>
              ))}
              <button
                type="button"
                onClick={onGalleryPress}
                aria-label="Voir toutes les photos"
                className="border-primary/25 bg-primary/[0.08] flex shrink-0 flex-col items-center justify-center gap-1 rounded-2xl border"
                style={{ width: 74, height: 92 }}
              >
                <Images className="text-primary size-[18px]" aria-hidden />
                <span className="text-primary text-[10px] font-semibold">
                  Voir tout
                </span>
              </button>
            </div>
          ) : null}

          {profile.bio ? (
            <GlassCard>
              <button
                type="button"
                onClick={() => setBioExpanded((v) => !v)}
                className="flex w-full items-center justify-between"
              >
                <SectionTitle
                  icon={<Sparkles className="text-primary size-3.5" />}
                >
                  À propos
                </SectionTitle>
                <ChevronDown
                  className={cn(
                    "text-muted-foreground size-[18px] transition-transform",
                    bioExpanded && "rotate-180",
                  )}
                  aria-hidden
                />
              </button>
              <p
                className={cn(
                  "text-muted-foreground text-[13.5px] leading-[21px]",
                  !bioExpanded && "line-clamp-3",
                )}
              >
                {profile.bio}
              </p>
            </GlassCard>
          ) : null}

          {displayData.interestLabels.length > 0 ? (
            <GlassCard>
              <SectionTitle icon={<Heart className="text-primary size-3.5" />}>
                Centres d’intérêt
              </SectionTitle>
              <div className="flex flex-wrap gap-2">
                {displayData.interestLabels.map((label) => (
                  <Chip key={label} label={label} selected size="sm" />
                ))}
              </div>
            </GlassCard>
          ) : null}

          {displayData.languageLabels.length > 0 ? (
            <GlassCard>
              <SectionTitle
                icon={<Languages className="text-primary size-3.5" />}
              >
                Langues
              </SectionTitle>
              <div className="flex flex-wrap gap-2">
                {displayData.languageLabels.map((label) => (
                  <Chip key={label} label={label} size="sm" />
                ))}
              </div>
            </GlassCard>
          ) : null}

          <GlassCard className="p-0">
            <div className="px-[18px] pt-[18px]">
              <SectionTitle icon={<Coffee className="text-primary size-3.5" />}>
                Mode de vie
              </SectionTitle>
            </div>
            {displayData.lifestyleRows.map((item, i) => (
              <div
                key={item.label}
                className={cn(
                  "flex items-center justify-between px-[18px] py-3.5",
                  i === displayData.lifestyleRows.length - 1
                    ? "pb-[18px]"
                    : "border-foreground/[0.06] border-b",
                )}
              >
                <span className="text-foreground text-[13px] font-semibold">
                  {item.label}
                </span>
                <span className="text-muted-foreground text-[12.5px] font-medium">
                  {item.value}
                </span>
              </div>
            ))}
          </GlassCard>

          <GlassCard className="p-0">
            <div className="px-[18px] pt-[18px]">
              <SectionTitle
                icon={<UserRound className="text-primary size-3.5" />}
              >
                Essentiel
              </SectionTitle>
            </div>
            <div className="px-[18px] pb-1.5">
              <InfoRow
                icon={
                  <Church
                    className="size-[15px]"
                    style={{ color: iconColor }}
                  />
                }
                label="Religion"
                value={displayData.religionLabel ?? "—"}
              />
              <InfoRow
                icon={
                  <GraduationCap
                    className="size-[15px]"
                    style={{ color: iconColor }}
                  />
                }
                label="Éducation"
                value={displayData.educationLabel ?? "—"}
              />
              <InfoRow
                icon={
                  <Briefcase
                    className="size-[15px]"
                    style={{ color: iconColor }}
                  />
                }
                label="Profession"
                value={profile.profession ?? "—"}
              />
              <InfoRow
                icon={
                  <Ruler className="size-[15px]" style={{ color: iconColor }} />
                }
                label="Taille"
                value={profile.heightCm ? `${profile.heightCm} cm` : "—"}
                isLast
              />
            </div>
          </GlassCard>
        </div>
      </div>

      {/* Retour flottant */}
      <div className="fixed inset-x-0 top-6 z-10 mx-auto flex w-full max-w-md items-center justify-between px-[18px]">
        <button
          type="button"
          onClick={() => router.back()}
          aria-label="Retour"
          className="grid size-[42px] place-items-center rounded-[13px] border border-white/15 bg-black/35 backdrop-blur-md"
        >
          <ArrowLeft
            className="size-[18px] text-white"
            strokeWidth={2}
            aria-hidden
          />
        </button>
        <m.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="sr-only"
        >
          {displayName}
        </m.span>
      </div>
    </div>
  );
}
