"use client";

import { useEffect, useState, useTransition } from "react";
import { useFormStatus } from "react-dom";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";

type ConfirmDialogProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  /** Server action bound to a form (preferred for deletes). */
  action?: (formData: FormData) => void | Promise<void>;
  /** Hidden fields posted with the server action. */
  fields?: Record<string, string>;
  /** Client-side confirm when no server action is needed. */
  onConfirm?: () => void | Promise<void>;
};

function ConfirmSubmit({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" variant="danger" disabled={pending}>
      {pending ? "Working…" : label}
    </Button>
  );
}

export function ConfirmDialog({
  open,
  onClose,
  title,
  description,
  confirmLabel = "Delete",
  cancelLabel = "Cancel",
  action,
  fields,
  onConfirm,
}: ConfirmDialogProps) {
  const [pendingClient, startTransition] = useTransition();
  const [mountedOpen, setMountedOpen] = useState(open);

  useEffect(() => {
    setMountedOpen(open);
  }, [open]);

  return (
    <Modal
      open={mountedOpen}
      onClose={onClose}
      title={title}
      description={description}
      size="sm"
      preventClose={pendingClient}
    >
      {action ? (
        <form action={action} className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          {fields
            ? Object.entries(fields).map(([name, value]) => (
                <input key={name} type="hidden" name={name} value={value} />
              ))
            : null}
          <Button type="button" variant="secondary" onClick={onClose}>
            {cancelLabel}
          </Button>
          <ConfirmSubmit label={confirmLabel} />
        </form>
      ) : (
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button type="button" variant="secondary" onClick={onClose} disabled={pendingClient}>
            {onConfirm ? cancelLabel : "Close"}
          </Button>
          {onConfirm ? (
            <Button
              type="button"
              variant="danger"
              disabled={pendingClient}
              onClick={() => {
                startTransition(async () => {
                  await onConfirm();
                  onClose();
                });
              }}
            >
              {pendingClient ? "Working…" : confirmLabel}
            </Button>
          ) : null}
        </div>
      )}
    </Modal>
  );
}
