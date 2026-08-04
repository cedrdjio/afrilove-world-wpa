/** Types de la messagerie de notifications — port de `notificationsService`. */

/** 'admin' = annonces diffusées depuis le back-office. */
export type NotificationType = "match" | "message" | "like" | "kyc" | "admin";

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  body: string | null;
  data: Record<string, unknown>;
  read: boolean;
  createdAt: string;
}
