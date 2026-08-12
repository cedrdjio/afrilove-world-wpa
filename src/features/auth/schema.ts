import { z } from "zod";

/**
 * Schémas de validation partagés des formulaires d'authentification.
 * Messages en français (langue produit) — réutilisés par React Hook Form.
 */

const email = z
  .string()
  .min(1, "L'adresse e-mail est requise.")
  .email("Adresse e-mail invalide.");

const password = z
  .string()
  .min(8, "8 caractères minimum.")
  .max(72, "72 caractères maximum."); // limite bcrypt côté GoTrue

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
