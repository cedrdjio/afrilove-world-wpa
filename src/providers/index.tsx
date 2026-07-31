"use client";

import { type ReactNode } from "react";

import { AuthProvider } from "./auth-provider";
import { BottomSheetProvider } from "./bottom-sheet-provider";
import { ModalProvider } from "./modal-provider";
import { MotionProvider } from "./motion-provider";
import { QueryProvider } from "./query-provider";
import { SettingsProvider } from "./settings-provider";
import { SupabaseProvider } from "./supabase-provider";
import { ThemeProvider } from "./theme-provider";
import { ToastProvider } from "./toast-provider";

/**
 * Point d'entrée unique des providers globaux.
 * Ordre pensé pour les dépendances : thème → réglages → data (query/supabase)
 * → auth → animation → contenu. Les surcouches (toast/modal/sheet) sont
 * montées à la fin pour flotter au-dessus de tout.
 *
 * Chaque provider est indépendant des fonctionnalités métier (Sprint 00).
 */
export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <SettingsProvider>
        <QueryProvider>
          <SupabaseProvider>
            <AuthProvider>
              <MotionProvider>
                {children}
                <ToastProvider />
                <ModalProvider />
                <BottomSheetProvider />
              </MotionProvider>
            </AuthProvider>
          </SupabaseProvider>
        </QueryProvider>
      </SettingsProvider>
    </ThemeProvider>
  );
}
