import type { MetadataRoute } from "next";

import { siteConfig } from "@/config/site";

/**
 * Manifeste PWA (servi à /manifest.webmanifest).
 * Rend l'app installable sur iOS/Android avec l'identité lavande.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: siteConfig.name,
    short_name: siteConfig.shortName,
    description: siteConfig.description,
    id: "/",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    lang: siteConfig.locale,
    dir: "ltr",
    // Fond du splash natif (Android) — violet profond de la marque, cohérent
    // avec le splash animé in-app, pour faire ressortir le logo.
    background_color: "#2e2440",
    theme_color: siteConfig.themeColor.light,
    categories: ["social", "lifestyle", "dating"],
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/maskable-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icons/maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
