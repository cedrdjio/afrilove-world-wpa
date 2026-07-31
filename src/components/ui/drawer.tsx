"use client";

import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import {
  forwardRef,
  type ComponentPropsWithoutRef,
  type ElementRef,
  type ReactNode,
} from "react";
import { Drawer as DrawerPrimitive } from "vaul";

import { cn } from "@/lib/utils";

/** Bottom sheet mobile natif (vaul) — glisser pour fermer, snap points. */
export const Drawer = DrawerPrimitive.Root;
export const DrawerTrigger = DrawerPrimitive.Trigger;
export const DrawerClose = DrawerPrimitive.Close;

interface DrawerContentProps extends ComponentPropsWithoutRef<
  typeof DrawerPrimitive.Content
> {
  title?: string;
  description?: string;
  children: ReactNode;
}

export const DrawerContent = forwardRef<
  ElementRef<typeof DrawerPrimitive.Content>,
  DrawerContentProps
>(({ className, children, title, description, ...props }, ref) => (
  <DrawerPrimitive.Portal>
    <DrawerPrimitive.Overlay className="bg-brand-950/40 fixed inset-0 z-50 backdrop-blur-sm" />
    <DrawerPrimitive.Content
      ref={ref}
      className={cn(
        "bg-card shadow-glass fixed inset-x-0 bottom-0 z-50 mx-auto flex max-h-[92vh] w-full max-w-lg flex-col rounded-t-[var(--radius-2xl)] pb-[env(safe-area-inset-bottom)]",
        className,
      )}
      {...props}
    >
      <div className="bg-muted mx-auto mt-3 h-1.5 w-11 shrink-0 rounded-full" />
      <div className="overflow-y-auto px-6 pt-4 pb-6">
        {title ? (
          <DrawerPrimitive.Title className="text-card-foreground text-lg font-bold">
            {title}
          </DrawerPrimitive.Title>
        ) : (
          <VisuallyHidden asChild>
            <DrawerPrimitive.Title>Panneau</DrawerPrimitive.Title>
          </VisuallyHidden>
        )}
        {description ? (
          <DrawerPrimitive.Description className="text-muted-foreground mt-1 text-sm">
            {description}
          </DrawerPrimitive.Description>
        ) : (
          <VisuallyHidden asChild>
            <DrawerPrimitive.Description>
              Contenu du panneau
            </DrawerPrimitive.Description>
          </VisuallyHidden>
        )}
        <div className={cn(title || description ? "mt-4" : undefined)}>
          {children}
        </div>
      </div>
    </DrawerPrimitive.Content>
  </DrawerPrimitive.Portal>
));
DrawerContent.displayName = "DrawerContent";
