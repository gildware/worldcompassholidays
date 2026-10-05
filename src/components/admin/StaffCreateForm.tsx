"use client";

import { useActionState, useEffect } from "react";
import { createStaff } from "@/actions/staff";
import { Field } from "@/components/forms/Field";
import { FormMessage } from "@/components/forms/FormMessage";
import { SubmitButton } from "@/components/forms/SubmitButton";
import { Button } from "@/components/ui/Button";
import { SearchableSelect } from "@/components/ui/SearchableSelect";
import { initialFormState } from "@/lib/forms";

export function StaffCreateForm({
  roles,
  onCancel,
  onSuccess,
}: {
  roles: { id: string; name: string }[];
  onCancel?: () => void;
  onSuccess?: () => void;
}) {
  const [state, action] = useActionState(createStaff, initialFormState);

  useEffect(() => {
    if (state.success) onSuccess?.();
  }, [state.success, onSuccess]);

  return (
    <form action={action} className="grid gap-4">
      <FormMessage state={state} />
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Name" help="staff.name">
          <input name="name" required autoComplete="name" />
        </Field>
        <Field label="Email" help="staff.email">
          <input name="email" type="email" required autoComplete="email" />
        </Field>
        <Field label="Phone" help="staff.phone">
          <input name="phone" type="tel" autoComplete="tel" />
        </Field>
        <Field label="Role">
          <SearchableSelect
            name="roleId"
            defaultValue=""
            required
            placeholder="Choose a role"
            searchPlaceholder="Search roles"
            options={roles.map((role) => ({
              value: role.id,
              label: role.name,
            }))}
          />
        </Field>
      </div>
      <Field
        label="Temporary password"
        hint="Share it with them privately. At least 8 characters."
      >
        <input
          name="password"
          type="password"
          autoComplete="new-password"
          minLength={8}
          required
        />
      </Field>
      <div className="flex flex-col-reverse gap-3 border-t border-line pt-4 sm:flex-row sm:justify-end">
        {onCancel ? (
          <Button type="button" variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
        ) : null}
        <SubmitButton pendingLabel="Adding">Add staff member</SubmitButton>
      </div>
    </form>
  );
}
