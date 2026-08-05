"use client";

import Image from "next/image";
import { Plus, Share } from "lucide-react";

import { Drawer, DrawerContent } from "@/components/ui/drawer";

/**
 * Fiche d'installation pour iOS/Safari. iOS n'expose AUCUNE API d'installation
 * programmatique : le seul moyen d'ajouter la PWA à l'écran d'accueil est le
 * geste manuel « Partager → Sur l'écran d'accueil ». On le montre donc en clair,
 * avec les icônes réelles, plutôt qu'un toast fugace facile à rater.
 */
export function IosInstallSheet({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent
        title="Installer AfriLove World"
        description="Ajoutez l'app à votre écran d'accueil pour un accès plein écran, comme une application native."
      >
        <div className="mb-5 flex items-center gap-3">
          <span className="relative size-12 shrink-0 overflow-hidden rounded-[var(--radius-md)]">
            <Image
              src="/brand/logo.png"
              alt=""
              fill
              sizes="48px"
              className="object-cover"
            />
          </span>
          <p className="text-muted-foreground text-sm">
            Trois étapes rapides dans Safari :
          </p>
        </div>

        <ol className="flex flex-col gap-3">
          <Step index={1}>
            <span className="flex flex-wrap items-center gap-1.5">
              Touchez l&apos;icône
              <span className="bg-accent/15 text-primary inline-flex items-center gap-1 rounded-[var(--radius-sm)] px-2 py-1 font-semibold">
                <Share className="size-4" aria-hidden />
                Partager
              </span>
              en bas de l&apos;écran.
            </span>
          </Step>
          <Step index={2}>
            <span className="flex flex-wrap items-center gap-1.5">
              Choisissez
              <span className="bg-accent/15 text-primary inline-flex items-center gap-1 rounded-[var(--radius-sm)] px-2 py-1 font-semibold">
                <Plus className="size-4" aria-hidden />
                Sur l&apos;écran d&apos;accueil
              </span>
            </span>
          </Step>
          <Step index={3}>
            Touchez <span className="text-primary font-semibold">Ajouter</span>{" "}
            en haut à droite. C&apos;est fait&nbsp;!
          </Step>
        </ol>

        <p className="text-muted-foreground mt-5 text-center text-xs">
          Si le menu ne s&apos;affiche pas, ouvrez cette page dans Safari.
        </p>
      </DrawerContent>
    </Drawer>
  );
}

function Step({
  index,
  children,
}: {
  index: number;
  children: React.ReactNode;
}) {
  return (
    <li className="flex items-start gap-3">
      <span className="gradient-signature grid size-7 shrink-0 place-items-center rounded-full text-sm font-bold text-white">
        {index}
      </span>
      <span className="pt-0.5 text-sm leading-relaxed">{children}</span>
    </li>
  );
}
