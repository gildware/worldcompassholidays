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
  compact = false,
}: {
  interests: { value: string; label: string }[];
  sent: boolean;
  customer: { name: string; email: string; phone: string } | null;
  compact?: boolean;
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

  const fieldClass = compact ? "!gap-1.5 text-[15px]" : "";

  return (
    <form
      action={action}
      className={
        compact
          ? "grid gap-3 [&_input]:!h-11 [&_textarea]:!min-h-24 [&_[aria-haspopup=listbox]]:!h-11"
          : "grid gap-4"
      }
    >
      <FormMessage state={state} />
      {customer ? (
        <p className="rounded-md bg-surface px-3 py-2 text-sm text-muted">
          Sending as {customer.name} ({customer.email}). This request will
          appear in your account.
        </p>
      ) : (
        <div className={compact ? "grid gap-3 sm:grid-cols-2" : "contents"}>
          <Field label="Name" help="enquiry.name" className={fieldClass}>
            <input name="name" autoComplete="name" required />
          </Field>
          <Field label="Email" help="enquiry.email" className={fieldClass}>
            <input name="email" type="email" autoComplete="email" required />
          </Field>
        </div>
      )}
      <div className={compact ? "grid gap-3 sm:grid-cols-2" : "contents"}>
        <Field label="Phone" help="enquiry.phone" className={fieldClass}>
          <input
            name="phone"
            type="tel"
            autoComplete="tel"
            defaultValue={customer?.phone}
          />
        </Field>
        <Field label="Interest" className={fieldClass}>
          <SearchableSelect
            name="interest"
            defaultValue={interests[0]?.value ?? ""}
            searchPlaceholder="Search interests"
            options={interests}
          />
        </Field>
      </div>
      <Field label="Message" className={fieldClass}>
        <textarea name="message" required rows={compact ? 3 : undefined} />
      </Field>
      <SubmitButton pendingLabel="Sending" className={compact ? "!h-11 text-base" : ""}>
        Send enquiry
      </SubmitButton>
    </form>
  );
}
