"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { m } from "framer-motion";
import { BadgeCheck, MapPin, Pencil } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { ROUTES } from "@/constants/routes";
import { useAuth } from "@/providers/auth-provider";

function ageFrom(birthDate: string | null): number | null {
  if (!birthDate) return null;
  return Math.floor((Date.now() - new Date(birthDate).getTime()) / 3.15576e10);
}

/**
 * Fiche profil du membre (Sprint 01, lecture seule). L'édition détaillée et la
 * gestion des photos arriveront avec l'app ; ici on affiche l'essentiel.
 */
export default function ProfilePage() {
  const router = useRouter();
  const { user, profile, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && profile && !profile.onboarding_completed) {
      router.replace(ROUTES.onboarding);
    }
  }, [isLoading, profile, router]);

  if (isLoading || !user || !profile || !profile.onboarding_completed) {
    return (
      <div className="grid min-h-dvh place-items-center">
        <Spinner />
      </div>
    );
  }

  const age = ageFrom(profile.birth_date);
  const location = [profile.city, profile.country].filter(Boolean).join(", ");

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col pb-10">
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

        {!profile.profile_completed ? (
          <div className="border-border bg-card mt-6 w-full rounded-[var(--radius-lg)] border p-4 text-left">
            <p className="text-foreground text-sm font-semibold">
              Complétez votre profil
            </p>
            <p className="text-muted-foreground mt-1 text-xs leading-relaxed">
              Ajoutez au moins 2 photos pour apparaître dans la découverte.
            </p>
          </div>
        ) : null}
      </m.div>

      <div className="mt-auto flex flex-col gap-3 px-6 pt-8">
        <Button size="lg" block asChild>
          <Link href={ROUTES.onboarding}>
            <Pencil className="size-5" aria-hidden />
            Modifier mon profil
          </Link>
        </Button>
        <Link
          href={ROUTES.discover}
          className="text-muted-foreground hover:text-foreground text-center text-sm font-medium"
        >
          Retour à l’accueil
        </Link>
      </div>
    </div>
  );
}
