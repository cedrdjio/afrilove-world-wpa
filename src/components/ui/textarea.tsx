"use client";

import { forwardRef, type TextareaHTMLAttributes } from "react";

import { cn } from "@/lib/utils";

export type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  invalid?: boolean;
};

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, invalid, rows = 4, ...props }, ref) => (
    <textarea
      ref={ref}
      rows={rows}
      aria-invalid={invalid || undefined}
      className={cn(
        "border-border bg-muted/40 text-foreground placeholder:text-muted-foreground/70 w-full resize-none rounded-[var(--radius-md)] border px-4 py-3 text-[0.95rem] leading-relaxed transition-colors",
        "focus-visible:border-primary focus-visible:ring-ring/40 focus-visible:bg-background focus-visible:ring-2 focus-visible:outline-none",
        "aria-[invalid=true]:border-danger",
        className,
      )}
      {...props}
    />
  ),
);
Textarea.displayName = "Textarea";
