"use client";

import { useEffect, useState } from "react";

/**
 * S'abonne à une media query. SSR-safe (retourne `false` avant montage).
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia(query);
    const onChange = () => setMatches(mql.matches);
    onChange();
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, [query]);

  return matches;
}

/** Raccourci : vrai sur écran ≥ 768px (tablette et plus). */
export function useIsDesktop(): boolean {
  return useMediaQuery("(min-width: 768px)");
}
