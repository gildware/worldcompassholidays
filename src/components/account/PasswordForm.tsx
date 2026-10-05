"use client";

import { useActionState } from "react";
import { changePassword } from "@/actions/account";
import { Field } from "@/components/forms/Field";
import { FormMessage } from "@/components/forms/FormMessage";
import { SubmitButton } from "@/components/forms/SubmitButton";
import { initialFormState } from "@/lib/forms";

export function PasswordForm() {
  const [state, action] = useActionState(changePassword, initialFormState);

  return (
    <form action={action} className="grid gap-4 rounded-xl border border-line bg-white p-5">
      <h2 className="text-lg font-semibold">Change password</h2>
      <FormMessage state={state} />
      <Field label="Current password">
        <input name="currentPassword" type="password" autoComplete="current-password" required />
      </Field>
      <Field label="New password" help="account.newPassword" hint="At least 8 characters.">
        <input
          name="newPassword"
          type="password"
          autoComplete="new-password"
          minLength={8}
          required
        />
      </Field>
      <div>
        <SubmitButton pendingLabel="Saving">Change password</SubmitButton>
      </div>
    </form>
  );
}
