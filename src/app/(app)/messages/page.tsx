import { MessageCircle } from "lucide-react";

import { ScreenHeader } from "@/components/layout/screen-header";
import { EmptyState } from "@/components/feedback";

/**
 * Onglet Messages (placeholder Jalon 3). La liste des conversations et le chat
 * temps réel arrivent au Jalon 9 ; l'onglet et sa route `/messages` existent
 * dès maintenant pour ancrer la navigation.
 */
export default function MessagesPage() {
  return (
    <div className="flex flex-1 flex-col px-6 pt-6">
      <ScreenHeader title="Messages" hideBack />
      <EmptyState
        icon={
          <MessageCircle
            className="text-primary size-9"
            strokeWidth={1.8}
            aria-hidden
          />
        }
        title="Pas encore de conversation"
        description="Vos échanges avec vos matchs apparaîtront ici en temps réel."
      />
    </div>
  );
}
