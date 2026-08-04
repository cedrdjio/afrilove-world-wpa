"use client";

import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Briefcase,
  ChevronRight,
  Church,
  Eye,
  FileText,
  GraduationCap,
  HeartPulse,
  IdCard,
  Images,
  Languages as LanguagesIcon,
  Ruler,
  SlidersHorizontal,
  Sparkles,
  type LucideIcon,
} from "lucide-react";

import { ScreenBackground } from "@/components/layout/screen-background";
import { GlowOrb } from "@/components/layout/glow-orb";
import { SettingsRow } from "@/components/ui/settings-row";
import { ROUTES } from "@/constants/routes";

interface Row {
  icon: LucideIcon;
  label: string;
  href: string;
}
const SECTIONS: { title: string; rows: Row[] }[] = [
  {
    title: "Profil",
    rows: [
      {
        icon: IdCard,
        label: "Informations de base",
        href: "/edit-profile/basic-info",
      },
      { icon: Images, label: "Photos", href: "/edit-profile/photos" },
      { icon: FileText, label: "Bio", href: "/edit-profile/bio" },
    ],
  },
  {
    title: "Centres d’intérêt",
    rows: [
      { icon: Sparkles, label: "Intérêts", href: "/edit-profile/interests" },
      {
        icon: HeartPulse,
        label: "Mode de vie",
        href: "/edit-profile/lifestyle",
      },
      {
        icon: LanguagesIcon,
        label: "Langues",
        href: "/edit-profile/languages",
      },
    ],
  },
  {
    title: "Informations",
    rows: [
      { icon: Church, label: "Religion", href: "/edit-profile/religion" },
      {
        icon: GraduationCap,
        label: "Éducation",
        href: "/edit-profile/education",
      },
      { icon: Briefcase, label: "Profession", href: "/edit-profile/job" },
      { icon: Ruler, label: "Taille", href: "/edit-profile/height" },
    ],
  },
  {
    title: "Rencontres",
    rows: [
      {
        icon: SlidersHorizontal,
        label: "Préférences",
        href: "/edit-profile/preferences",
      },
    ],
  },
];

/** Hub d'édition du profil — port de `EditProfileHubScreen`. */
export default function EditProfileHubPage() {
  const router = useRouter();

  return (
    <div className="relative flex min-h-dvh flex-col">
      <ScreenBackground theme="cream">
        <GlowOrb
          size={230}
          color="rgba(106,79,192,0.09)"
          top={-50}
          right={-50}
          duration={9.5}
        />
      </ScreenBackground>

      <div className="relative z-10 mx-auto w-full max-w-md px-6 pt-8 pb-24">
        <header className="mb-7 flex items-center justify-between">
          <button
            type="button"
            onClick={() => router.back()}
            aria-label="Retour"
            className="border-border/60 bg-card/60 text-foreground hover:bg-card grid size-11 place-items-center rounded-full border transition-colors"
          >
            <ArrowLeft className="size-5" strokeWidth={2} aria-hidden />
          </button>
          <h1 className="font-display text-foreground text-[20px]">
            Modifier le profil
          </h1>
          <span className="size-11" aria-hidden />
        </header>

        <button
          type="button"
          onClick={() => router.push("/profile/preview")}
          className="gradient-signature shadow-brand mb-6 flex w-full items-center gap-3 rounded-[20px] p-4 text-left text-white"
        >
          <span className="grid size-10 place-items-center rounded-full bg-white/20">
            <Eye className="size-[18px]" aria-hidden />
          </span>
          <span className="flex-1">
            <span className="block text-[13px] font-bold">
              Aperçu du profil
            </span>
            <span className="block text-[11.5px] text-white/70">
              Voyez ce que les autres voient
            </span>
          </span>
          <ChevronRight className="size-4" aria-hidden />
        </button>

        {SECTIONS.map((section) => (
          <section key={section.title} className="mb-5">
            <h2 className="text-foreground/35 font-display mb-2 text-[11px]">
              {section.title}
            </h2>
            <div className="border-border/70 bg-card/45 overflow-hidden rounded-2xl border">
              {section.rows.map((row, i) => (
                <SettingsRow
                  key={row.label}
                  icon={
                    <row.icon className="text-primary size-4" aria-hidden />
                  }
                  label={row.label}
                  isLast={i === section.rows.length - 1}
                  onClick={() => router.push(row.href)}
                />
              ))}
            </div>
          </section>
        ))}

        <p className="text-muted-foreground mt-2 text-center text-[11px]">
          Complétez votre profil pour apparaître dans la découverte —{" "}
          <button
            type="button"
            onClick={() => router.push(ROUTES.profileCompletion)}
            className="text-primary font-semibold underline"
          >
            voir la progression
          </button>
          .
        </p>
      </div>
    </div>
  );
}
