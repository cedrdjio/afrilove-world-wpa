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
    background_color: "#faf8fd",
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
