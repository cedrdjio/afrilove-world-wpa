"use client";

import { useRouter } from "next/navigation";
import {
  MapPin,
  Calendar,
  Globe2,
  Building2,
  Church,
  Languages as LanguagesIcon,
  HeartPulse,
  GraduationCap,
  Briefcase,
  Ruler,
  BadgeCheck,
  ArrowLeft,
  type LucideIcon,
} from "lucide-react";

import { ScreenBackground } from "@/components/layout/screen-background";
import { GlowOrb } from "@/components/layout/glow-orb";
import { GradientButton } from "@/components/ui/gradient-button";
import { ROUTES } from "@/constants/routes";
import { useSearchFiltersStore } from "@/features/search/store";

interface FilterRow {
  icon: LucideIcon;
  label: string;
  value: string;
  href: string;
}

/**
 * Hub de la recherche avancée — port de `SearchFiltersHubScreen` (mobile) :
 * carte listant les 11 filtres (icône + libellé + valeur courante), chaque
 * ligne ouvrant l'écran dédié. Le bouton « Rechercher des profils » ouvre la
 * découverte (l'application effective des filtres relève du Jalon 8, à
 * l'identique du mobile).
 */
export default function SearchHubPage() {
  const router = useRouter();
  const filters = useSearchFiltersStore();

  const rows: FilterRow[] = [
    {
      icon: MapPin,
      label: "Distance",
      value: `${filters.distanceKm} km`,
      href: "/search/distance",
    },
    {
      icon: Calendar,
      label: "Âge",
      value: `${filters.ageMin} - ${filters.ageMax} ans`,
      href: "/search/age",
    },
    {
      icon: Globe2,
      label: "Pays",
      value: filters.country,
      href: "/search/country",
    },
    {
      icon: Building2,
      label: "Ville",
      value: filters.city,
      href: "/search/city",
    },
    {
      icon: Church,
      label: "Religion",
      value: filters.religion,
      href: "/search/religion",
    },
    {
      icon: LanguagesIcon,
      label: "Langues",
      value: filters.languages.length
        ? `${filters.languages.length} sélectionnées`
        : "Peu importe",
      href: "/search/languages",
    },
    {
      icon: HeartPulse,
      label: "Mode de vie",
      value: filters.lifestyle.length
        ? `${filters.lifestyle.length} sélectionnés`
        : "Peu importe",
      href: "/search/lifestyle",
    },
    {
      icon: GraduationCap,
      label: "Éducation",
      value: filters.education,
      href: "/search/education",
    },
    {
      icon: Briefcase,
      label: "Profession",
      value: filters.profession || "Peu importe",
      href: "/search/profession",
    },
    {
      icon: Ruler,
      label: "Taille",
      value: `${filters.heightMin} - ${filters.heightMax} cm`,
      href: "/search/height",
    },
    {
      icon: BadgeCheck,
      label: "Vérifié",
      value: filters.verifiedOnly ? "Oui" : "Peu importe",
      href: "/search/verified",
    },
  ];

  return (
    <div className="relative flex min-h-dvh flex-col">
      <ScreenBackground theme="cream">
        <GlowOrb
          size={230}
          color="rgba(106,79,192,0.09)"
          top={-50}
          left={-50}
          duration={9.5}
        />
      </ScreenBackground>

      <div className="relative z-10 mx-auto flex min-h-dvh w-full max-w-md flex-1 flex-col px-6 pt-8 pb-7">
        <header className="mb-6 flex items-center justify-between">
          <button
            type="button"
            onClick={() => router.back()}
            aria-label="Retour"
            className="border-border/60 bg-card/60 text-foreground hover:bg-card grid size-11 place-items-center rounded-full border transition-colors"
          >
            <ArrowLeft className="size-5" strokeWidth={2} aria-hidden />
          </button>
          <h1 className="font-display text-foreground text-[20px]">
            Recherche avancée
          </h1>
          <span className="size-11" aria-hidden />
        </header>

        <div className="-mx-1 flex-1 overflow-y-auto px-1">
          <div className="border-border/70 bg-card/45 overflow-hidden rounded-2xl border-[1.5px]">
            {rows.map((row, i) => {
              const Icon = row.icon;
              return (
                <button
                  key={row.label}
                  type="button"
                  onClick={() => router.push(row.href)}
                  className={`hover:bg-muted/40 flex w-full items-center justify-between px-4 py-3.5 text-left transition-colors ${
                    i === rows.length - 1
                      ? ""
                      : "border-foreground/[0.06] border-b"
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <span className="bg-brand-500/[0.08] grid size-9 shrink-0 place-items-center rounded-full">
                      <Icon className="text-brand-600 size-4" aria-hidden />
                    </span>
                    <span className="font-display text-foreground text-[13.5px] font-semibold">
                      {row.label}
                    </span>
                  </span>
                  <span className="text-muted-foreground text-[12px] font-medium">
                    {row.value}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <GradientButton
          label="Rechercher des profils"
          className="mt-4"
          onClick={() => router.replace(ROUTES.discover)}
        />
      </div>
    </div>
  );
}
