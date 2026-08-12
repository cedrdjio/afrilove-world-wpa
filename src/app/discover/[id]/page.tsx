import { DEMO_PROFILES } from "@/features/profiles/data";
import { ProfileDetailContainer } from "@/features/discovery/components/profile-detail-container";

/**
 * Les fiches de démo sont pré-générées (aperçu design) ; les vrais profils
 * (UUID) sont rendus à la demande — le conteneur client bascule sur
 * `get_public_profile` dès qu'une session existe.
 */
export function generateStaticParams() {
  return DEMO_PROFILES.map((p) => ({ id: p.id }));
}

export default async function ProfileDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <ProfileDetailContainer id={id} />;
}
