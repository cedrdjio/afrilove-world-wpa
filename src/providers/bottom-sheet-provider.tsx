"use client";

import { Drawer, DrawerContent } from "@/components/ui/drawer";
import { useUIStore } from "@/store/ui-store";

/**
 * Rend le bottom sheet global piloté par le UI store.
 * Ouvrir depuis n'importe où : `useUIStore.getState().openSheet({ content })`.
 */
export function BottomSheetProvider() {
  const sheet = useUIStore((s) => s.sheet);
  const closeSheet = useUIStore((s) => s.closeSheet);

  return (
    <Drawer
      open={sheet !== null}
      onOpenChange={(open) => {
        if (!open) closeSheet();
      }}
      dismissible={sheet?.dismissible ?? true}
    >
      {sheet && (
        <DrawerContent title={sheet.title} description={sheet.description}>
          {sheet.content}
        </DrawerContent>
      )}
    </Drawer>
  );
}
