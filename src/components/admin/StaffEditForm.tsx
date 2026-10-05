"use client";

import { useActionState, useEffect } from "react";
import { updateStaff } from "@/actions/staff";
import { Field } from "@/components/forms/Field";
import { FieldHelp } from "@/components/forms/FieldHelp";
import { FormMessage } from "@/components/forms/FormMessage";
import { SubmitButton } from "@/components/forms/SubmitButton";
import { Button } from "@/components/ui/Button";
import { SearchableSelect } from "@/components/ui/SearchableSelect";
import { initialFormState } from "@/lib/forms";

export function StaffEditForm({
  member,
  roles,
  onCancel,
  onSuccess,
}: {
  member: {
    id: string;
    name: string;
    email: string;
    roleId: string;
    isActive: boolean;
  };
  roles: { id: string; name: string }[];
  onCancel?: () => void;
  onSuccess?: () => void;
}) {
  const [state, action] = useActionState(updateStaff, initialFormState);

  useEffect(() => {
    if (state.success) onSuccess?.();
  }, [state.success, onSuccess]);

  return (
    <form action={action} className="grid gap-4">
      <input type="hidden" name="userId" value={member.id} />
      <FormMessage state={state} />

      <div className="rounded-lg bg-surface px-3 py-2 text-sm">
        <p className="font-medium text-navy">{member.name}</p>
        <p className="text-muted">{member.email}</p>
      </div>

      <Field label="Role">
        <SearchableSelect
          name="roleId"
          defaultValue={member.roleId}
          searchPlaceholder="Search roles"
          options={roles.map((role) => ({
            value: role.id,
            label: role.name,
          }))}
        />
      </Field>

      <Field
        label="New password"
        help="staff.newPassword"
        hint="Leave blank to keep the current password."
      >
        <input
          name="password"
          type="password"
          autoComplete="new-password"
          placeholder="Optional"
        />
      </Field>

      <label className="flex items-center gap-3 rounded-lg border border-line px-3 py-3 text-sm">
        <input
          name="isActive"
          type="checkbox"
          defaultChecked={member.isActive}
          className="h-4 w-4 accent-brand"
        />
        <span>
          <span className="inline-flex items-center gap-1.5 font-medium text-navy">
            Active account
            <FieldHelp label="Active account" />
          </span>
          <span className="mt-0.5 block text-xs text-muted">
            Inactive staff cannot sign in.
          </span>
        </span>
      </label>

      <div className="flex flex-col-reverse gap-3 border-t border-line pt-4 sm:flex-row sm:justify-end">
        {onCancel ? (
          <Button type="button" variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
        ) : null}
        <SubmitButton pendingLabel="Saving">Save changes</SubmitButton>
      </div>
    </form>
  );
}
