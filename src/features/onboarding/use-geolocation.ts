"use client";

import { useCallback, useState } from "react";

export type GeolocationStatus =
  "idle" | "locating" | "success" | "denied" | "unsupported" | "error";

export interface ResolvedLocation {
  country: string | null;
  city: string | null;
  latitude: number;
  longitude: number;
}

interface BigDataCloudResponse {
  countryName?: string;
  city?: string;
  locality?: string;
  principalSubdivision?: string;
}

/**
 * Résout un pays / une ville lisibles à partir de coordonnées, via l'API
 * publique et sans clé de BigDataCloud (CORS ouvert, gratuite). Échoue en
 * douceur : on garde au moins les coordonnées si le géocodage inverse casse.
 */
async function reverseGeocode(
  latitude: number,
  longitude: number,
): Promise<{ country: string | null; city: string | null }> {
  try {
    const res = await fetch(
      `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=fr`,
      { headers: { Accept: "application/json" } },
    );
    if (!res.ok) return { country: null, city: null };
    const data = (await res.json()) as BigDataCloudResponse;
    return {
      country: data.countryName?.trim() || null,
      city:
        data.city?.trim() ||
        data.locality?.trim() ||
        data.principalSubdivision?.trim() ||
        null,
    };
  } catch {
    return { country: null, city: null };
  }
}

/**
 * Demande la permission de géolocalisation puis renvoie une localisation
 * résolue. Le navigateur affiche nativement l'invite de permission au premier
 * appel de `request()` (déclenché par un geste utilisateur).
 */
export function useGeolocation() {
  const [status, setStatus] = useState<GeolocationStatus>("idle");

  const request = useCallback((): Promise<ResolvedLocation | null> => {
    if (typeof navigator === "undefined" || !("geolocation" in navigator)) {
      setStatus("unsupported");
      return Promise.resolve(null);
    }

    setStatus("locating");
    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          const place = await reverseGeocode(latitude, longitude);
          setStatus("success");
          resolve({ ...place, latitude, longitude });
        },
        (err) => {
          setStatus(err.code === err.PERMISSION_DENIED ? "denied" : "error");
          resolve(null);
        },
        { enableHighAccuracy: false, timeout: 12_000, maximumAge: 60_000 },
      );
    });
  }, []);

  return { status, request };
}
