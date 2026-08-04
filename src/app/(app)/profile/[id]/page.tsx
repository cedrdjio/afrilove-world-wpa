"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

import { ScreenBackground } from "@/components/layout/screen-background";
import { ErrorState, FullScreenLoader } from "@/components/feedback";
import { mapToAppError } from "@/lib/errors";
import { useSupabase } from "@/providers/supabase-provider";
import { recordProfileView } from "@/features/profile/service";
import { ProfileDetailView } from "@/features/profile/components/profile-detail-view";
import { useOtherProfileQuery } from "@/features/profile/hooks/use-profile";
import { useProfileDisplayData } from "@/features/profile/hooks/use-profile-display-data";

/**
 * Fiche publique d'un membre — port de `ProfileViewScreen`. Lecture seule pour
 * ce jalon : la barre d'actions Découverte (J'aime / passer / favori) relève de
 * la Découverte (J8), et signaler/bloquer de la Modération (J12).
 */
export default function PublicProfilePage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const router = useRouter();
  const supabase = useSupabase();
  const profileQuery = useOtherProfileQuery(id);
  const displayData = useProfileDisplayData(profileQuery.data);

  // Alimente le compteur « Vues » — best effort, jamais bloquant.
  useEffect(() => {
    if (id) void recordProfileView(supabase, id).catch(() => {});
  }, [id, supabase]);

  if (profileQuery.isError) {
    return (
      <div className="fixed inset-0 z-50">
        <ScreenBackground theme="cream" />
        <ErrorState
          error={mapToAppError(profileQuery.error)}
          onRetry={() => void profileQuery.refetch()}
        />
      </div>
    );
  }

  if (!profileQuery.data || !displayData) return <FullScreenLoader />;

  return (
    <ProfileDetailView
      profile={profileQuery.data}
      displayData={displayData}
      variant="public"
      onGalleryPress={() => router.push(`/profile/${id}/gallery`)}
    />
  );
}
