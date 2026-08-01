/**
 * Métadonnées globales du produit. Source unique de vérité pour le SEO,
 * le manifeste PWA et les partages sociaux.
 */
export const siteConfig = {
  name: "AfroLove World",
  shortName: "AfroLove",
  tagline: "L'amour sans frontières",
  description:
    "AfroLove World — rencontres afro-européennes sincères, portées par la culture et le cœur. Découvrez des profils vérifiés partout dans le monde.",
  locale: "fr",
  themeColor: {
    light: "#6a4fc0",
    dark: "#1d1530",
  },
  // URL publique (surchargée par NEXT_PUBLIC_APP_URL en prod).
  url: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  ogImage: "/og.png",
  creator: "AfroLove World",
  keywords: [
    "rencontre",
    "dating",
    "afro",
    "afro-européen",
    "rencontres sérieuses",
    "amour",
    "culture",
  ],
} as const;

export type SiteConfig = typeof siteConfig;
