"use client";

import { useActionState, useEffect, useRef, useState, type FormEvent, type MouseEvent } from "react";
import { submitEnquiry } from "@/actions/enquiry";
import { CountryCodeSelect } from "@/components/auth/CountryCodeSelect";
import type { ContactFormCopy } from "@/i18n/contact-form";
import type { Locale, LocaleDirection } from "@/i18n/locales";
import { Field } from "@/components/forms/Field";
import { FormMessage } from "@/components/forms/FormMessage";
import { SubmitButton } from "@/components/forms/SubmitButton";
import { SearchableSelect } from "@/components/ui/SearchableSelect";
import {
  COUNTRIES,
  countryByIso,
  countryFromTimeZone,
  matchDial,
  nationalNumber,
  nationalPhoneError,
  nationalPhoneField,
  toInternational,
} from "@/lib/auth/countries";
import { formatPhone } from "@/lib/auth/phone";
import { initialFormState, type FormState } from "@/lib/forms";

function readPhone(value: string) {
  const trimmed = value.trim();
  if (!trimmed.startsWith("+")) return { iso: "IN", national: trimmed.replace(/\D/g, "") };
  const dial = matchDial(trimmed.replace(/\D/g, ""));
  const country = COUNTRIES.find((item) => item.dial === dial);
  if (!country) return { iso: "IN", national: trimmed.replace(/\D/g, "") };
  return { iso: country.iso, national: nationalNumber(country.iso, trimmed) };
}

function fill(template: string, values: Record<string, string>) {
  return template.replace(/\{(\w+)\}/g, (_, key: string) => values[key] ?? "");
}

export function EnquiryForm({
  interests,
  sent,
  customer,
  compact = false,
  copy,
  locale,
  dir,
}: {
  interests: { value: string; label: string }[];
  sent: boolean;
  customer: { name: string; email: string; phone: string } | null;
  compact?: boolean;
  copy: ContactFormCopy;
  locale: Locale;
  dir: LocaleDirection;
}) {
  const [state, action, pending] = useActionState(submitEnquiry, initialFormState);
  const [whatsappState, setWhatsappState] = useState<FormState | null>(null);
  const [whatsappPending, setWhatsappPending] = useState(false);
  const seeded = readPhone(customer?.phone ?? "");
  const [country, setCountry] = useState(seeded.iso);
  const [national, setNational] = useState(seeded.national);
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const countryPicked = useRef(Boolean(customer?.phone));
  const view = whatsappState ?? state;
  const busy = pending || whatsappPending;
  const phoneField = nationalPhoneField(country);
  const localNumber = nationalNumber(country, national);
  const international = localNumber ? formatPhone(toInternational(country, localNumber)) : "";

  useEffect(() => {
    if (countryPicked.current) return;
    const fromZone = countryFromTimeZone(Intl.DateTimeFormat().resolvedOptions().timeZone);
    if (fromZone) setCountry(fromZone);

    const controller = new AbortController();
    const timer = window.setTimeout(() => controller.abort(), 2500);
    fetch("https://ipwho.is/", { signal: controller.signal })
      .then((response) => response.json())
      .then((data: { success?: boolean; country_code?: string }) => {
        const iso = countryByIso(data.country_code ?? "")?.iso;
        if (data.success && iso && !countryPicked.current) setCountry(iso);
      })
      .catch(() => undefined)
      .finally(() => window.clearTimeout(timer));

    return () => {
      controller.abort();
      window.clearTimeout(timer);
    };
  }, []);

  useEffect(() => {
    const returned = view.values?.phone;
    if (!returned) return;
    const next = readPhone(returned);
    countryPicked.current = true;
    setCountry(next.iso);
    setNational(next.national);
  }, [view.values?.phone]);

  function invalidPhone() {
    return nationalPhoneError(country, localNumber);
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    setWhatsappState(null);
    const problem = invalidPhone();
    if (!problem) return;
    event.preventDefault();
    setPhoneError(problem);
  }

  async function sendOnWhatsApp(event: MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    const form = event.currentTarget.form;
    if (!form || busy) return;
    const problem = invalidPhone();
    if (problem) {
      setPhoneError(problem);
      return;
    }
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
      <div className="rounded-xl bg-brand-soft px-5 py-6" lang={locale} dir={dir}>
        <p className="font-medium">{copy.receivedTitle}</p>
        <p className="mt-2 text-sm leading-6 text-muted">{copy.receivedBody}</p>
      </div>
    );
  }

  if (whatsappState?.reference && !whatsappState.error) {
    return (
      <div className="rounded-xl bg-brand-soft px-5 py-6" lang={locale} dir={dir}>
        <p className="font-medium">{copy.savedTitle}</p>
        <p className="mt-2 text-sm leading-6 text-muted">
          {fill(copy.savedBody, { reference: whatsappState.reference })}
        </p>
        {whatsappState.whatsappUrl ? (
          <a
            className="mt-4 inline-flex h-11 items-center rounded-lg bg-brand px-4 text-sm font-medium text-white"
            href={whatsappState.whatsappUrl}
            target="_blank"
            rel="noreferrer"
          >
            {copy.openWhatsapp}
          </a>
        ) : null}
      </div>
    );
  }

  const fieldClass = compact ? "!gap-1.5 text-[15px]" : "";
  const saved = view.values ?? {};
  const textDir = dir === "rtl" ? "rtl" : "auto";

  return (
    <form
      action={action}
      noValidate
      lang={locale}
      dir={dir}
      onSubmit={onSubmit}
      className={
        compact
          ? "grid gap-3 [&_input:not([type=hidden])]:!h-11 [&_textarea]:!min-h-24 [&_[aria-haspopup=listbox]]:!h-11"
          : "grid gap-4"
      }
    >
      <input type="hidden" name="locale" value={locale} />
      {view.error && !view.fields ? <FormMessage state={view} /> : null}
      {view.fields ? (
        <p role="alert" className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          {copy.checkFields}
        </p>
      ) : null}
      {customer ? (
        <p className="rounded-md bg-surface px-3 py-2 text-sm text-muted">
          {fill(copy.sendingAs, { name: customer.name, email: customer.email })}
        </p>
      ) : (
        <div className={compact ? "grid gap-3 sm:grid-cols-2" : "contents"}>
          <Field label={copy.name} help="enquiry.name" name="name" error={view.fields?.name} className={fieldClass}>
            <input
              name="name"
              autoComplete="name"
              lang={locale}
              dir={textDir}
              placeholder={copy.namePlaceholder}
              defaultValue={saved.name}
              aria-invalid={view.fields?.name ? true : undefined}
            />
          </Field>
          <Field label={copy.email} help="enquiry.email" name="email" error={view.fields?.email} className={fieldClass}>
            <input
              name="email"
              type="email"
              autoComplete="email"
              dir="ltr"
              inputMode="email"
              placeholder={copy.emailPlaceholder}
              defaultValue={saved.email}
              aria-invalid={view.fields?.email ? true : undefined}
            />
          </Field>
        </div>
      )}
      <div className={compact ? "grid gap-3 sm:grid-cols-2" : "contents"}>
        <Field
          label={copy.phone}
          help="enquiry.phone"
          name="phone"
          required
          error={phoneError || view.fields?.phone}
          className={fieldClass}
        >
          <div className="phone-login__row">
            <CountryCodeSelect
              value={country}
              disabled={busy}
              onChange={(iso) => {
                countryPicked.current = true;
                setCountry(iso);
                setNational((current) => current.slice(0, nationalPhoneField(iso).maxLength));
                setPhoneError(null);
              }}
            />
            <input
              name="nationalPhone"
              type="tel"
              inputMode="numeric"
              autoComplete="tel-national"
              dir="ltr"
              placeholder={country === "IN" ? "9876543210" : copy.phonePlaceholder}
              value={national}
              minLength={phoneField.minLength}
              maxLength={phoneField.maxLength}
              pattern={phoneField.pattern}
              title={phoneField.title}
              aria-invalid={phoneError || view.fields?.phone ? true : undefined}
              onChange={(event) => {
                setNational(event.target.value.replace(/\D/g, "").slice(0, phoneField.maxLength));
                setPhoneError(null);
              }}
            />
            <input type="hidden" name="phone" value={international} />
          </div>
        </Field>
        <Field label={copy.interest} name="interest" error={view.fields?.interest} className={fieldClass}>
          <SearchableSelect
            name="interest"
            defaultValue={saved.interest || interests[0]?.value || ""}
            searchPlaceholder={copy.searchInterests}
            options={interests}
            invalid={Boolean(view.fields?.interest)}
          />
        </Field>
      </div>
      <Field label={copy.message} name="message" error={view.fields?.message} className={fieldClass}>
        <textarea
          name="message"
          rows={compact ? 3 : undefined}
          lang={locale}
          dir={textDir}
          placeholder={copy.messagePlaceholder}
          defaultValue={saved.message}
          aria-invalid={view.fields?.message ? true : undefined}
        />
      </Field>
      <div className="flex flex-wrap items-center gap-3">
        <SubmitButton pendingLabel={copy.sending} disabled={busy} className={compact ? "!h-11 text-base" : ""}>
          {copy.send}
        </SubmitButton>
        <button
          type="button"
          disabled={busy}
          onClick={sendOnWhatsApp}
          className="inline-flex h-11 items-center rounded-lg border border-line bg-white px-4 text-sm font-medium text-navy hover:bg-surface disabled:cursor-not-allowed disabled:opacity-60"
        >
          {whatsappPending ? copy.saving : copy.whatsapp}
        </button>
      </div>
    </form>
  );
}
