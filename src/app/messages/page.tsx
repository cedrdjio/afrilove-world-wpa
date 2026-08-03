import { BottomNav } from "@/components/layout/bottom-nav";
import { ConversationsScreen } from "@/features/messaging/components/conversations-screen";

export default function MessagesPage() {
  return (
    <>
      <ConversationsScreen />
      <BottomNav />
    </>
  );
}
