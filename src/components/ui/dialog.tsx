"use client";

import * as DialogPrimitive from "@radix-ui/react-dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { X } from "lucide-react";
import {
  forwardRef,
  type ComponentPropsWithoutRef,
  type ElementRef,
} from "react";

import { cn } from "@/lib/utils";

export const Dialog = DialogPrimitive.Root;
export const DialogTrigger = DialogPrimitive.Trigger;
export const DialogClose = DialogPrimitive.Close;

const DialogOverlay = forwardRef<
  ElementRef<typeof DialogPrimitive.Overlay>,
  ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      "bg-brand-950/40 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 backdrop-blur-sm",
      className,
    )}
    {...props}
  />
));
DialogOverlay.displayName = "DialogOverlay";

interface DialogContentProps extends ComponentPropsWithoutRef<
  typeof DialogPrimitive.Content
> {
  title?: string;
  description?: string;
  showClose?: boolean;
}

export const DialogContent = forwardRef<
  ElementRef<typeof DialogPrimitive.Content>,
  DialogContentProps
>(
  (
    { className, children, title, description, showClose = true, ...props },
    ref,
  ) => (
    <DialogPrimitive.Portal>
      <DialogOverlay />
      <DialogPrimitive.Content
        ref={ref}
        className={cn(
          "bg-card shadow-glass data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 fixed top-1/2 left-1/2 z-50 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-[var(--radius-xl)] p-6",
          className,
        )}
        {...props}
      >
        {title ? (
          <DialogPrimitive.Title className="text-card-foreground text-lg font-bold">
            {title}
          </DialogPrimitive.Title>
        ) : (
          <VisuallyHidden asChild>
            <DialogPrimitive.Title>Fenêtre</DialogPrimitive.Title>
          </VisuallyHidden>
        )}
        {description ? (
          <DialogPrimitive.Description className="text-muted-foreground mt-1 text-sm">
            {description}
          </DialogPrimitive.Description>
        ) : (
          <VisuallyHidden asChild>
            <DialogPrimitive.Description>
              Contenu de la fenêtre
            </DialogPrimitive.Description>
          </VisuallyHidden>
        )}

        <div className={cn(title || description ? "mt-4" : undefined)}>
          {children}
        </div>

        {showClose && (
          <DialogPrimitive.Close
            aria-label="Fermer"
            className="text-muted-foreground hover:bg-muted focus-visible:ring-ring absolute top-4 right-4 rounded-full p-1.5 transition-colors focus-visible:ring-2 focus-visible:outline-none"
          >
            <X className="size-5" />
          </DialogPrimitive.Close>
        )}
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  ),
);
DialogContent.displayName = "DialogContent";
