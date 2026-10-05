"use client";

import { useActionState, type ReactNode } from "react";
import { FormMessage } from "@/components/forms/FormMessage";
import { initialFormState, type FormState } from "@/lib/forms";

export function ActionForm({
  action,
  children,
  className,
}: {
  action: (state: FormState, formData: FormData) => Promise<FormState>;
  children: ReactNode;
  className?: string;
}) {
  const [state, formAction] = useActionState(action, initialFormState);

  return (
    <form action={formAction} className={className}>
      <FormMessage state={state} />
      {children}
    </form>
  );
}
