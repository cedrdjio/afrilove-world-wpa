import { Suspense, type ReactNode } from "react";

import { Spinner } from "@/components/ui/spinner";

/**
 * Enveloppe les écrans d'auth dans une frontière Suspense : certains
 * (login, callback) lisent `useSearchParams`, ce que Next exige d'isoler.
 */
export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <Suspense
      fallback={
        <div className="grid min-h-dvh place-items-center">
          <Spinner />
        </div>
      }
    >
      {children}
    </Suspense>
  );
}
