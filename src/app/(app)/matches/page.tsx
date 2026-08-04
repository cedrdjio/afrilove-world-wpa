import { Heart } from "lucide-react";

import { ScreenHeader } from "@/components/layout/screen-header";
import { EmptyState } from "@/components/feedback";

/**
 * Onglet Matchs (placeholder Jalon 3). La grille de matchs, la célébration et
 * la recherche arrivent au Jalon 8 ; l'onglet et sa route `/matches` existent
 * dès maintenant pour ancrer la navigation.
 */
export default function MatchesPage() {
  return (
    <div className="flex flex-1 flex-col px-6 pt-6">
      <ScreenHeader title="Mes matchs" hideBack />
      <EmptyState
        icon={
          <Heart className="text-primary size-9 fill-current" aria-hidden />
        }
        title="Vos matchs arrivent"
        description="Dès que la découverte sera active, vos coups de cœur réciproques apparaîtront ici."
      />
    </div>
  );
}
