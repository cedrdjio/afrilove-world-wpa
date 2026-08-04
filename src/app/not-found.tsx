import { redirect } from "next/navigation";

import { ROUTES } from "@/constants/routes";

/**
 * Filet de sécurité pour toute URL qui ne correspond à aucune route — port de
 * `+not-found` (mobile) : on repasse par la racine (résolution de session)
 * plutôt que d'afficher un écran d'erreur brut. Le proxy réoriente ensuite un
 * membre connecté vers l'app, un visiteur vers l'accueil public.
 */
export default function NotFound() {
  redirect(ROUTES.home);
}
