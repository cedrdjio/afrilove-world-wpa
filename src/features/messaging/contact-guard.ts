/**
 * Détection « partage de coordonnées » côté client — miroir de la règle
 * serveur `enforce_free_message_limits` (migration 20260812120000). Elle sert à
 * bloquer l'envoi et à inviter au Premium AVANT l'aller-retour réseau ; le
 * serveur reste l'autorité (backstop non contournable).
 *
 * Règle stricte, choisie pour limiter les faux positifs :
 *  - une suite d'au moins 7 chiffres (espaces, points, tirets, parenthèses et
 *    « + » tolérés entre les chiffres) → numéro de téléphone ;
 *  - un pseudo de messagerie tierce (WhatsApp, Telegram, Snapchat, Viber,
 *    Signal, Instagram) ou le mot « numéro ».
 *
 * Un simple nombre isolé (« j'ai 25 ans », « rdv à 20h ») ne déclenche pas.
 */
const DIGIT_RUN = /\d{7,}/;
const HANDLE_KEYWORDS =
  /(whats\s*app|watsapp|\bwsp\b|telegram|t\.me|snap\s*chat|\bsnap\b|viber|\bsignal\b|insta\s*gram|num[eé]ro)/i;

export function looksLikeContactInfo(text: string): boolean {
  const digitsOnlySeparators = text.replace(/[\s().+/-]/g, "");
  return DIGIT_RUN.test(digitsOnlySeparators) || HANDLE_KEYWORDS.test(text);
}
