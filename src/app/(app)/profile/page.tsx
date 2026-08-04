"use client";

import { m } from "framer-motion";
import { BadgeCheck, MapPin, Pencil } from "lucide-react";

import { ROUTES } from "@/constants/routes";
import { useAuth } from "@/providers/auth-provider";

function ageFrom(birthDate: string | null): number | null {
  if (!birthDate) return null;
  return Math.floor((Date.now() - new Date(birthDate).getTime()) / 3.15576e10);
}

/**
 * Onglet Profil (Jalon 3, lecture seule). La garde du shell `(app)` garantit
 * un profil complet ; l'édition détaillée et la galerie photos arrivent au
 * Jalon 6.
 */
export default function ProfilePage() {
  const { profile } = useAuth();

  if (!profile) return null;

  const age = ageFrom(profile.birth_date);
  const location = [profile.city, profile.country].filter(Boolean).join(", ");

  return (
    <div className="flex flex-1 flex-col">
      {/* En-tête visuel : avatar sur dégradé signature. */}
      <div className="gradient-signature relative h-44 w-full">
        <div className="absolute inset-x-0 -bottom-12 flex justify-center">
          <div className="border-background bg-muted size-28 overflow-hidden rounded-full border-4 shadow-lg">
            {profile.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={profile.avatar_url}
                alt=""
                className="size-full object-cover"
              />
            ) : (
              <div className="text-muted-foreground grid size-full place-items-center text-3xl font-bold">
                {(profile.first_name ?? "?").charAt(0).toUpperCase()}
              </div>
            )}
          </div>
        </div>
      </div>

      <m.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.23, 1, 0.32, 1] }}
        className="mt-16 flex flex-col items-center px-6 text-center"
      >
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-extrabold tracking-tight">
            {profile.first_name}
            {age ? (
              <span className="text-muted-foreground">, {age}</span>
            ) : null}
          </h1>
          {profile.is_verified ? (
            <BadgeCheck
              className="text-primary size-6"
              aria-label="Profil vérifié"
            />
          ) : null}
        </div>
        {location ? (
          <p className="text-muted-foreground mt-1 flex items-center gap-1 text-sm">
            <MapPin className="size-4" aria-hidden />
            {location}
          </p>
        ) : null}

        {profile.bio ? (
          <p className="text-foreground/90 mt-5 text-[0.95rem] leading-relaxed text-pretty">
            {profile.bio}
          </p>
        ) : null}
      </m.div>

      <div className="mt-8 px-6">
        <p className="text-muted-foreground inline-flex items-center justify-center gap-1.5 text-center text-xs">
          <Pencil className="size-3.5" aria-hidden />
          L’édition du profil arrive au prochain jalon (
          <a href={ROUTES.editProfile} className="text-primary underline">
            édition
          </a>
          ).
        </p>
      </div>
    </div>
  );
}
