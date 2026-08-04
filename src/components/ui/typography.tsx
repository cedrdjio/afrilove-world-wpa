import { type ComponentPropsWithoutRef, type ElementType } from "react";

import { cn } from "@/lib/utils";

/**
 * Primitives typographiques de la charte lavande — port de `Typography` (mobile).
 * - Display  → Plus Jakarta Sans Bold, titres en casse normale ("Bon retour")
 * - Heading  → Plus Jakarta Sans, labels/boutons — jamais en capitales
 * - Body     → Nunito, paragraphes
 */

type TextProps<T extends ElementType> = {
  as?: T;
} & ComponentPropsWithoutRef<T>;

export function DisplayText<T extends ElementType = "p">({
  as,
  className,
  ...props
}: TextProps<T>) {
  const Comp = (as ?? "p") as ElementType;
  return (
    <Comp
      className={cn("font-display text-foreground font-bold", className)}
      {...props}
    />
  );
}

export function DisplayBlackText<T extends ElementType = "p">({
  as,
  className,
  ...props
}: TextProps<T>) {
  const Comp = (as ?? "p") as ElementType;
  return (
    <Comp
      className={cn("font-display text-foreground font-extrabold", className)}
      {...props}
    />
  );
}

export function HeadingText<T extends ElementType = "p">({
  as,
  className,
  ...props
}: TextProps<T>) {
  const Comp = (as ?? "p") as ElementType;
  return (
    <Comp
      className={cn("font-display text-foreground font-bold", className)}
      {...props}
    />
  );
}

export function LabelText<T extends ElementType = "span">({
  as,
  className,
  ...props
}: TextProps<T>) {
  const Comp = (as ?? "span") as ElementType;
  return (
    <Comp
      className={cn(
        "font-display text-subtle-foreground font-semibold",
        className,
      )}
      {...props}
    />
  );
}

export function BodyText<T extends ElementType = "p">({
  as,
  className,
  ...props
}: TextProps<T>) {
  const Comp = (as ?? "p") as ElementType;
  return (
    <Comp
      className={cn("text-muted-foreground font-sans", className)}
      {...props}
    />
  );
}
