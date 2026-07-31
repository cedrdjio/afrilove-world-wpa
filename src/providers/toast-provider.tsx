"use client";

import { useTheme } from "next-themes";
import { Toaster } from "sonner";

/**
 * Notifications toast (sonner), accordées au thème et à la charte lavande.
 * Utilisation ailleurs : `import { toast } from "sonner"`.
 */
export function ToastProvider() {
  const { resolvedTheme } = useTheme();
  return (
    <Toaster
      theme={resolvedTheme === "dark" ? "dark" : "light"}
      position="top-center"
      richColors
      closeButton
      toastOptions={{
        style: {
          borderRadius: "1rem",
          fontFamily: "var(--font-nunito)",
        },
      }}
    />
  );
}
