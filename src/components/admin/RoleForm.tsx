"use client";

import { useActionState } from "react";
import { createRole, updateRole } from "@/actions/roles";
import { PermissionMatrix } from "@/components/admin/PermissionMatrix";
import { FieldHelp } from "@/components/forms/FieldHelp";
import { FormMessage } from "@/components/forms/FormMessage";
import { SubmitButton } from "@/components/forms/SubmitButton";
import { ButtonLink } from "@/components/ui/Button";
import type { MatrixRow } from "@/lib/auth/permission-matrix";
import { initialFormState } from "@/lib/forms";

export function RoleForm({
  role,
  rows,
  cancelHref = "/admin/roles",
}: {
  role?: { id: string; name: string; permissions: string[] };
  rows: MatrixRow[];
  cancelHref?: string;
}) {
  const [state, action] = useActionState(role ? updateRole : createRole, initialFormState);

  return (
    <form action={action} className="grid gap-3">
      {role ? <input type="hidden" name="roleId" value={role.id} /> : null}
      <FormMessage state={state} />

      <div className="rounded-lg border border-line bg-white">
        <div className="flex flex-col gap-3 border-b border-line px-4 py-3 sm:flex-row sm:items-end sm:justify-between">
          <label className="grid min-w-0 flex-1 gap-1 text-xs font-medium text-navy sm:max-w-sm">
            <span className="inline-flex items-center gap-1.5">
              Role name
              <FieldHelp label="Role name" />
            </span>
            <input
              name="name"
              defaultValue={role?.name}
              required
              placeholder="e.g. Operations staff"
              autoComplete="off"
              className="!h-10"
            />
          </label>
          <p className="text-xs leading-5 text-muted sm:max-w-xs sm:text-right">
            Empty cells mean that action does not apply.
          </p>
        </div>

        <PermissionMatrix
          rows={rows}
          initialSelected={role?.permissions ?? []}
        />
      </div>

      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <ButtonLink
          href={cancelHref}
          variant="secondary"
          size="sm"
          className="w-full sm:w-auto"
        >
          Cancel
        </ButtonLink>
        <SubmitButton pendingLabel="Saving" className="!h-9 w-full sm:w-auto">
          {role ? "Save role" : "Create role"}
        </SubmitButton>
      </div>
    </form>
  );
}
