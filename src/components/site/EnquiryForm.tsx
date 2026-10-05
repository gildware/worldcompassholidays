"use client";

import { useActionState } from "react";
import { submitEnquiry } from "@/actions/enquiry";
import { Field } from "@/components/forms/Field";
import { FormMessage } from "@/components/forms/FormMessage";
import { SubmitButton } from "@/components/forms/SubmitButton";
import { SearchableSelect } from "@/components/ui/SearchableSelect";
import { initialFormState } from "@/lib/forms";

export function EnquiryForm({
  interests,
  sent,
  customer,
}: {
  interests: { value: string; label: string }[];
  sent: boolean;
  customer: { name: string; email: string; phone: string } | null;
}) {
  const [state, action] = useActionState(submitEnquiry, initialFormState);

  if (sent) {
    return (
      <div className="rounded-xl bg-brand-soft px-5 py-6">
        <p className="font-medium">Enquiry received.</p>
        <p className="mt-2 text-sm leading-6 text-muted">
          The team will reply by email. Create an account next time to track
          your requests online.
        </p>
      </div>
    );
  }

  return (
    <form action={action} className="grid gap-4">
      <FormMessage state={state} />
      {customer ? (
        <p className="rounded-md bg-surface px-3 py-2 text-sm text-muted">
          Sending as {customer.name} ({customer.email}). This request will
          appear in your account.
        </p>
      ) : (
        <>
          <Field label="Name" help="enquiry.name">
            <input name="name" autoComplete="name" required />
          </Field>
          <Field label="Email" help="enquiry.email">
            <input name="email" type="email" autoComplete="email" required />
          </Field>
        </>
      )}
      <Field label="Phone" help="enquiry.phone">
        <input
          name="phone"
          type="tel"
          autoComplete="tel"
          defaultValue={customer?.phone}
        />
      </Field>
      <Field label="Interest">
        <SearchableSelect
          name="interest"
          defaultValue={interests[0]?.value ?? ""}
          searchPlaceholder="Search interests"
          options={interests}
        />
      </Field>
      <Field label="Message">
        <textarea name="message" required />
      </Field>
      <SubmitButton pendingLabel="Sending">Send enquiry</SubmitButton>
    </form>
  );
}
