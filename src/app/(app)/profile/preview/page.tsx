"use client";

import { useRouter } from "next/navigation";

import { FullScreenLoader } from "@/components/feedback";
import { ProfileDetailView } from "@/features/profile/components/profile-detail-view";
import { useProfileQuery } from "@/features/profile/hooks/use-profile";
import { useProfileDisplayData } from "@/features/profile/hooks/use-profile-display-data";

/**
 * Aperçu de son propre profil — port de `ProfilePreviewScreen`. Montre au
 * membre exactement ce que les autres voient (même composant que la fiche
 * publique), sans les actions.
 */
export default function ProfilePreviewPage() {
  const router = useRouter();
  const profileQuery = useProfileQuery();
  const displayData = useProfileDisplayData(profileQuery.data);

  if (!profileQuery.data || !displayData) return <FullScreenLoader />;

  return (
    <ProfileDetailView
      profile={profileQuery.data}
      displayData={displayData}
      variant="preview"
      onGalleryPress={() =>
        router.push(`/profile/${profileQuery.data!.id}/gallery`)
      }
    />
  );
}
