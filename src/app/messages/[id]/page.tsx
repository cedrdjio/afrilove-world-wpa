import { notFound } from "next/navigation";

import { ChatScreen } from "@/features/messaging/components/chat-screen";
import {
  DEMO_CONVERSATIONS,
  findConversation,
} from "@/features/messaging/data";

export function generateStaticParams() {
  return DEMO_CONVERSATIONS.map((c) => ({ id: c.id }));
}

export default async function ChatPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const conversation = findConversation(id);
  if (!conversation) notFound();
  return <ChatScreen conversation={conversation} />;
}
