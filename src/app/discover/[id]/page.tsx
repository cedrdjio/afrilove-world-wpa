import { notFound } from "next/navigation";

import { DEMO_PROFILES, findProfile } from "@/features/profiles/data";
import { ProfileDetail } from "@/features/discovery/components/profile-detail";

/** Pré-génère les fiches profils connues (démo) pour un rendu instantané. */
export function generateStaticParams() {
  return DEMO_PROFILES.map((p) => ({ id: p.id }));
}

export default async function ProfileDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const profile = findProfile(id);
  if (!profile) notFound();
  return <ProfileDetail profile={profile} />;
}
