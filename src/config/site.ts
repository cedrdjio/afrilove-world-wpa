/**
 * Métadonnées globales du produit. Source unique de vérité pour le SEO,
 * le manifeste PWA et les partages sociaux.
 */
/** Domaine Vercel par défaut (utilisé si aucune variable d'env n'est définie). */
const DEFAULT_URL =
  "https://afrilove-world-wpa-nagatopen99gmailcoms-projects.vercel.app";

/**
 * Résout l'URL publique :
 *  1. NEXT_PUBLIC_APP_URL si défini,
 *  2. sinon l'URL de production Vercel injectée au build,
 *  3. sinon le domaine Vercel par défaut ci-dessus (jamais localhost en prod).
 */
function resolveSiteUrl(): string {
  if (process.env.NEXT_PUBLIC_APP_URL) return process.env.NEXT_PUBLIC_APP_URL;
  const vercel =
    process.env.VERCEL_PROJECT_PRODUCTION_URL ||
    process.env.NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL;
  if (vercel) return `https://${vercel}`;
  return DEFAULT_URL;
}

export const siteConfig = {
  name: "AfriLove World",
  shortName: "AfriLove",
  tagline: "L'amour sans frontières",
  description:
    "AfriLove World — rencontres afro-européennes sincères, portées par la culture et le cœur. Découvrez des profils vérifiés partout dans le monde.",
  locale: "fr",
  themeColor: {
    light: "#6a4fc0",
    dark: "#1d1530",
  },
  url: resolveSiteUrl(),
  ogImage: "/og.png",
  creator: "AfriLove World",
  keywords: [
    "rencontre",
    "rencontre afro",
    "dating",
    "afro-européen",
    "rencontres sérieuses",
    "célibataires africains",
    "amour",
    "diaspora",
    "culture",
  ],
} as const;

export type SiteConfig = typeof siteConfig;
