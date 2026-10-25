"use client";

import { useActionState, useEffect, useMemo, useRef, useState, type MouseEvent, type ReactNode } from "react";
import { useFormStatus } from "react-dom";
import { Calendar, DateObject } from "react-multi-date-picker";
import { submitAssistRequest } from "@/actions/assist";
import { AssistExtraIcon, AssistTypeIcon } from "@/components/assist/AssistIcons";
import { CountryMark } from "@/components/visa/CountryFlag";
import { WhatsAppIcon } from "@/components/visa/VisaIcons";
import { SearchableSelect, type SelectOption } from "@/components/ui/SearchableSelect";
import { assistExtraLabels, assistExtras, assistServiceLabel } from "@/lib/assist";
import { airportLabel, airports, findAirport } from "@/lib/data/airports";
import { initialFormState, type FormState } from "@/lib/forms";

const services: SelectOption[] = [
  { value: "arrival", label: "Arrival", keywords: "land landing meet", icon: <AssistTypeIcon name="arrival" /> },
  { value: "departure", label: "Departure", keywords: "leave takeoff", icon: <AssistTypeIcon name="departure" /> },
  { value: "transit", label: "Transit connection", keywords: "connection layover", icon: <AssistTypeIcon name="transit" /> },
  { value: "round", label: "Arrival and departure", keywords: "both round trip", icon: <AssistTypeIcon name="round" /> },
];

const times: SelectOption[] = Array.from({ length: 48 }, (_, index) => {
  const hour = Math.floor(index / 2);
  const minute = index % 2 === 0 ? "00" : "30";
  const value = `${String(hour).padStart(2, "0")}:${minute}`;
  const hour12 = hour % 12 || 12;
  const suffix = hour < 12 ? "am" : "pm";
  return { value, label: `${hour12}:${minute} ${suffix}`, keywords: value };
});

export function AssistRequestForm({
  sent,
  reference,
  customer,
  defaultService = "",
  defaultAirport = "",
  presetKey = 0,
  servicePreset = "",
  airportPreset = "",
}: {
  sent: boolean;
  reference: string;
  customer: { name: string; email: string; phone: string } | null;
  defaultService?: string;
  defaultAirport?: string;
  presetKey?: number;
  servicePreset?: string;
  airportPreset?: string;
}) {
  const [state, action, pending] = useActionState(submitAssistRequest, initialFormState);
  const [whatsappState, setWhatsappState] = useState<FormState | null>(null);
  const [whatsappPending, setWhatsappPending] = useState(false);
  const view = whatsappState ?? state;
  const saved = view.values ?? {};
  const busy = pending || whatsappPending;
  const [service, setService] = useState(saved.service || defaultService);
  const [airport, setAirport] = useState(saved.airport || defaultAirport);
  const [flightDate, setFlightDate] = useState(saved.flightDate ?? "");
  const [flightTime, setFlightTime] = useState(saved.flightTime ?? "");
  const [returnDate, setReturnDate] = useState(saved.returnDate ?? "");
  const [returnTime, setReturnTime] = useState(saved.returnTime ?? "");
  useEffect(() => {
    if (!presetKey) return;
    if (servicePreset) setService(servicePreset);
    if (airportPreset) setAirport(airportPreset);
  }, [airportPreset, presetKey, servicePreset]);
  const [extras, setExtras] = useState(() =>
    (saved.extras ?? "")
      .split(",")
      .map((item) => item.trim())
      .filter((item) => (assistExtras as readonly string[]).includes(item as (typeof assistExtras)[number])),
  );
  const airportOptions = useMemo(() => {
    const listed = airports
      .map((item) => ({
        value: item.code,
        label: airportLabel(item),
        keywords: `${item.name} ${item.city} ${item.country} ${item.code}`,
        icon: <CountryMark code={item.countryCode} />,
      }))
      .sort((a, b) => a.label.localeCompare(b.label, "en"));
    return [
      ...listed,
      { value: "other", label: "Another airport", keywords: "other not listed", icon: <span className="assist-mark" aria-hidden="true">✈</span> },
    ];
  }, []);

  async function sendOnWhatsApp(event: MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    const form = event.currentTarget.form;
    if (!form || busy) return;
    const data = new FormData(form);
    data.set("channel", "whatsapp");
    setWhatsappPending(true);
    const result = await submitAssistRequest(initialFormState, data);
    setWhatsappState(result);
    setWhatsappPending(false);
    if (result.whatsappUrl) window.open(result.whatsappUrl, "_blank", "noopener,noreferrer");
  }

  if (sent) {
    return (
      <div className="assist-done">
        <h2 className="text-18 fw-500">Request received</h2>
        <p className="text-14 text-light-1 mt-5">
          {reference ? `Reference ${reference}. ` : ""}
          We will reply with who meets you and the service fee.
        </p>
      </div>
    );
  }

  if (whatsappState?.reference && !whatsappState.error) {
    return (
      <div className="assist-done">
        <h2 className="text-18 fw-500">Request saved</h2>
        <p className="text-14 text-light-1 mt-5">
          {view.reference ? `Reference ${view.reference}. ` : ""}
          The desk already has this request. Send the WhatsApp message so they have the same details there.
        </p>
        {view.whatsappUrl ? (
          <a className="assist-whatsapp assist-whatsapp-form mt-15" href={view.whatsappUrl} target="_blank" rel="noreferrer">
            <WhatsAppIcon />
            Open WhatsApp
          </a>
        ) : null}
      </div>
    );
  }

  const chosen = findAirport(airport);
  const summary = [
    service ? assistServiceLabel(service) : "",
    chosen ? airportLabel(chosen) : airport === "other" ? "Another airport" : "",
    flightDate,
    flightTime,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <form action={action} noValidate className="assist-form" onSubmit={() => setWhatsappState(null)}>
      <div className="assist-span">
        <p className="assist-summary">
          {summary ? (
            <>
              <strong>This request: </strong>
              {summary}
            </>
          ) : (
            "Choose the airport and the flight. The summary updates as you fill the form."
          )}
        </p>
      </div>
      {view.error ? (
        <div className="assist-span">
          <p className="assist-banner" role="alert">
            {view.error}
          </p>
        </div>
      ) : null}
      {customer ? (
        <div className="assist-span">
          <p className="text-14 text-light-1">
            Sending as {customer.name}
          </p>
        </div>
      ) : (
        <>
          <Field label="Name" name="name" autoComplete="name" placeholder="Name on the booking" error={view.fields?.name} defaultValue={saved.name} />
          <Field label="Email" name="email" type="email" autoComplete="email" placeholder="name@email.com" error={view.fields?.email} defaultValue={saved.email} />
        </>
      )}
      <div className="assist-span">
        <p className="assist-label" id="service-label">
          Meet
        </p>
        <div className="assist-choices" role="group" aria-labelledby="service-label">
          {services.map((option) => (
            <button
              key={option.value}
              type="button"
              className={service === option.value ? "is-on" : ""}
              aria-pressed={service === option.value}
              onClick={() => setService(option.value)}
            >
              {option.icon}
              <span>{option.label}</span>
            </button>
          ))}
        </div>
        <input type="hidden" name="service" value={service} />
        <FieldMessage id="service-error" message={view.fields?.service} />
      </div>
      <PickerField id="airport" label="Airport" error={view.fields?.airport}>
        <SearchableSelect
          id="airport"
          name="airport"
          value={airport}
          onChange={setAirport}
          options={airportOptions}
          placeholder="City or code"
          searchPlaceholder="Search airports"
          invalid={Boolean(view.fields?.airport)}
          describedBy={view.fields?.airport ? "airport-error" : undefined}
          menuZIndex={2200}
          wrapperClassName={`assist-picker mt-5${view.fields?.airport ? " is-invalid" : ""}`}
        />
      </PickerField>
      {airport === "other" ? (
        <Field
          label="Airport name"
          name="airportName"
          placeholder="City and airport"
          error={view.fields?.airportName}
          defaultValue={saved.airportName}
        />
      ) : (
        <input type="hidden" name="airportName" value="" />
      )}
      <DateField
        label="Flight date"
        name="flightDate"
        value={flightDate}
        minDate={new DateObject()}
        error={view.fields?.flightDate}
        onChange={(next) => {
          setFlightDate(next);
          if (returnDate && next && returnDate < next) setReturnDate("");
        }}
      />
      <PickerField id="flightTime" label="Flight time" error={view.fields?.flightTime}>
        <SearchableSelect
          id="flightTime"
          name="flightTime"
          value={flightTime}
          onChange={setFlightTime}
          options={times}
          placeholder="Select a time"
          searchPlaceholder="Search a time"
          invalid={Boolean(view.fields?.flightTime)}
          describedBy={view.fields?.flightTime ? "flightTime-error" : undefined}
          menuZIndex={2200}
          wrapperClassName={`assist-picker mt-5${view.fields?.flightTime ? " is-invalid" : ""}`}
        />
      </PickerField>
      <Field
        label="Flight number"
        name="flightNumber"
        placeholder="EK 512"
        error={view.fields?.flightNumber}
        defaultValue={saved.flightNumber}
      />
      <Field
        label="Phone"
        name="phone"
        type="tel"
        autoComplete="tel"
        placeholder="+91- 70064 22204"
        error={view.fields?.phone}
        defaultValue={saved.phone || customer?.phone || ""}
      />
      {service === "round" ? (
        <>
          <DateField
            label="Return flight date"
            name="returnDate"
            value={returnDate}
            minDate={flightDate ? isoDate(flightDate) : new DateObject()}
            error={view.fields?.returnDate}
            onChange={setReturnDate}
          />
          <PickerField id="returnTime" label="Return flight time" error={view.fields?.returnTime}>
            <SearchableSelect
              id="returnTime"
              name="returnTime"
              value={returnTime}
              onChange={setReturnTime}
              options={times}
              placeholder="Select a time"
              searchPlaceholder="Search a time"
              invalid={Boolean(view.fields?.returnTime)}
              describedBy={view.fields?.returnTime ? "returnTime-error" : undefined}
              menuZIndex={2200}
              wrapperClassName={`assist-picker mt-5${view.fields?.returnTime ? " is-invalid" : ""}`}
            />
          </PickerField>
          <Field
            label="Return flight number"
            name="returnFlight"
            placeholder="EK 513"
            error={view.fields?.returnFlight}
            defaultValue={saved.returnFlight}
          />
        </>
      ) : null}
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
      <div className="assist-span">
        <p className="text-14 fw-500">Help at the airport</p>
        <div className="assist-chips">
          {assistExtras.map((extra) => {
            const on = extras.includes(extra);
            return (
              <button
                key={extra}
                type="button"
                className={`assist-chip${on ? " is-on" : ""}`}
                aria-pressed={on}
                onClick={() =>
                  setExtras((current) =>
                    current.includes(extra) ? current.filter((item) => item !== extra) : [...current, extra],
                  )
                }
              >
                <AssistExtraIcon name={extra} />
                {assistExtraLabels[extra]}
              </button>
            );
          })}
        </div>
        {extras.map((extra) => (
          <input key={extra} type="hidden" name="extras" value={extra} />
        ))}
      </div>
      <div className="assist-span">
        <label className="text-14 fw-500" htmlFor="message">
          Note
        </label>
        <div className={`assist-control mt-5${view.fields?.message ? " is-invalid" : ""}`}>
          <textarea
            id="message"
            name="message"
            rows={2}
            placeholder="Terminal, a child seat, or the name to put on the board"
            defaultValue={saved.message}
            aria-invalid={view.fields?.message ? true : undefined}
            aria-describedby={view.fields?.message ? "message-error" : undefined}
          />
        </div>
        <FieldMessage id="message-error" message={view.fields?.message} />
      </div>
      <div className="assist-span">
        <p className="text-13 text-light-1">
          We use your name, email, and phone only to arrange this airport meet. You pay nothing until you accept the quote. A visa, if you need one, is a separate request.
        </p>
        <div className="assist-form-actions">
          <button type="button" className="assist-whatsapp assist-whatsapp-form" disabled={busy} onClick={sendOnWhatsApp}>
            <WhatsAppIcon />
            {whatsappPending ? "Saving…" : "Send on WhatsApp"}
          </button>
          <Submit busy={busy} />
        </div>
      </div>
    </form>
  );
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
    <div className="assist-cell">
      <label className="text-14 fw-500" htmlFor={id}>
        {label}
      </label>
      {children}
      <FieldMessage id={`${id}-error`} message={error} />
    </div>
  );
}

function DateField({
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
  const [open, setOpen] = useState(false);
  const box = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onDoc(event: globalThis.MouseEvent) {
      if (!box.current?.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  const shown = value ? new DateObject({ date: value, format: "YYYY-MM-DD" }).format("D MMM YYYY") : "Choose a date";

  return (
    <div className="assist-cell" ref={box}>
      <label className="text-14 fw-500" htmlFor={name}>
        {label}
      </label>
      <button
        id={name}
        type="button"
        className={`assist-date-btn${value ? "" : " is-empty"}`}
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
      >
        {shown}
      </button>
      {open ? (
        <Calendar
          className="assist-calendar"
          value={value ? isoDate(value) : undefined}
          minDate={minDate}
          onChange={(next) => {
            if (!next || Array.isArray(next)) {
              onChange("");
              return;
            }
            onChange(next.format("YYYY-MM-DD"));
            setOpen(false);
          }}
        />
      ) : null}
      <input type="hidden" name={name} value={value} />
      <FieldMessage id={`${name}-error`} message={error} />
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
}) {
  const errorId = `${name}-error`;
  return (
    <div className="assist-cell">
      <label className="text-14 fw-500" htmlFor={name}>
        {label}
      </label>
      <div className={`assist-control mt-5${error ? " is-invalid" : ""}`}>
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
    <p id={id} className="assist-error" role="alert">
      {message}
    </p>
  );
}

function Submit({ busy }: { busy: boolean }) {
  const { pending } = useFormStatus();
  const waiting = pending || busy;
  return (
    <button type="submit" disabled={waiting} className="assist-submit">
      {pending ? "Sending…" : "Request a meet"}
    </button>
  );
}
