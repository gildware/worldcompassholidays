"use client";

import { useActionState } from "react";
import { updateProfile } from "@/actions/account";
import { Field } from "@/components/forms/Field";
import { FormMessage } from "@/components/forms/FormMessage";
import { SubmitButton } from "@/components/forms/SubmitButton";
import { initialFormState } from "@/lib/forms";

export function ProfileForm({
  name,
  email,
  phone,
}: {
  name: string;
  email: string;
  phone: string;
}) {
  const [state, action] = useActionState(updateProfile, initialFormState);

  return (
    <form action={action} className="grid gap-4 rounded-xl border border-line bg-white p-5">
      <h2 className="text-lg font-semibold">Profile</h2>
      <FormMessage state={state} />
      <Field label="Full name">
        <input name="name" defaultValue={name} autoComplete="name" required />
      </Field>
      <Field label="Email" help="profile.email" hint="Contact us to change the email on your account.">
        <input value={email} readOnly aria-readonly className="bg-surface" />
      </Field>
      <Field label="Phone" help="profile.phone">
        <input name="phone" type="tel" defaultValue={phone} autoComplete="tel" />
      </Field>
      <div>
        <SubmitButton pendingLabel="Saving">Save profile</SubmitButton>
      </div>
    </form>
  );
}
