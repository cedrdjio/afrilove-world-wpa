import { ChatContainer } from "@/features/messaging/components/chat-container";
import { DEMO_CONVERSATIONS } from "@/features/messaging/data";

/**
 * Les identifiants de démo sont pré-rendus (aperçu design) ; les vrais
 * `match_id` (UUID) sont rendus à la demande — le conteneur client bascule
 * automatiquement sur les données réelles Supabase quand une session existe.
 */
export function generateStaticParams() {
  return DEMO_CONVERSATIONS.map((c) => ({ id: c.id }));
}

export default async function ChatPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <ChatContainer id={id} />;
}
