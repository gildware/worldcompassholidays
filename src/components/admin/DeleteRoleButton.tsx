"use client";

import { useState } from "react";
import { deleteRole } from "@/actions/roles";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";

export function DeleteRoleButton({
  roleId,
  roleName,
  disabledReason,
}: {
  roleId: string;
  roleName: string;
  disabledReason?: string;
}) {
  const [open, setOpen] = useState(false);

  if (disabledReason) {
    return (
      <p className="rounded-lg border border-line bg-white px-3 py-2.5 text-xs leading-5 text-muted">
        {disabledReason}
      </p>
    );
  }

  return (
    <>
      <div className="flex flex-col gap-2 rounded-lg border border-red-100 bg-red-50/40 px-3 py-2.5 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs leading-5 text-muted">
          Delete <span className="font-medium text-navy">{roleName}</span> permanently.
        </p>
        <Button
          type="button"
          variant="dangerOutline"
          size="sm"
          className="w-full shrink-0 sm:w-auto"
          onClick={() => setOpen(true)}
        >
          Delete role
        </Button>
      </div>

      <ConfirmDialog
        open={open}
        onClose={() => setOpen(false)}
        title="Delete this role?"
        description={`“${roleName}” will be removed. Staff must be moved to another role first if anyone still has it.`}
        confirmLabel="Delete role"
        action={deleteRole}
        fields={{ roleId }}
      />
    </>
  );
}
