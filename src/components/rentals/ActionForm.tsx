"use client";

import { useActionState, type FormEvent, type ReactNode } from "react";
import { FormMessage } from "@/components/forms/FormMessage";
import { initialFormState, type FormState } from "@/lib/forms";

export function ActionForm({
  action,
  children,
  className,
  noValidate = false,
  onSubmit,
}: {
  action: (state: FormState, formData: FormData) => Promise<FormState>;
  children: ReactNode;
  className?: string;
  noValidate?: boolean;
  onSubmit?: (event: FormEvent<HTMLFormElement>) => void;
}) {
  const [state, formAction] = useActionState(action, initialFormState);

  return (
    <form action={formAction} className={className} noValidate={noValidate || undefined} onSubmit={onSubmit}>
      <FormMessage state={state} />
      {children}
    </form>
  );
}
