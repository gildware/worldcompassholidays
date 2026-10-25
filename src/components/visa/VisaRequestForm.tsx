"use client";

import { useActionState, useMemo, useState, type MouseEvent, type ReactNode } from "react";
import { useFormStatus } from "react-dom";
import DatePicker, { DateObject } from "react-multi-date-picker";
import { submitVisaRequest } from "@/actions/visa";
import { formatPhone } from "@/lib/auth/phone";
import { CountryMark } from "@/components/visa/CountryFlag";
import { VisaTypeIcon, WhatsAppIcon } from "@/components/visa/VisaIcons";
import { SearchableSelect } from "@/components/ui/SearchableSelect";
import { initialFormState, type FormState } from "@/lib/forms";
import { schengenDestination, worldCountries, type WorldCountry } from "@/lib/data/world-countries";
import type { SelectOption } from "@/components/ui/SearchableSelect";

const phonePlaceholder = "+91 98765 43210";

const visaTypes = [
  { value: "tourist", label: "Tourist", icon: <VisaTypeIcon name="tourist" /> },
  { value: "business", label: "Business", icon: <VisaTypeIcon name="business" /> },
  { value: "family", label: "Family visit", icon: <VisaTypeIcon name="family" /> },
  { value: "transit", label: "Transit", icon: <VisaTypeIcon name="transit" /> },
  { value: "other", label: "Not sure yet", icon: <VisaTypeIcon name="other" /> },
];

function countryOption(item: WorldCountry): SelectOption {
  return {
    value: item.name,
    label: item.name,
    keywords: item.keywords,
    icon: <CountryMark code={item.code} />,
  };
}

function resolveOption(value: string, options: readonly SelectOption[]) {
  const trimmed = value.trim();
  if (!trimmed) return "";
  const needle = trimmed.toLowerCase();
  const exact = options.find((option) => option.value.toLowerCase() === needle);
  if (exact) return exact.value;
  const fuzzy = options.find((option) =>
    option.keywords?.toLowerCase().split(/\s+/).includes(needle),
  );
  return fuzzy?.value ?? trimmed;
}

function toDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return undefined;
  const [year, month, day] = value.split("-").map(Number);
  return new DateObject({ year, month, day });
}

function fromDate(value: DateObject | DateObject[] | null) {
  if (!value || Array.isArray(value)) return "";
  return value.format("YYYY-MM-DD");
}

export function VisaRequestForm({
  sent,
  reference,
  customer,
  defaultCountry = "",
  defaultVisaType = "",
}: {
  sent: boolean;
  reference: string;
  customer: { name: string; email: string; phone: string } | null;
  defaultCountry?: string;
  defaultVisaType?: string;
}) {
  const [state, action, pending] = useActionState(submitVisaRequest, initialFormState);
  const [whatsappState, setWhatsappState] = useState<FormState | null>(null);
  const [whatsappPending, setWhatsappPending] = useState(false);
  const view = whatsappState ?? state;
  const saved = view.values ?? {};
  const busy = pending || whatsappPending;
  const [country, setCountry] = useState(saved.country || resolveCountryName(defaultCountry));
  const [nationality, setNationality] = useState(saved.nationality || "India");
  const [visaType, setVisaType] = useState(saved.visaType || defaultVisaType);
  const [departure, setDeparture] = useState(saved.departure ?? "");
  const [returnDate, setReturnDate] = useState(saved.returnDate ?? "");
  const countryOptions = useMemo(
    () =>
      worldCountries.map((item) => ({
        value: item.name,
        label: item.name,
        keywords: item.keywords,
        icon: <CountryMark code={item.code} />,
      })),
    [],
  );
  const destinationOptions = useMemo(
    () =>
      [
        ...countryOptions,
        {
          value: schengenDestination.name,
          label: schengenDestination.name,
          keywords: schengenDestination.keywords,
          icon: <CountryMark code={schengenDestination.code} />,
        },
      ].sort((a, b) => a.label.localeCompare(b.label, "en")),
    [countryOptions],
  );

  async function applyOnWhatsApp(event: MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    const form = event.currentTarget.form;
    if (!form || busy) return;
    const data = new FormData(form);
    data.set("channel", "whatsapp");
    setWhatsappPending(true);
    const result = await submitVisaRequest(initialFormState, data);
    setWhatsappState(result);
    setWhatsappPending(false);
    if (result.whatsappUrl) window.open(result.whatsappUrl, "_blank", "noopener,noreferrer");
  }

  if (sent) {
    return (
      <div className="rounded-4 bg-blue-1-05 px-20 py-20">
        <h2 className="text-18 fw-500">Request received</h2>
        <p className="text-14 text-light-1 mt-5">
          {reference ? `Reference ${reference}. ` : ""}
          We will reply with the document list and the service fee.
        </p>
      </div>
    );
  }

  const savedOnWhatsApp = Boolean(whatsappState?.reference && !whatsappState.error);

  if (savedOnWhatsApp) {
    return (
      <div className="rounded-4 bg-blue-1-05 px-20 py-20">
        <h2 className="text-18 fw-500">Request saved</h2>
        <p className="text-14 text-light-1 mt-5">
          {view.reference ? `Reference ${view.reference}. ` : ""}
          The desk already has this request. Send the WhatsApp message so they have the same details there.
        </p>
        {view.whatsappUrl ? (
          <a className="visa-whatsapp visa-whatsapp-form mt-15" href={view.whatsappUrl} target="_blank" rel="noreferrer">
            <WhatsAppIcon />
            Open WhatsApp
          </a>
        ) : null}
      </div>
    );
  }

  return (
    <form action={action} noValidate className="visa-request-form" onSubmit={() => setWhatsappState(null)}>
      <div className="row y-gap-10">
      {view.error ? (
        <div className="col-12 visa-span-all">
          <p className="visa-banner" role="alert">
            {view.error}
          </p>
        </div>
      ) : null}
      {customer ? (
        <div className="col-12 visa-span-all">
          <p className="visa-account">
            <strong>{customer.name}</strong>
          </p>
        </div>
      ) : (
        <>
          <Field
            label="Name"
            name="name"
            autoComplete="name"
            placeholder="Full name as on the passport"
            error={view.fields?.name}
            defaultValue={saved.name}
          />
          <Field
            label="Email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="name@email.com"
            error={view.fields?.email}
            defaultValue={saved.email}
          />
          <Field
            label="Phone"
            name="phone"
            type="tel"
            autoComplete="tel"
            placeholder={phonePlaceholder}
            error={view.fields?.phone}
            defaultValue={formatPhone(saved.phone ?? "") || saved.phone}
            span="full"
          />
        </>
      )}
      {customer ? (
        <Field
          label="Phone"
          name="phone"
          type="tel"
          autoComplete="tel"
          placeholder={phonePlaceholder}
          error={view.fields?.phone}
          defaultValue={formatPhone(saved.phone || customer.phone) || saved.phone || customer.phone}
          span="full"
        />
      ) : null}
      <PickerField id="country" label="Destination country" error={view.fields?.country}>
        <SearchableSelect
          id="country"
          name="country"
          value={country}
          onChange={setCountry}
          options={destinationOptions}
          placeholder="Country you are travelling to"
          searchPlaceholder="Search countries"
          invalid={Boolean(view.fields?.country)}
          describedBy={view.fields?.country ? "country-error" : undefined}
          menuZIndex={10240}
          wrapperClassName={`visa-picker mt-5${view.fields?.country ? " is-invalid" : ""}`}
        />
      </PickerField>
      <PickerField id="nationality" label="Nationality" error={view.fields?.nationality}>
        <SearchableSelect
          id="nationality"
          name="nationality"
          value={nationality}
          onChange={setNationality}
          options={countryOptions}
          placeholder="Country of your passport"
          searchPlaceholder="Search countries"
          invalid={Boolean(view.fields?.nationality)}
          describedBy={view.fields?.nationality ? "nationality-error" : undefined}
          menuZIndex={10240}
          wrapperClassName={`visa-picker mt-5${view.fields?.nationality ? " is-invalid" : ""}`}
        />
      </PickerField>
      <PickerField id="visaType" label="Visa type" error={view.fields?.visaType}>
        <SearchableSelect
          id="visaType"
          name="visaType"
          value={visaType}
          onChange={setVisaType}
          options={visaTypes}
          placeholder="Choose a visa type"
          searchPlaceholder="Search visa types"
          invalid={Boolean(view.fields?.visaType)}
          describedBy={view.fields?.visaType ? "visaType-error" : undefined}
          menuZIndex={10240}
          wrapperClassName={`visa-picker mt-5${view.fields?.visaType ? " is-invalid" : ""}`}
        />
      </PickerField>
      <VisaDateField
        label="Departure"
        name="departure"
        value={departure}
        minDate={new DateObject()}
        error={view.fields?.departure}
        onChange={(next) => {
          setDeparture(next);
          if (returnDate && next && returnDate < next) setReturnDate("");
        }}
      />
      <VisaDateField
        label="Return"
        name="returnDate"
        value={returnDate}
        minDate={departure ? isoDate(departure) : new DateObject()}
        error={view.fields?.returnDate}
        onChange={setReturnDate}
      />
      <Field
        label="Travellers"
        name="travellers"
        type="number"
        placeholder="How many people"
        min={1}
        max={20}
        error={view.fields?.travellers}
        defaultValue={saved.travellers || "1"}
      />
      <div className="col-12 visa-span-all">
        <label className="text-14 fw-500" htmlFor="message">
          Note <span className="visa-optional">Optional</span>
        </label>
        <div className={`visa-control mt-5${view.fields?.message ? " is-invalid" : ""}`}>
          <textarea
            id="message"
            name="message"
            rows={2}
            placeholder="A previous refusal, children on the trip, or a fixed appointment date"
            defaultValue={saved.message}
            aria-invalid={view.fields?.message ? true : undefined}
            aria-describedby={view.fields?.message ? "message-error" : undefined}
          />
        </div>
        <FieldMessage id="message-error" message={view.fields?.message} />
      </div>
      </div>
      <div className="visa-form-actions">
        <button
          type="button"
          className="visa-whatsapp visa-whatsapp-form"
          disabled={busy}
          onClick={applyOnWhatsApp}
        >
          <WhatsAppIcon />
          {whatsappPending ? "Saving…" : "Send this request on WhatsApp"}
        </button>
        <Submit busy={busy} />
      </div>
    </form>
  );
}

function resolveCountryName(value: string) {
  const needle = value.trim().toLowerCase();
  if (!needle) return "";
  if (needle === "schengen" || needle === "schengen area" || needle === "eu") {
    return schengenDestination.name;
  }
  const found = worldCountries.find((item) => {
    const tokens = `${item.name} ${item.keywords}`.toLowerCase().split(/[^a-z0-9]+/);
    return item.name.toLowerCase() === needle || tokens.includes(needle);
  });
  return found?.name ?? value;
}

function isoDate(value: string) {
  return new DateObject({ date: value, format: "YYYY-MM-DD" });
}

function PickerField({
  id,
  label,
  error,
  children,
}: {
  id: string;
  label: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div className="col-md-6">
      <label className="text-14 fw-500" htmlFor={id}>
        {label}
      </label>
      {children}
      <FieldMessage id={`${id}-error`} message={error} />
    </div>
  );
}

function VisaDateField({
  label,
  name,
  value,
  minDate,
  error,
  onChange,
}: {
  label: string;
  name: string;
  value: string;
  minDate: DateObject;
  error?: string;
  onChange: (value: string) => void;
}) {
  const errorId = `${name}-error`;
  return (
    <div className="col-md-6">
      <label className="text-14 fw-500" htmlFor={name}>
        {label}
      </label>
      <div className={`visa-control visa-date mt-5${error ? " is-invalid" : ""}`}>
        <DatePicker
          id={name}
          portal
          zIndex={10240}
          arrow={false}
          editable={false}
          inputMode="none"
          hideOnScroll={false}
          format="D MMM YYYY"
          placeholder="Choose a date"
          calendarPosition="bottom-start"
          offsetY={8}
          className="visa-calendar"
          inputClass="visa-date-input"
          containerClassName="visa-date-container"
          value={value ? isoDate(value) : undefined}
          minDate={minDate}
          onChange={(next) => {
            if (!next || Array.isArray(next)) {
              onChange("");
              return;
            }
            onChange(next.format("YYYY-MM-DD"));
          }}
        />
        <i className="icon-calendar visa-date-icon" aria-hidden="true" />
        <input type="hidden" name={name} value={value} />
      </div>
      <FieldMessage id={errorId} message={error} />
    </div>
  );
}

function Field({
  label,
  name,
  type = "text",
  placeholder,
  autoComplete,
  defaultValue,
  min,
  max,
  error,
  span = "half",
}: {
  label: string;
  name: string;
  type?: string;
  placeholder?: string;
  autoComplete?: string;
  defaultValue?: string;
  min?: number;
  max?: number;
  error?: string;
  span?: "half" | "full";
}) {
  const errorId = `${name}-error`;
  return (
    <div className={span === "full" ? "col-12" : "col-md-6"}>
      <label className="text-14 fw-500" htmlFor={name}>
        {label}
      </label>
      <div className={`visa-control mt-5${error ? " is-invalid" : ""}`}>
        <input
          id={name}
          name={name}
          type={type}
          placeholder={placeholder}
          autoComplete={autoComplete}
          defaultValue={defaultValue}
          min={min}
          max={max}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
        />
      </div>
      <FieldMessage id={errorId} message={error} />
    </div>
  );
}

function FieldMessage({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <p id={id} className="visa-error" role="alert">
      {message}
    </p>
  );
}

function Submit({ busy }: { busy: boolean }) {
  const { pending } = useFormStatus();
  const waiting = pending || busy;
  return (
    <button
      type="submit"
      disabled={waiting}
      className="button -dark-1 h-50 px-30 rounded-4 bg-blue-1 text-white"
    >
      {pending ? "Sending…" : "Request visa help"}
    </button>
  );
}
