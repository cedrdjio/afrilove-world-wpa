import { z } from "zod";

/**
 * Schémas de validation partagés des formulaires d'authentification.
 * Messages en français (langue produit) — réutilisés par React Hook Form.
 */

const email = z
  .string()
  .min(1, "L'adresse e-mail est requise.")
  .email("Adresse e-mail invalide.");

// Parité mobile (`newPasswordSchema`) : 8+ caractères mêlant lettres et
// chiffres. La connexion, elle, ne vérifie que la non-vacuité (un ancien mot
// de passe plus court ne doit jamais verrouiller son propriétaire côté client).
const password = z
  .string()
  .min(8, "Au moins 8 caractères.")
  .max(72, "72 caractères maximum.") // limite bcrypt côté GoTrue
  .regex(/[a-zA-Z]/, "Au moins une lettre.")
  .regex(/[0-9]/, "Au moins un chiffre.");

/** Code OTP reçu par e-mail — longueur variable selon la config GoTrue. */
export const otpSchema = z
  .string()
  .trim()
  .min(4, "Code trop court.")
  .regex(/^\d+$/, "Le code ne contient que des chiffres.");

export const loginSchema = z.object({
  email,
  password: z.string().min(1, "Le mot de passe est requis."),
});
export type LoginValues = z.infer<typeof loginSchema>;

export const registerSchema = z
  .object({
    firstName: z
      .string()
      .trim()
      .min(2, "Au moins 2 caractères.")
      .max(40, "40 caractères maximum."),
    email,
    password,
    confirmPassword: z.string().min(1, "Confirmez votre mot de passe."),
    acceptTerms: z.literal(true, {
      errorMap: () => ({ message: "Vous devez accepter les conditions." }),
    }),
  })
  .refine((v) => v.password === v.confirmPassword, {
    path: ["confirmPassword"],
    message: "Les mots de passe ne correspondent pas.",
  });
export type RegisterValues = z.infer<typeof registerSchema>;

export const forgotPasswordSchema = z.object({ email });
export type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>;

export const resetPasswordSchema = z
  .object({
    password,
    confirmPassword: z.string().min(1, "Confirmez votre mot de passe."),
  })
  .refine((v) => v.password === v.confirmPassword, {
    path: ["confirmPassword"],
    message: "Les mots de passe ne correspondent pas.",
  });
export type ResetPasswordValues = z.infer<typeof resetPasswordSchema>;
