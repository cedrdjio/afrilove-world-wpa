"use client";

import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useUIStore } from "@/store/ui-store";

/**
 * Rend la modale globale pilotée par le UI store.
 * Ouvrir depuis n'importe où : `useUIStore.getState().openModal({ content })`.
 */
export function ModalProvider() {
  const modal = useUIStore((s) => s.modal);
  const closeModal = useUIStore((s) => s.closeModal);

  return (
    <Dialog
      open={modal !== null}
      onOpenChange={(open) => {
        if (!open) closeModal();
      }}
    >
      {modal && (
        <DialogContent
          title={modal.title}
          description={modal.description}
          showClose={modal.dismissible ?? true}
          onInteractOutside={(e) => {
            if (modal.dismissible === false) e.preventDefault();
          }}
        >
          {modal.content}
        </DialogContent>
      )}
    </Dialog>
  );
}
