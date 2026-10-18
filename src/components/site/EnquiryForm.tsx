"use client";

import { useActionState, useState, type MouseEvent } from "react";
import { submitEnquiry } from "@/actions/enquiry";
import { Field } from "@/components/forms/Field";
import { FormMessage } from "@/components/forms/FormMessage";
import { SubmitButton } from "@/components/forms/SubmitButton";
import { SearchableSelect } from "@/components/ui/SearchableSelect";
import { initialFormState, type FormState } from "@/lib/forms";

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
  const [state, action, pending] = useActionState(submitEnquiry, initialFormState);
  const [whatsappState, setWhatsappState] = useState<FormState | null>(null);
  const [whatsappPending, setWhatsappPending] = useState(false);
  const view = whatsappState ?? state;
  const busy = pending || whatsappPending;

  async function sendOnWhatsApp(event: MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    const form = event.currentTarget.form;
    if (!form || busy) return;
    const data = new FormData(form);
    data.set("channel", "whatsapp");
    setWhatsappPending(true);
    const result = await submitEnquiry(initialFormState, data);
    setWhatsappState(result);
    setWhatsappPending(false);
    if (result.whatsappUrl) window.open(result.whatsappUrl, "_blank", "noopener,noreferrer");
  }

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

  if (whatsappState?.reference && !whatsappState.error) {
    return (
      <div className="rounded-xl bg-brand-soft px-5 py-6">
        <p className="font-medium">Enquiry saved.</p>
        <p className="mt-2 text-sm leading-6 text-muted">
          {whatsappState.reference ? `Reference ${whatsappState.reference}. ` : ""}
          The desk already has this message. Send it on WhatsApp so they have the same details there.
        </p>
        {whatsappState.whatsappUrl ? (
          <a
            className="mt-4 inline-flex h-11 items-center rounded-lg bg-brand px-4 text-sm font-medium text-white"
            href={whatsappState.whatsappUrl}
            target="_blank"
            rel="noreferrer"
          >
            Open WhatsApp
          </a>
        ) : null}
      </div>
    );
  }

  const fieldClass = compact ? "!gap-1.5 text-[15px]" : "";
  const saved = view.values ?? {};

  return (
    <form
      action={action}
      noValidate
      onSubmit={() => setWhatsappState(null)}
      className={
        compact
          ? "grid gap-3 [&_input]:!h-11 [&_textarea]:!min-h-24 [&_[aria-haspopup=listbox]]:!h-11"
          : "grid gap-4"
      }
    >
      {view.error && !view.fields ? <FormMessage state={view} /> : null}
      {view.fields ? (
        <p role="alert" className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          Check the highlighted fields.
        </p>
      ) : null}
      {customer ? (
        <p className="rounded-md bg-surface px-3 py-2 text-sm text-muted">
          Sending as {customer.name} ({customer.email}). This request will
          appear in your account.
        </p>
      ) : (
        <div className={compact ? "grid gap-3 sm:grid-cols-2" : "contents"}>
          <Field label="Name" help="enquiry.name" name="name" error={view.fields?.name} className={fieldClass}>
            <input
              name="name"
              autoComplete="name"
              defaultValue={saved.name}
              aria-invalid={view.fields?.name ? true : undefined}
            />
          </Field>
          <Field label="Email" help="enquiry.email" name="email" error={view.fields?.email} className={fieldClass}>
            <input
              name="email"
              type="email"
              autoComplete="email"
              defaultValue={saved.email}
              aria-invalid={view.fields?.email ? true : undefined}
            />
          </Field>
        </div>
      )}
      <div className={compact ? "grid gap-3 sm:grid-cols-2" : "contents"}>
        <Field label="Phone" help="enquiry.phone" name="phone" required error={view.fields?.phone} className={fieldClass}>
          <input
            name="phone"
            type="tel"
            autoComplete="tel"
            defaultValue={saved.phone || customer?.phone}
            aria-invalid={view.fields?.phone ? true : undefined}
          />
        </Field>
        <Field label="Interest" name="interest" error={view.fields?.interest} className={fieldClass}>
          <SearchableSelect
            name="interest"
            defaultValue={saved.interest || interests[0]?.value || ""}
            searchPlaceholder="Search interests"
            options={interests}
            invalid={Boolean(view.fields?.interest)}
          />
        </Field>
      </div>
      <Field label="Message" name="message" error={view.fields?.message} className={fieldClass}>
        <textarea
          name="message"
          rows={compact ? 3 : undefined}
          defaultValue={saved.message}
          aria-invalid={view.fields?.message ? true : undefined}
        />
      </Field>
      <div className="flex flex-wrap items-center gap-3">
        <SubmitButton pendingLabel="Sending" disabled={busy} className={compact ? "!h-11 text-base" : ""}>
          Send enquiry
        </SubmitButton>
        <button
          type="button"
          disabled={busy}
          onClick={sendOnWhatsApp}
          className="inline-flex h-11 items-center rounded-lg border border-line bg-white px-4 text-sm font-medium text-navy hover:bg-surface disabled:cursor-not-allowed disabled:opacity-60"
        >
          {whatsappPending ? "Saving…" : "Send on WhatsApp"}
        </button>
      </div>
    </form>
  );
}
