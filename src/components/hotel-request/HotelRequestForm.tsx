"use client";

import { useActionState, useEffect, useState, type MouseEvent } from "react";
import { useFormStatus } from "react-dom";
import { submitHotelRequest } from "@/actions/hotel-request";
import { WhatsAppIcon } from "@/components/visa/VisaIcons";
import { initialFormState, type FormState } from "@/lib/forms";

const starOptions = [
  { value: "any", label: "Any", title: "Any star rating" },
  { value: "3", label: "3+", title: "3 stars or more" },
  { value: "4", label: "4+", title: "4 stars or more" },
  { value: "5", label: "5", title: "5 stars" },
];

export type HotelRequestDefaults = {
  destination: string;
  checkIn: string;
  checkOut: string;
  adults: string;
  children: string;
  rooms: string;
};

export function HotelRequestForm({
  sent,
  reference,
  customer,
  defaults,
  presetKey = 0,
  destinationPreset = "",
  starsPreset = "",
  messagePreset = "",
}: {
  sent: boolean;
  reference: string;
  customer: { name: string; email: string; phone: string } | null;
  defaults: HotelRequestDefaults;
  presetKey?: number;
  destinationPreset?: string;
  starsPreset?: string;
  messagePreset?: string;
}) {
  const [state, action, pending] = useActionState(submitHotelRequest, initialFormState);
  const [whatsappState, setWhatsappState] = useState<FormState | null>(null);
  const [whatsappPending, setWhatsappPending] = useState(false);
  const view = whatsappState ?? state;
  const saved = view.values ?? {};
  const busy = pending || whatsappPending;
  const [stars, setStars] = useState(saved.stars || "any");
  const [destination, setDestination] = useState(saved.destination || defaults.destination);
  const [note, setNote] = useState(saved.message ?? "");

  useEffect(() => {
    if (!presetKey) return;
    if (destinationPreset) setDestination(destinationPreset);
    if (starsPreset) setStars(starsPreset);
    if (messagePreset) setNote(messagePreset);
  }, [destinationPreset, messagePreset, presetKey, starsPreset]);

  async function sendOnWhatsApp(event: MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    const form = event.currentTarget.form;
    if (!form || busy) return;
    const data = new FormData(form);
    data.set("channel", "whatsapp");
    setWhatsappPending(true);
    const result = await submitHotelRequest(initialFormState, data);
    setWhatsappState(result);
    setWhatsappPending(false);
    if (result.whatsappUrl) window.open(result.whatsappUrl, "_blank", "noopener,noreferrer");
  }

  if (sent) {
    return (
      <div className="hotel-request-card">
        <h2>Request received</h2>
        <p className="hotel-request-lede">
          {reference ? `Reference ${reference}. ` : ""}
          We will search for a hotel that fits and contact you on the phone or email you gave. Nothing is booked until you accept it.
        </p>
        <a className="button -md -dark-1 bg-blue-1 text-white mt-20" href="/hotels">
          Back to hotels
        </a>
      </div>
    );
  }

  if (whatsappState?.reference && !whatsappState.error) {
    return (
      <div className="hotel-request-card">
        <h2>Request saved</h2>
        <p className="hotel-request-lede">
          {whatsappState.reference ? `Reference ${whatsappState.reference}. ` : ""}
          The desk already has this request. Send the WhatsApp message so they have the same details there.
        </p>
        {whatsappState.whatsappUrl ? (
          <a className="hotel-request-whatsapp mt-20" href={whatsappState.whatsappUrl} target="_blank" rel="noreferrer">
            <WhatsAppIcon />
            Open WhatsApp
          </a>
        ) : null}
      </div>
    );
  }

  return (
    <div className="hotel-request-card" id="hotel-request-pass">
      <h2>Your brief</h2>
      <p className="hotel-request-lede">{partyLine(defaults)}. Change any of it below. Nothing is charged from this form.</p>
      <form action={action} noValidate className="hotel-request-form" onSubmit={() => setWhatsappState(null)}>
        {view.error ? (
          <div className="hotel-request-span">
            <p className="hotel-request-banner-alert" role="alert">
              {view.fields ? "Check the highlighted fields." : view.error}
            </p>
          </div>
        ) : null}
        {customer ? (
          <div className="hotel-request-span">
            <p className="hotel-request-lede">
              Sending as {customer.name} ({customer.email}). This request will appear in your account.
            </p>
          </div>
        ) : (
          <>
            <Field label="Name" name="name" autoComplete="name" placeholder="Your name" error={view.fields?.name} defaultValue={saved.name} />
            <Field
              label="Email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="name@email.com"
              error={view.fields?.email}
              defaultValue={saved.email}
            />
          </>
        )}
        <Field
          label="Phone"
          name="phone"
          type="tel"
          autoComplete="tel"
          placeholder="+91 98765 43210"
          error={view.fields?.phone}
          defaultValue={saved.phone || customer?.phone}
          wide
        />
        <Field
          label="City or area"
          name="destination"
          placeholder="Goa, Manali, Dubai"
          error={view.fields?.destination}
          value={destination}
          onChange={setDestination}
        />
        <Field
          label="Hotel name"
          name="hotelName"
          placeholder="Optional"
          error={view.fields?.hotelName}
          defaultValue={saved.hotelName}
        />
        <Field
          label="Check-in"
          name="checkIn"
          type="date"
          error={view.fields?.checkIn}
          defaultValue={saved.checkIn || defaults.checkIn}
        />
        <Field
          label="Check-out"
          name="checkOut"
          type="date"
          error={view.fields?.checkOut}
          defaultValue={saved.checkOut || defaults.checkOut}
        />
        <div className="hotel-request-span hotel-request-guests">
          <Field
            label="Adults"
            name="adults"
            type="number"
            min={1}
            max={20}
            error={view.fields?.adults}
            defaultValue={saved.adults || defaults.adults}
          />
          <Field
            label="Children"
            name="children"
            type="number"
            min={0}
            max={12}
            error={view.fields?.children}
            defaultValue={saved.children || defaults.children}
          />
          <Field
            label="Rooms"
            name="rooms"
            type="number"
            min={1}
            max={10}
            error={view.fields?.rooms}
            defaultValue={saved.rooms || defaults.rooms}
          />
        </div>
        <Field
          label="Budget per night (INR)"
          name="budget"
          type="number"
          min={500}
          max={500000}
          placeholder="Optional"
          error={view.fields?.budget}
          defaultValue={saved.budget}
          wide
        />
        <div className="hotel-request-span">
          <p className="hotel-request-label" id="hotel-stars-label">
            Star preference
          </p>
          <div className="hotel-request-stars" role="group" aria-labelledby="hotel-stars-label">
            {starOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                className={stars === option.value ? "is-on" : ""}
                aria-pressed={stars === option.value}
                title={option.title}
                onClick={() => setStars(option.value)}
              >
                {option.label}
              </button>
            ))}
          </div>
          <input type="hidden" name="stars" value={stars} />
          <FieldMessage id="stars-error" message={view.fields?.stars} />
        </div>
        <Field
          label="What should we look for?"
          name="message"
          multiline
          placeholder="Neighbourhood, breakfast, a sea view, travelling with family"
          error={view.fields?.message}
          value={note}
          onChange={setNote}
        />
        <div className="hotel-request-span hotel-request-actions">
          <Submit busy={busy} />
          <button type="button" className="hotel-request-whatsapp" disabled={busy} onClick={sendOnWhatsApp}>
            <WhatsAppIcon />
            {whatsappPending ? "Saving…" : "Send on WhatsApp"}
          </button>
        </div>
      </form>
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
  min,
  max,
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
  onChange?: (value: string) => void;
  min?: number;
  max?: number;
  error?: string;
  multiline?: boolean;
  wide?: boolean;
}) {
  const errorId = `${name}-error`;
  const controlled = value !== undefined;
  return (
    <div className={multiline || wide ? "hotel-request-span" : "hotel-request-cell"}>
      <label htmlFor={name}>{label}</label>
      <div className={`hotel-request-control mt-5${error ? " is-invalid" : ""}`}>
        {multiline ? (
          <textarea
            id={name}
            name={name}
            rows={4}
            placeholder={placeholder}
            defaultValue={controlled ? undefined : defaultValue}
            value={controlled ? value : undefined}
            onChange={onChange ? (event) => onChange(event.target.value) : undefined}
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? errorId : undefined}
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
            onChange={onChange ? (event) => onChange(event.target.value) : undefined}
            min={min}
            max={max}
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? errorId : undefined}
          />
        )}
      </div>
      <FieldMessage id={errorId} message={error} />
    </div>
  );
}

function FieldMessage({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <p id={id} className="hotel-request-error" role="alert">
      {message}
    </p>
  );
}

function partyLine(defaults: HotelRequestDefaults) {
  const adults = Number(defaults.adults) || 0;
  const children = Number(defaults.children) || 0;
  const rooms = Number(defaults.rooms) || 0;
  const adultText = adults === 1 ? "1 adult" : `${adults} adults`;
  const childText = children === 1 ? "1 child" : `${children} children`;
  const roomText = rooms === 1 ? "1 room" : `${rooms} rooms`;
  return `${adultText}, ${childText}, ${roomText}`;
}

function Submit({ busy }: { busy: boolean }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="hotel-request-submit" disabled={pending || busy}>
      {pending ? "Sending…" : "Request a hotel"}
    </button>
  );
}
