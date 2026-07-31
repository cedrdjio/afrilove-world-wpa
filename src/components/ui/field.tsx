"use client";

import { type ReactNode } from "react";
import { AnimatePresence, m } from "framer-motion";

import { cn } from "@/lib/utils";

interface FieldProps {
  label: string;
  htmlFor: string;
  error?: string;
  hint?: string;
  children: ReactNode;
  className?: string;
}

/** Regroupe label + contrôle + message d'erreur animé (accessible). */
export function Field({
  label,
  htmlFor,
  error,
  hint,
  children,
  className,
}: FieldProps) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label
        htmlFor={htmlFor}
        className="text-foreground text-sm font-semibold"
      >
        {label}
      </label>
      {children}
      <AnimatePresence mode="wait" initial={false}>
        {error ? (
          <m.p
            key="error"
            id={`${htmlFor}-error`}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="text-danger text-xs font-medium"
          >
            {error}
          </m.p>
        ) : hint ? (
          <p className="text-muted-foreground text-xs">{hint}</p>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
