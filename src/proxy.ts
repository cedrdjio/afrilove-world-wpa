import { type NextRequest } from "next/server";

import { updateSession } from "@/services/supabase/session";

/**
 * Proxy global (ex-« middleware », renommé en Next 16) : maintient la session
 * Supabase fraîche à chaque requête. (Infra — la protection des routes viendra
 * au Sprint 01.)
 */
export async function proxy(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Toutes les routes SAUF :
     * - fichiers statiques (_next/static, _next/image)
     * - favicon, manifeste, service worker, robots, sitemap
     * - assets d'image courants
     */
    "/((?!_next/static|_next/image|favicon.ico|manifest.webmanifest|sw.js|robots.txt|sitemap.xml|.*\\.(?:svg|png|jpg|jpeg|gif|webp|avif|ico)$).*)",
  ],
};
