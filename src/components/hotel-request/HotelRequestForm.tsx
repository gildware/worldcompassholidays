"use client";

import { useActionState, useEffect, useState, type MouseEvent } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { useFormStatus } from "react-dom";
import { submitHotelRequest } from "@/actions/hotel-request";
import { WhatsAppIcon } from "@/components/visa/VisaIcons";
import { formatPhone } from "@/lib/auth/phone";
import { budgetChoices, hotelBudgetBands, hotelMeals, hotelRoomTypes, type RequestOption } from "@/lib/custom-request";
import { initialFormState, type FormState } from "@/lib/forms";

const starOptions = [
  { value: "any", label: "Any", title: "Any star rating", count: 0 },
  { value: "3", label: "3 stars", title: "3 stars or more", count: 3 },
  { value: "4", label: "4 stars", title: "4 stars or more", count: 4 },
  { value: "5", label: "5 stars", title: "5 stars", count: 5 },
];

const budgetOptions = budgetChoices(hotelBudgetBands);

const budgetValues = new Set(budgetOptions.map((option) => option.value));
const fieldOrder = ["phone", "destination", "area", "hotelName", "checkIn", "checkOut", "adults", "children", "childAges", "rooms", "budget", "stars", "roomType", "meals", "message"];

function focusErrorField(fields?: Record<string, string>) {
  const key = fieldOrder.find((name) => fields?.[name]);
  const input = key ? document.getElementById(key) : null;
  const visibleInput = input instanceof HTMLInputElement && input.type === "hidden" ? null : input;
  const target = visibleInput || (key ? document.getElementById(`${key}-field`) : null) || document.querySelector(".hotel-request-banner-alert");
  if (!(target instanceof HTMLElement)) return;
  target.scrollIntoView({ behavior: "smooth", block: "center" });
  if (visibleInput instanceof HTMLElement) visibleInput.focus({ preventScroll: true });
}

function splitAges(value: string | undefined, count: number) {
  const parts = (value ?? "")
    .split(",")
    .map((part) => part.trim())
    .filter((part) => /^\d{1,2}$/.test(part) && Number(part) <= 17)
    .slice(0, count);
  while (parts.length < count) parts.push("");
  return parts;
}

function clampCount(value: string | undefined, fallback: string, min: number, max: number) {
  const parsed = Number(value && /^\d+$/.test(value) ? value : fallback);
  if (!Number.isFinite(parsed)) return min;
  return Math.min(max, Math.max(min, Math.round(parsed)));
}

export type HotelRequestDefaults = {
  destination: string;
  checkIn: string;
  checkOut: string;
  adults: string;
  children: string;
  rooms: string;
  hotelName: string;
  message: string;
  stars: string;
  budget: string;
  area: string;
  roomType: string;
  meals: string;
  childAges: string;
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
  loginHref,
  backHref = "/hotels",
}: {
  sent: boolean;
  reference: string;
  customer: { name: string; email: string; phone: string } | null;
  defaults: HotelRequestDefaults;
  presetKey?: number;
  destinationPreset?: string;
  starsPreset?: string;
  messagePreset?: string;
  loginHref: string;
  backHref?: string;
}) {
  const router = useRouter();
  const [state, action, pending] = useActionState(submitHotelRequest, initialFormState);
  const [whatsappState, setWhatsappState] = useState<FormState | null>(null);
  const [whatsappPending, setWhatsappPending] = useState(false);
  const view = whatsappState ?? state;
  const saved = view.values ?? {};
  const busy = pending || whatsappPending;
  const [stars, setStars] = useState(saved.stars || defaults.stars || "any");
  const [destination, setDestination] = useState(saved.destination || defaults.destination);
  const [note, setNote] = useState(saved.message || defaults.message || "");
  const savedBudget = saved.budget || defaults.budget || "";
  const savedIsOther = Boolean(savedBudget) && !budgetValues.has(savedBudget);
  const [budgetChoice, setBudgetChoice] = useState(savedIsOther ? "other" : savedBudget);
  const [otherBudget, setOtherBudget] = useState(savedIsOther ? savedBudget : "");
  const [area, setArea] = useState(saved.area || defaults.area || "");
  const [roomType, setRoomType] = useState(saved.roomType || defaults.roomType || "any");
  const [meals, setMeals] = useState(saved.meals || defaults.meals || "any");
  const [adults, setAdults] = useState(clampCount(saved.adults, defaults.adults, 1, 20));
  const [children, setChildren] = useState(clampCount(saved.children, defaults.children, 0, 12));
  const [childAges, setChildAges] = useState(splitAges(saved.childAges || defaults.childAges, clampCount(saved.children, defaults.children, 0, 12)));
  const [rooms, setRooms] = useState(clampCount(saved.rooms, defaults.rooms, 1, 10));
  const [mounted, setMounted] = useState(false);
  const budgetValue = budgetChoice === "other" ? otherBudget.replace(/\D/g, "") : budgetChoice;

  useEffect(() => {
    if (!presetKey) return;
    if (destinationPreset) setDestination(destinationPreset);
    if (starsPreset) setStars(starsPreset);
    if (messagePreset) setNote(messagePreset);
  }, [destinationPreset, messagePreset, presetKey, starsPreset]);

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
      for (const key of ["destination", "area", "hotelName", "checkIn", "checkOut", "adults", "children", "childAges", "rooms", "stars", "roomType", "meals", "budget", "message"]) {
        const value = String(data.get(key) || "").trim();
        if (value) params.set(key, value);
      }
    }
    if (!params.size) {
      window.location.assign(loginHref);
      return;
    }
    window.location.assign(`/login?next=${encodeURIComponent(`/hotels/request?${params}`)}`);
  }

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

  const successModal = successReference ? (
    <SuccessModal
      reference={successReference}
      exploreHref="/hotels"
      detail="Nothing is booked until you accept a stay."
    />
  ) : null;

  return (
    <div className="hotel-request-card" id="hotel-request-pass">
      <button
        type="button"
        className="hotel-request-back"
        onClick={() => (window.history.length > 1 ? router.back() : router.push(backHref))}
      >
        <BackIcon />
        Back
      </button>
      <h2>Your brief</h2>
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
        <Field
          label="City"
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
          defaultValue={saved.hotelName || defaults.hotelName}
        />
        <Field
          label="Area or landmark"
          name="area"
          placeholder="Dal Lake, Calangute, near the airport"
          error={view.fields?.area}
          value={area}
          onChange={setArea}
          wide
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
          <Stepper label="Adults" name="adults" value={adults} min={1} max={20} error={view.fields?.adults} onChange={setAdults} />
          <Stepper
            label="Children"
            name="children"
            value={children}
            min={0}
            max={12}
            error={view.fields?.children}
            onChange={(next) => {
              setChildren(next);
              setChildAges((current) => {
                const copy = current.slice(0, next);
                while (copy.length < next) copy.push("");
                return copy;
              });
            }}
          />
          <Stepper label="Rooms" name="rooms" value={rooms} min={1} max={10} error={view.fields?.rooms} onChange={setRooms} />
        </div>
        <div className="hotel-request-span" id="childAges-field" hidden={children === 0}>
          <p className="hotel-request-label" id="child-ages-label">
            Ages of the children
          </p>
          <div className="hotel-request-ages" role="group" aria-labelledby="child-ages-label">
            {childAges.map((age, index) => (
              <label key={index}>
                Child {index + 1}
                <input
                  id={index === 0 ? "childAges" : `child-age-${index + 1}`}
                  inputMode="numeric"
                  autoComplete="off"
                  placeholder="Age"
                  value={age}
                  aria-invalid={view.fields?.childAges ? true : undefined}
                  onChange={(event) => {
                    const digits = event.target.value.replace(/\D/g, "").slice(0, 2);
                    const next = digits === "" ? "" : String(Math.min(17, Number(digits)));
                    setChildAges((current) => current.map((item, itemIndex) => (itemIndex === index ? next : item)));
                  }}
                />
              </label>
            ))}
          </div>
          <input type="hidden" name="childAges" value={children > 0 ? childAges.join(",") : ""} />
          <FieldMessage id="childAges-error" message={view.fields?.childAges} />
        </div>
        <div className="hotel-request-span" id="budget-field">
          <p className="hotel-request-label" id="hotel-budget-label">
            Budget per night (INR)
          </p>
          <div className="hotel-request-budget" role="group" aria-labelledby="hotel-budget-label">
            {budgetOptions.map((option) => (
              <button
                key={option.label}
                type="button"
                className={budgetChoice === option.value ? "is-on" : ""}
                aria-pressed={budgetChoice === option.value}
                onClick={() => setBudgetChoice(option.value)}
              >
                {option.label}
              </button>
            ))}
          </div>
          {budgetChoice === "other" ? (
            <div className={`hotel-request-control hotel-request-other${view.fields?.budget ? " is-invalid" : ""}`}>
              <input
                id="budget"
                name="budget"
                inputMode="numeric"
                autoComplete="off"
                placeholder="Amount in rupees"
                value={otherBudget}
                onChange={(event) => setOtherBudget(event.target.value.replace(/[^\d]/g, ""))}
                aria-invalid={view.fields?.budget ? true : undefined}
                aria-describedby={view.fields?.budget ? "budget-error" : undefined}
              />
            </div>
          ) : (
            <input type="hidden" name="budget" value={budgetValue} />
          )}
          <FieldMessage id="budget-error" message={view.fields?.budget} />
        </div>
        <div className="hotel-request-span" id="stars-field">
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
                <GoldStars count={option.count} />
                <span>{option.label}</span>
              </button>
            ))}
          </div>
          <input type="hidden" name="stars" value={stars} />
          <FieldMessage id="stars-error" message={view.fields?.stars} />
        </div>
        <ChoiceRow label="Room type" name="roomType" value={roomType} options={hotelRoomTypes} error={view.fields?.roomType} onChange={setRoomType} />
        <ChoiceRow label="Meals" name="meals" value={meals} options={hotelMeals} error={view.fields?.meals} onChange={setMeals} />
        <Field
          label="What should we look for?"
          name="message"
          multiline
          placeholder="A quiet room, a late arrival, travelling with family"
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
  options: readonly RequestOption[];
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
          <button key={option.value} type="button" className={value === option.value ? "is-on" : ""} aria-pressed={value === option.value} onClick={() => onChange(option.value)}>
            {option.label}
          </button>
        ))}
      </div>
      <input type="hidden" name={name} value={value} />
      <FieldMessage id={`${name}-error`} message={error} />
    </div>
  );
}

function GoldStars({ count }: { count: number }) {
  const shown = count === 0 ? 5 : count;
  return (
    <span className={`hotel-request-star-icons${count === 0 ? " is-empty" : ""}`} aria-hidden="true">
      {Array.from({ length: shown }, (_, index) => (
        <svg key={index} viewBox="0 0 24 24" focusable="false">
          <path d="M12 2.6 14.9 8.7l6.6.6-5 4.4 1.5 6.5L12 16.8 6 20.2l1.5-6.5-5-4.4 6.6-.6L12 2.6z" />
        </svg>
      ))}
    </span>
  );
}

function Stepper({
  label,
  name,
  value,
  min,
  max,
  error,
  onChange,
}: {
  label: string;
  name: string;
  value: number;
  min: number;
  max: number;
  error?: string;
  onChange: (value: number) => void;
}) {
  const errorId = `${name}-error`;
  return (
    <div className="hotel-request-cell" id={`${name}-field`}>
      <label id={`${name}-label`}>{label}</label>
      <div className={`hotel-request-stepper${error ? " is-invalid" : ""}`}>
        <button type="button" aria-label={`Fewer ${label.toLowerCase()}`} disabled={value <= min} onClick={() => onChange(value - 1)}>
          −
        </button>
        <output aria-labelledby={`${name}-label`}>{value}</output>
        <button type="button" aria-label={`More ${label.toLowerCase()}`} disabled={value >= max} onClick={() => onChange(value + 1)}>
          +
        </button>
      </div>
      <input type="hidden" name={name} value={value} />
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

function Submit({ busy }: { busy: boolean }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="hotel-request-submit" disabled={pending || busy}>
      {pending ? "Sending…" : "Request a hotel"}
    </button>
  );
}

export function BackIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M15 5 8 12l7 7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function SuccessModal({
  reference,
  exploreHref,
  detail,
}: {
  reference: string;
  exploreHref: string;
  detail: string;
}) {
  return (
    <div className="hotel-request-modal" role="dialog" aria-modal="true" aria-labelledby="hotel-request-success-title">
      <div className="hotel-request-modal-card">
        <div className="hotel-request-modal-mark" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none">
            <path d="M6.5 12.5 10.2 16.2 17.5 8" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <h2 id="hotel-request-success-title">Request received</h2>
        <p>
          Reference {reference}. {detail}
        </p>
        <div className="hotel-request-modal-actions">
          <a className="hotel-request-modal-secondary" href={exploreHref}>
            Explore more
          </a>
          <a className="hotel-request-submit" href={`/account/enquiries/${reference}`}>
            View request
          </a>
        </div>
      </div>
    </div>
  );
}
