"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { m } from "framer-motion";
import {
  BadgeCheck,
  Camera,
  Eye,
  MapPin,
  Settings,
  ShieldCheck,
  Star,
} from "lucide-react";
import { toast } from "sonner";

import { PhotoPlaceholder } from "@/components/ui/photo-placeholder";
import { Chip } from "@/components/ui/chip";
import { FullScreenLoader } from "@/components/feedback";
import {
  useProfileQuery,
  useProfileStats,
} from "@/features/profile/hooks/use-profile";
import { useInterestsQuery } from "@/features/profile/hooks/use-reference-data";
import {
  calculateAge,
  computeProfileCompletion,
} from "@/features/profile/types";

/** Écran « Mon profil » — port de `MyProfileScreen`. */
export default function ProfilePage() {
  const router = useRouter();
  const profileQuery = useProfileQuery();
  const statsQuery = useProfileStats();
  const interestsQuery = useInterestsQuery();

  const profile = profileQuery.data;

  const completionPercent = useMemo(() => {
    if (!profile) return 0;
    const { missing } = computeProfileCompletion(profile);
    const fields = Object.values(missing);
    const done = fields.filter((mv) => !mv).length;
    return Math.round((done / fields.length) * 100);
  }, [profile]);

  const interestLabels = useMemo(() => {
    if (!profile || !interestsQuery.data) return [];
    const byId = new Map(interestsQuery.data.map((i) => [i.id, i.label]));
    return profile.interestIds
      .map((id) => byId.get(id))
      .filter((label): label is string => Boolean(label));
  }, [profile, interestsQuery.data]);

  if (!profile) return <FullScreenLoader />;

  const age = profile.birthDate ? calculateAge(profile.birthDate) : null;
  const location = [profile.city, profile.country].filter(Boolean).join(", ");
  const stats = [
    {
      value: String(statsQuery.data?.likesReceived ?? "—"),
      label: "Likes reçus",
    },
    { value: String(statsQuery.data?.matchesCount ?? "—"), label: "Matches" },
    {
      value: statsQuery.data ? `${statsQuery.data.matchRate}%` : "—",
      label: "Taux match",
    },
  ];

  const soon = () =>
    toast.info("Bientôt disponible", {
      description: "Cette section arrive dans un prochain jalon.",
    });

  return (
    <div className="flex flex-1 flex-col">
      {/* Héros photo + identité */}
      <div className="relative h-[360px] w-full overflow-hidden rounded-b-[32px]">
        {profile.avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={profile.avatarUrl}
            alt=""
            className="size-full object-cover"
          />
        ) : (
          <PhotoPlaceholder seed={0} className="size-full" />
        )}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "linear-gradient(to bottom, rgba(24,15,42,0.34) 0%, transparent 40%, rgba(24,15,42,0.78) 100%)",
          }}
        />

        {/* Barre du haut */}
        <div className="absolute inset-x-[18px] top-[18px] flex items-center justify-between">
          <span className="font-display text-[20px] text-white drop-shadow">
            Mon Profil
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => router.push("/edit-profile")}
              className="bg-card/90 text-primary rounded-full px-3.5 py-2 text-[11px] font-bold"
            >
              Modifier
            </button>
            <button
              type="button"
              onClick={soon}
              aria-label="Paramètres"
              className="bg-card/90 grid size-[34px] place-items-center rounded-full"
            >
              <Settings className="text-primary size-4" aria-hidden />
            </button>
          </div>
        </div>

        {/* Identité */}
        <div className="pointer-events-none absolute inset-x-[18px] bottom-[18px] pr-24">
          <h1 className="font-display truncate text-[30px] text-white">
            {profile.firstName ?? "Moi"}
            {age != null ? `, ${age}` : ""}
          </h1>
          {location ? (
            <p className="mt-1.5 flex items-center gap-1.5 text-[12.5px] font-medium text-white/80">
              <MapPin className="size-3" aria-hidden />
              {location}
            </p>
          ) : null}
        </div>

        <button
          type="button"
          onClick={() => router.push("/edit-profile/photos")}
          className="bg-card/90 text-primary absolute right-[18px] bottom-4 flex items-center gap-1.5 rounded-full px-3 py-2 text-[10.5px] font-bold"
        >
          <Camera className="size-3.5" strokeWidth={2.2} aria-hidden />
          {profile.photos.length} photo{profile.photos.length > 1 ? "s" : ""}
        </button>
      </div>

      <div className="flex flex-col gap-3 px-[22px] pt-6">
        {completionPercent < 100 ? (
          <button
            type="button"
            onClick={() => router.push("/profile-completion")}
            className="border-border/70 bg-card/85 flex items-center gap-3.5 rounded-2xl border px-4 py-3.5 text-left"
          >
            <div className="flex-1">
              <div className="mb-1.5 flex justify-between">
                <span className="text-foreground text-[11px] font-semibold">
                  Profil complété
                </span>
                <span className="text-primary text-[12px] font-bold">
                  {completionPercent}%
                </span>
              </div>
              <div className="bg-foreground/[0.08] h-1.5 overflow-hidden rounded-full">
                <m.div
                  className="gradient-signature h-full rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${completionPercent}%` }}
                  transition={{ duration: 0.9, ease: [0.23, 1, 0.32, 1] }}
                />
              </div>
            </div>
            <span className="bg-primary rounded-xl px-3.5 py-2.5 text-[11px] font-semibold text-white">
              Compléter
            </span>
          </button>
        ) : null}

        {/* Vérification */}
        {profile.isVerified ? (
          <div className="flex items-center gap-2.5 rounded-2xl border border-[#D99B2B]/30 bg-[#D99B2B]/[0.08] px-4 py-3">
            <BadgeCheck
              className="size-4 text-[#D99B2B]"
              strokeWidth={2.6}
              aria-hidden
            />
            <span className="text-foreground text-[12.5px] font-medium">
              Profil vérifié — badge visible par tous
            </span>
          </div>
        ) : (
          <button
            type="button"
            onClick={soon}
            className="border-primary/[0.22] bg-primary/[0.06] flex items-center gap-2.5 rounded-2xl border px-4 py-3 text-left"
          >
            <ShieldCheck
              className="text-primary size-4"
              strokeWidth={2.4}
              aria-hidden
            />
            <span className="flex-1">
              <span className="text-foreground block text-[12.5px] font-semibold">
                Profil non vérifié
              </span>
              <span className="text-muted-foreground mt-0.5 block text-[11px]">
                Obtenez votre badge — plus de confiance, plus de matches.
              </span>
            </span>
            <span className="bg-primary rounded-full px-3 py-1.5 text-[10.5px] font-semibold text-white">
              Me vérifier
            </span>
          </button>
        )}

        {/* Bio */}
        <button
          type="button"
          onClick={() => router.push("/edit-profile/bio")}
          className="border-border/70 bg-card/45 rounded-2xl border px-4 py-3.5 text-left"
        >
          <p className="text-foreground/35 font-display mb-1.5 text-[11px]">
            À propos
          </p>
          {profile.bio ? (
            <p className="text-foreground text-[12.5px] leading-[19px]">
              {profile.bio}
            </p>
          ) : (
            <p className="text-muted-foreground text-[12.5px] leading-[19px] italic">
              Ajoutez une bio pour attirer 2× plus de visites.
            </p>
          )}
        </button>

        {interestLabels.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {interestLabels.map((interest) => (
              <Chip key={interest} label={interest} size="sm" />
            ))}
          </div>
        ) : null}

        {/* Stats */}
        <div className="flex gap-2.5">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="border-border/70 bg-card/45 flex flex-1 flex-col items-center rounded-2xl border py-3.5"
            >
              <span className="text-primary font-display mb-1 text-[22px]">
                {stat.value}
              </span>
              <span className="text-muted-foreground text-[10px] font-medium">
                {stat.label}
              </span>
            </div>
          ))}
        </div>

        {/* Aperçu public */}
        <button
          type="button"
          onClick={() => router.push("/profile/preview")}
          className="border-primary/[0.22] bg-primary/[0.06] flex items-center justify-center gap-2 rounded-2xl border py-3.5"
        >
          <Eye
            className="text-primary size-[15px]"
            strokeWidth={2}
            aria-hidden
          />
          <span className="text-primary text-[12px] font-semibold">
            Aperçu public de mon profil
          </span>
        </button>

        {/* Premium (J11) */}
        <button
          type="button"
          onClick={soon}
          className="gradient-signature shadow-brand mt-1 flex items-center gap-3.5 rounded-2xl p-4 text-left text-white"
        >
          <span className="grid size-11 place-items-center rounded-2xl bg-white/[0.18]">
            <Star className="size-5" fill="#fff" aria-hidden />
          </span>
          <span className="flex-1">
            <span className="mb-0.5 block text-[13.5px] font-bold">
              AfriLove Premium
            </span>
            <span className="block text-[11.5px] text-white/70">
              Vois qui t’a déjà liké.
            </span>
          </span>
          <span className="bg-card text-primary rounded-full px-3.5 py-2 text-[11px] font-bold">
            Essayer
          </span>
        </button>
      </div>
    </div>
  );
}
