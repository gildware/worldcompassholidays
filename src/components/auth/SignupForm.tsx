"use client";

import { useActionState } from "react";
import { customerSignup } from "@/actions/auth";
import { Field } from "@/components/forms/Field";
import { FormMessage } from "@/components/forms/FormMessage";
import { SubmitButton } from "@/components/forms/SubmitButton";
import { initialFormState } from "@/lib/forms";

export function SignupForm({ next }: { next?: string }) {
  const [state, formAction] = useActionState(customerSignup, initialFormState);

  return (
    <form action={formAction} className="grid gap-4">
      <FormMessage state={state} />
      {next ? <input type="hidden" name="next" value={next} /> : null}
      <Field label="Full name">
        <input name="name" autoComplete="name" required />
      </Field>
      <Field label="Email" help="signup.email">
        <input name="email" type="email" autoComplete="email" required />
      </Field>
      <Field label="Phone" help="signup.phone">
        <input name="phone" type="tel" autoComplete="tel" />
      </Field>
      <Field label="Password" help="signup.password" hint="At least 8 characters.">
        <input name="password" type="password" autoComplete="new-password" minLength={8} required />
      </Field>
      <SubmitButton pendingLabel="Creating account">Create account</SubmitButton>
    </form>
  );
}
