"use client";

import { useActionState } from "react";
import { Field } from "@/components/forms/Field";
import { FormMessage } from "@/components/forms/FormMessage";
import { SubmitButton } from "@/components/forms/SubmitButton";
import { initialFormState, type FormState } from "@/lib/forms";

export function LoginForm({
  action,
  next,
}: {
  action: (state: FormState, formData: FormData) => Promise<FormState>;
  next?: string;
}) {
  const [state, formAction] = useActionState(action, initialFormState);

  return (
    <form action={formAction} className="grid gap-4">
      <FormMessage state={state} />
      {next ? <input type="hidden" name="next" value={next} /> : null}
      <Field label="Email" help="login.email">
        <input name="email" type="email" autoComplete="email" required />
      </Field>
      <Field label="Password" help="login.password">
        <input name="password" type="password" autoComplete="current-password" required />
      </Field>
      <SubmitButton pendingLabel="Signing in">Sign in</SubmitButton>
    </form>
  );
}
