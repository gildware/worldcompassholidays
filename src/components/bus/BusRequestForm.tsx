"use client";

import { useActionState, useEffect, useState, type MouseEvent } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { useFormStatus } from "react-dom";
import { submitBusRequest } from "@/actions/bus-request";
import { BackIcon, SuccessModal } from "@/components/hotel-request/HotelRequestForm";
import { WhatsAppIcon } from "@/components/visa/VisaIcons";
import { formatPhone } from "@/lib/auth/phone";
import { busCoachTypes, busTimeWindows } from "@/lib/buses";
import { initialFormState, type FormState } from "@/lib/forms";

const fieldOrder = ["phone", "fromCity", "toCity", "travelDate", "passengers", "coach", "timeWindow", "busName", "message"];

function focusErrorField(fields?: Record<string, string>) {
  const key = fieldOrder.find((name) => fields?.[name]);
  const input = key ? document.getElementById(key) : null;
  const visibleInput = input instanceof HTMLInputElement && input.type === "hidden" ? null : input;
  const target = visibleInput || (key ? document.getElementById(`${key}-field`) : null) || document.querySelector(".hotel-request-banner-alert");
  if (!(target instanceof HTMLElement)) return;
  target.scrollIntoView({ behavior: "smooth", block: "center" });
  if (visibleInput instanceof HTMLElement) visibleInput.focus({ preventScroll: true });
}

function clampCount(value: string | undefined, fallback: string, min: number, max: number) {
  const parsed = Number(value && /^\d+$/.test(value) ? value : fallback);
  if (!Number.isFinite(parsed)) return min;
  return Math.min(max, Math.max(min, Math.round(parsed)));
}

export type BusRequestDefaults = {
  fromCity: string;
  toCity: string;
  travelDate: string;
  passengers: string;
  coach: string;
  timeWindow: string;
  busName: string;
  slug: string;
  message: string;
};

export function BusRequestForm({
  sent,
  reference,
  customer,
  defaults,
  loginHref,
}: {
  sent: boolean;
  reference: string;
  customer: { name: string; email: string; phone: string } | null;
  defaults: BusRequestDefaults;
  loginHref: string;
}) {
  const router = useRouter();
  const [state, action, pending] = useActionState(submitBusRequest, initialFormState);
  const [whatsappState, setWhatsappState] = useState<FormState | null>(null);
  const [whatsappPending, setWhatsappPending] = useState(false);
  const [mounted, setMounted] = useState(false);
  const view = whatsappState ?? state;
  const saved = view.values ?? {};
  const busy = pending || whatsappPending;
  const [coach, setCoach] = useState(saved.coach || defaults.coach || "any");
  const [timeWindow, setTimeWindow] = useState(saved.timeWindow || defaults.timeWindow || "any");
  const [passengers, setPassengers] = useState(clampCount(saved.passengers, defaults.passengers, 1, 20));
  const [note, setNote] = useState(saved.message || defaults.message || "");

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!view.error) return;
    focusErrorField(view.fields);
  }, [view]);

  const successReference =
    !busy && state.reference && !state.error
      ? state.reference
      : !busy && whatsappState?.reference && !whatsappState.error
        ? whatsappState.reference
        : sent
          ? reference
          : "";

  function loginWithBrief(form: HTMLFormElement | null) {
    const params = new URLSearchParams();
    if (form) {
      const data = new FormData(form);
      for (const [from, to] of [
        ["fromCity", "from"],
        ["toCity", "to"],
        ["travelDate", "date"],
        ["passengers", "passengers"],
        ["coach", "coach"],
        ["timeWindow", "time"],
        ["busName", "busName"],
        ["slug", "slug"],
        ["message", "message"],
      ] as const) {
        const value = String(data.get(from) || "").trim();
        if (value && value !== "any") params.set(to, value);
      }
    }
    if (!params.size) {
      window.location.assign(loginHref);
      return;
    }
    window.location.assign(`/login?next=${encodeURIComponent(`/buses/request?${params}`)}`);
  }

  async function sendOnWhatsApp(event: MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    const form = event.currentTarget.form;
    if (!form || busy) return;
    const data = new FormData(form);
    data.set("channel", "whatsapp");
    setWhatsappPending(true);
    const result = await submitBusRequest(initialFormState, data);
    setWhatsappState(result);
    setWhatsappPending(false);
    if (result.whatsappUrl) window.open(result.whatsappUrl, "_blank", "noopener,noreferrer");
  }

  const successModal = successReference ? (
    <SuccessModal reference={successReference} exploreHref="/buses" detail="Nothing is booked until you accept a quote." />
  ) : null;

  return (
    <div className="hotel-request-card" id="hotel-request-pass">
      <button
        type="button"
        className="hotel-request-back"
        onClick={() => (window.history.length > 1 ? router.back() : router.push("/buses"))}
      >
        <BackIcon />
        Back
      </button>
      <h2>Request a bus</h2>
      <p className="hotel-request-lede">Send the cities and date. We quote before anything is booked.</p>
      <form
        action={action}
        noValidate
        className="hotel-request-form"
        onSubmit={(event) => {
          setWhatsappState(null);
          if (!customer) {
            event.preventDefault();
            loginWithBrief(event.currentTarget);
          }
        }}
      >
        {view.error ? (
          <div className="hotel-request-span">
            <p className="hotel-request-banner-alert" role="alert">
              {view.fields ? "Check the highlighted fields." : view.error}
            </p>
          </div>
        ) : null}
        {customer ? (
          <div className="hotel-request-span hotel-request-account">
            <strong>{customer.name}</strong>
            <span>{customer.phone ? formatPhone(customer.phone) || customer.phone : customer.email}</span>
          </div>
        ) : (
          <div className="hotel-request-span">
            <p className="hotel-request-lede">Log in to send this. The request uses the name and phone on your account.</p>
          </div>
        )}
        {customer?.phone ? (
          <Field
            label="Alternative phone"
            name="phone"
            type="tel"
            autoComplete="tel"
            placeholder="Optional"
            error={view.fields?.phone}
            defaultValue={saved.phone && saved.phone !== customer.phone ? saved.phone : ""}
            wide
          />
        ) : customer ? (
          <Field
            label="Phone"
            name="phone"
            type="tel"
            autoComplete="tel"
            placeholder="+91 98765 43210"
            error={view.fields?.phone}
            defaultValue={saved.phone}
            wide
          />
        ) : null}
        <Field label="From" name="fromCity" error={view.fields?.fromCity} defaultValue={saved.fromCity || defaults.fromCity} />
        <Field label="To" name="toCity" error={view.fields?.toCity} defaultValue={saved.toCity || defaults.toCity} />
        <Field
          label="Travel date"
          name="travelDate"
          type="date"
          error={view.fields?.travelDate}
          defaultValue={saved.travelDate || defaults.travelDate}
        />
        <div className="hotel-request-cell" id="passengers-field">
          <label id="passengers-label">Passengers</label>
          <div className={`hotel-request-stepper${view.fields?.passengers ? " is-invalid" : ""}`}>
            <button type="button" aria-label="Fewer passengers" disabled={passengers <= 1} onClick={() => setPassengers(passengers - 1)}>
              −
            </button>
            <output aria-labelledby="passengers-label">{passengers}</output>
            <button type="button" aria-label="More passengers" disabled={passengers >= 20} onClick={() => setPassengers(passengers + 1)}>
              +
            </button>
          </div>
          <input type="hidden" name="passengers" value={passengers} />
          {view.fields?.passengers ? <p className="hotel-request-error">{view.fields.passengers}</p> : null}
        </div>
        <ChoiceRow label="Coach" name="coach" value={coach} options={busCoachTypes} error={view.fields?.coach} onChange={setCoach} />
        <ChoiceRow
          label="Time"
          name="timeWindow"
          value={timeWindow}
          options={busTimeWindows}
          error={view.fields?.timeWindow}
          onChange={setTimeWindow}
        />
        <Field
          label="Bus name"
          name="busName"
          placeholder="Optional"
          error={view.fields?.busName}
          defaultValue={saved.busName || defaults.busName}
          wide
        />
        <input type="hidden" name="slug" value={saved.slug || defaults.slug} />
        <Field
          label="What should we look for?"
          name="message"
          multiline
          placeholder="Pickup point, evening departure, travelling with family"
          error={view.fields?.message}
          value={note}
          onChange={setNote}
        />
        <div className="hotel-request-span hotel-request-actions">
          {customer ? (
            <>
              <Submit busy={busy} />
              <button type="button" className="hotel-request-whatsapp" disabled={busy} onClick={sendOnWhatsApp}>
                <WhatsAppIcon />
                {whatsappPending ? "Saving…" : "Send on WhatsApp"}
              </button>
            </>
          ) : (
            <button type="button" className="hotel-request-submit" onClick={(event) => loginWithBrief(event.currentTarget.form)}>
              Log in to request
            </button>
          )}
        </div>
      </form>
      {mounted && successModal ? createPortal(successModal, document.body) : null}
    </div>
  );
}

function ChoiceRow({
  label,
  name,
  value,
  options,
  error,
  onChange,
}: {
  label: string;
  name: string;
  value: string;
  options: readonly { value: string; label: string }[];
  error?: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="hotel-request-span" id={`${name}-field`}>
      <p className="hotel-request-label" id={`${name}-label`}>
        {label}
      </p>
      <div className="hotel-request-budget" role="group" aria-labelledby={`${name}-label`}>
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            className={value === option.value ? "is-on" : ""}
            aria-pressed={value === option.value}
            onClick={() => onChange(option.value)}
          >
            {option.label}
          </button>
        ))}
      </div>
      <input type="hidden" name={name} value={value} />
      {error ? <p className="hotel-request-error">{error}</p> : null}
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
  value,
  onChange,
  error,
  multiline = false,
  wide = false,
}: {
  label: string;
  name: string;
  type?: string;
  placeholder?: string;
  autoComplete?: string;
  defaultValue?: string;
  value?: string;
  onChange?: (next: string) => void;
  error?: string;
  multiline?: boolean;
  wide?: boolean;
}) {
  const controlled = value !== undefined;
  return (
    <div className={multiline || wide ? "hotel-request-span" : "hotel-request-cell"}>
      <label htmlFor={name}>{label}</label>
      <div className={`hotel-request-control mt-5${error ? " is-invalid" : ""}`}>
        {multiline ? (
          <textarea
            id={name}
            name={name}
            rows={2}
            placeholder={placeholder}
            defaultValue={controlled ? undefined : defaultValue}
            value={controlled ? value : undefined}
            onChange={onChange ? (event) => onChange(event.currentTarget.value) : undefined}
            aria-invalid={error ? true : undefined}
          />
        ) : (
          <input
            id={name}
            name={name}
            type={type}
            placeholder={placeholder}
            autoComplete={autoComplete}
            defaultValue={controlled ? undefined : defaultValue}
            value={controlled ? value : undefined}
            onChange={onChange ? (event) => onChange(event.currentTarget.value) : undefined}
            aria-invalid={error ? true : undefined}
          />
        )}
      </div>
      {error ? <p className="hotel-request-error">{error}</p> : null}
    </div>
  );
}

function Submit({ busy }: { busy: boolean }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="hotel-request-submit" disabled={pending || busy}>
      {pending ? "Sending…" : "Request a bus"}
    </button>
  );
}
