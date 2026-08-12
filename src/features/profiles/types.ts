/**
 * Domaine « Profils » — modèles partagés par la découverte, les likes, les
 * matchs et la messagerie. Ces types reflètent le schéma Supabase visé
 * (table `profiles` + `profile_photos`) tout en restant découplés de la
 * couche d'accès aux données (Repository Pattern).
 */

export type Gender = "homme" | "femme" | "autre";

export interface Profile {
  /** Identifiant stable (UUID côté Supabase). */
  id: string;
  firstName: string;
  age: number;
  /** Ville d'origine — mise en avant sur les fiches (« Dakar »). */
  origin: string;
  /** Ville de résidence actuelle (« vit à Paris »). */
  city: string;
  /** Distance en kilomètres par rapport à l'utilisateur courant. */
  distanceKm: number;
  gender: Gender;
  /** Score de compatibilité 0–100 calculé côté serveur (edge function). */
  compatibility: number;
  /** Amis / centres d'intérêt en commun. */
  mutualFriends: number;
  bio: string;
  interests: string[];
  /** Photos ordonnées (au moins une) — la première est la photo principale. */
  photos: [string, ...string[]];
  verified: boolean;
  online: boolean;
}

export type LikeKind = "like" | "super";

/** Un profil ayant liké l'utilisateur (écran « Qui m'a liké »). */
export interface IncomingLike {
  profile: Profile;
  kind: LikeKind;
  /** Verrouillé tant que l'utilisateur n'est pas Premium. */
  locked: boolean;
}
