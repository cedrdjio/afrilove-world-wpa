import { type createClient } from "@/services/supabase/client";

type Client = ReturnType<typeof createClient>;

/**
 * Localisation & présence — port de `locationService` (mobile). La base
 * transforme lat/lng en point PostGIS (colonne générée `location`) qui alimente
 * le tri de proximité et le filtre distance de `search_profiles`. Ne lève
 * jamais : la position est un plus, pas un prérequis.
 */
export async function captureAndSaveLocation(
  supabase: Client,
  userId: string,
): Promise<boolean> {
  if (typeof navigator === "undefined" || !navigator.geolocation) return false;
  try {
    const position = await new Promise<GeolocationPosition>(
      (resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: false,
          timeout: 10_000,
          maximumAge: 5 * 60_000,
        });
      },
    );
    const { latitude, longitude } = position.coords;
    const { error } = await supabase
      .from("profiles")
      .update({
        latitude,
        longitude,
        location_updated_at: new Date().toISOString(),
      })
      .eq("id", userId);
    return !error;
  } catch {
    // Permission refusée ou timeout — sans incidence sur le reste de l'app.
    return false;
  }
}

/** Marque l'utilisateur comme récemment actif — alimente la pastille « En ligne ». */
export async function touchLastActive(
  supabase: Client,
  userId: string,
): Promise<void> {
  await supabase
    .from("profiles")
    .update({ last_active_at: new Date().toISOString() })
    .eq("id", userId);
}
