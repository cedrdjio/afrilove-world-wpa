import { redirect } from "next/navigation";

import { ROUTES } from "@/constants/routes";

/** `/auth` seul n'a pas d'écran propre : on envoie vers la connexion. */
export default function AuthIndexPage() {
  redirect(ROUTES.login);
}
