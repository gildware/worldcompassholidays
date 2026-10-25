"use client";

import { useActionState, useEffect, useState, type MouseEvent } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { useFormStatus } from "react-dom";
import { submitServiceRequest } from "@/actions/service-request";
import { BackIcon, SuccessModal } from "@/components/hotel-request/HotelRequestForm";
import { formatPhone } from "@/lib/auth/phone";
import { initialFormState } from "@/lib/forms";

const budgetOptions = [
  { value: "", label: "Any" },
  { value: "upto-1000", label: "Up to 1,000" },
  { value: "1000-5000", label: "1,000 – 5,000" },
  { value: "5000-10000", label: "5,000 – 10,000" },
  { value: "10000-20000", label: "10,000 – 20,000" },
  { value: "above-20000", label: "Above 20,000" },
  { value: "other", label: "Other" },
];

const budgetValues = new Set(budgetOptions.map((option) => option.value));
const fieldOrder = ["phone", "destination", "itemName", "start", "end", "adults", "children", "budget", "message"];

const copy = {
  tour: {
    title: "Request a tour",
    backHref: "/tours",
    exploreHref: "/tours",
    placeLabel: "Place",
    placePlaceholder: "Manali, Leh, Srinagar",
    nameLabel: "Tour name",
    startLabel: "Start date",
    endLabel: "",
    budgetLabel: "Budget (INR)",
    submit: "Request a tour",
    detail: "Nothing is booked until you accept the trip.",
  },
  car: {
    title: "Request a car",
    backHref: "/rentals/cars",
    exploreHref: "/rentals/cars",
    placeLabel: "Pickup city",
    placePlaceholder: "Srinagar, Jammu, Leh",
    nameLabel: "Car name",
    startLabel: "Pickup",
    endLabel: "Return",
    budgetLabel: "Budget per day (INR)",
    submit: "Request a car",
    detail: "Nothing is booked until you accept the car.",
  },
  bike: {
    title: "Request a bike",
    backHref: "/rentals/bikes",
    exploreHref: "/rentals/bikes",
    placeLabel: "Pickup city",
    placePlaceholder: "Srinagar, Manali, Leh",
    nameLabel: "Bike name",
    startLabel: "Pickup",
    endLabel: "Return",
    budgetLabel: "Budget per day (INR)",
    submit: "Request a bike",
    detail: "Nothing is booked until you accept the bike.",
  },
} as const;

export type ServiceKind = keyof typeof copy;

function clampCount(value: string | undefined, fallback: string, min: number, max: number) {
  const parsed = Number(value && /^\d+$/.test(value) ? value : fallback);
  if (!Number.isFinite(parsed)) return min;
  return Math.min(max, Math.max(min, Math.round(parsed)));
}

function focusErrorField(fields?: Record<string, string>) {
  const key = fieldOrder.find((name) => fields?.[name]);
  const input = key ? document.getElementById(key) : null;
  const visibleInput = input instanceof HTMLInputElement && input.type === "hidden" ? null : input;
  const target = visibleInput || (key ? document.getElementById(`${key}-field`) : null) || document.querySelector(".hotel-request-banner-alert");
  if (!(target instanceof HTMLElement)) return;
  target.scrollIntoView({ behavior: "smooth", block: "center" });
  if (visibleInput instanceof HTMLElement) visibleInput.focus({ preventScroll: true });
}

export function ServiceRequestForm({
  kind,
  customer,
  defaults,
  loginHref,
}: {
  kind: ServiceKind;
  customer: { name: string; email: string; phone: string } | null;
  defaults: { destination: string; itemName: string; start: string; end: string; adults: string; children: string; message: string };
  loginHref: string;
}) {
  const router = useRouter();
  const text = copy[kind];
  const [state, action, pending] = useActionState(submitServiceRequest, initialFormState);
  const view = state;
  const saved = view.values ?? {};
  const [mounted, setMounted] = useState(false);
  const [destination, setDestination] = useState(saved.destination || defaults.destination);
  const [note, setNote] = useState(saved.message || defaults.message);
  const savedBudget = saved.budget || "";
  const savedIsOther = Boolean(savedBudget) && !budgetValues.has(savedBudget);
  const [budgetChoice, setBudgetChoice] = useState(savedIsOther ? "other" : savedBudget);
  const [otherBudget, setOtherBudget] = useState(savedIsOther ? savedBudget : "");
  const [adults, setAdults] = useState(clampCount(saved.adults, defaults.adults, 1, 20));
  const [children, setChildren] = useState(clampCount(saved.children, defaults.children, 0, 12));
  const budgetValue = budgetChoice === "other" ? otherBudget.replace(/\D/g, "") : budgetChoice;

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!view.error) return;
    focusErrorField(view.fields);
  }, [view]);

  function loginWithBrief(form: HTMLFormElement | null) {
    const params = new URLSearchParams();
    if (form) {
      const data = new FormData(form);
      for (const key of ["destination", "itemName", "start", "end", "adults", "children", "budget", "message"]) {
        const value = String(data.get(key) || "").trim();
        if (value) params.set(key, value);
      }
    }
    const next = params.size ? `${text.backHref}/request?${params}` : `${text.backHref}/request`;
    window.location.assign(params.size ? `/login?next=${encodeURIComponent(next)}` : loginHref);
  }

  const successReference = !pending && state.reference && !state.error ? state.reference : "";
  const successModal = successReference ? (
    <SuccessModal reference={successReference} exploreHref={text.exploreHref} detail={text.detail} />
  ) : null;

  return (
    <div className="hotel-request-card" id="service-request-pass">
      <button
        type="button"
        className="hotel-request-back"
        onClick={() => (window.history.length > 1 ? router.back() : router.push(text.backHref))}
      >
        <BackIcon />
        Back
      </button>
      <h2>{text.title}</h2>
      <form
        action={action}
        noValidate
        className="hotel-request-form"
        onSubmit={(event) => {
          if (!customer) {
            event.preventDefault();
            loginWithBrief(event.currentTarget);
          }
        }}
      >
        <input type="hidden" name="kind" value={kind} />
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
          <Field label="Alternative phone" name="phone" type="tel" placeholder="Optional" error={view.fields?.phone} defaultValue={saved.phone && saved.phone !== customer.phone ? saved.phone : ""} wide />
        ) : customer ? (
          <Field label="Phone" name="phone" type="tel" placeholder="+91 98765 43210" error={view.fields?.phone} defaultValue={saved.phone} wide />
        ) : null}
        <Field label={text.placeLabel} name="destination" placeholder={text.placePlaceholder} error={view.fields?.destination} value={destination} onChange={setDestination} />
        <Field label={text.nameLabel} name="itemName" placeholder="Optional" error={view.fields?.itemName} defaultValue={saved.itemName || defaults.itemName} />
        <Field label={text.startLabel} name="start" type="date" error={view.fields?.start} defaultValue={saved.start || defaults.start} />
        {text.endLabel ? (
          <Field label={text.endLabel} name="end" type="date" error={view.fields?.end} defaultValue={saved.end || defaults.end} />
        ) : (
          <input type="hidden" name="end" value="" />
        )}
        <div className="hotel-request-span hotel-request-guests is-pair">
          <Stepper label="Adults" name="adults" value={adults} min={1} max={20} error={view.fields?.adults} onChange={setAdults} />
          <Stepper label="Children" name="children" value={children} min={0} max={12} error={view.fields?.children} onChange={setChildren} />
        </div>
        <div className="hotel-request-span" id="budget-field">
          <p className="hotel-request-label" id="service-budget-label">
            {text.budgetLabel}
          </p>
          <div className="hotel-request-budget" role="group" aria-labelledby="service-budget-label">
            {budgetOptions.map((option) => (
              <button key={option.label} type="button" className={budgetChoice === option.value ? "is-on" : ""} aria-pressed={budgetChoice === option.value} onClick={() => setBudgetChoice(option.value)}>
                {option.label}
              </button>
            ))}
          </div>
          {budgetChoice === "other" ? (
            <div className={`hotel-request-control hotel-request-other${view.fields?.budget ? " is-invalid" : ""}`}>
              <input id="budget" name="budget" inputMode="numeric" autoComplete="off" placeholder="Amount in rupees" value={otherBudget} onChange={(event) => setOtherBudget(event.target.value.replace(/[^\d]/g, ""))} aria-invalid={view.fields?.budget ? true : undefined} />
            </div>
          ) : (
            <input type="hidden" name="budget" value={budgetValue} />
          )}
          {view.fields?.budget ? <p className="hotel-request-error">{view.fields.budget}</p> : null}
        </div>
        <Field label="What should we look for?" name="message" multiline placeholder="Dates that can move, a pickup point, travelling with family" error={view.fields?.message} value={note} onChange={setNote} />
        <div className="hotel-request-span hotel-request-actions">
          {customer ? (
            <Submit label={text.submit} busy={pending} />
          ) : (
            <button type="button" className="hotel-request-submit" onClick={(event: MouseEvent<HTMLButtonElement>) => loginWithBrief(event.currentTarget.form)}>
              Log in to request
            </button>
          )}
        </div>
      </form>
      {mounted && successModal ? createPortal(successModal, document.body) : null}
    </div>
  );
}

function Stepper({ label, name, value, min, max, error, onChange }: { label: string; name: string; value: number; min: number; max: number; error?: string; onChange: (value: number) => void }) {
  return (
    <div className="hotel-request-cell" id={`${name}-field`}>
      <label id={`${name}-label`}>{label}</label>
      <div className={`hotel-request-stepper${error ? " is-invalid" : ""}`}>
        <button type="button" aria-label={`Fewer ${label.toLowerCase()}`} disabled={value <= min} onClick={() => onChange(value - 1)}>−</button>
        <output aria-labelledby={`${name}-label`}>{value}</output>
        <button type="button" aria-label={`More ${label.toLowerCase()}`} disabled={value >= max} onClick={() => onChange(value + 1)}>+</button>
      </div>
      <input type="hidden" name={name} value={value} />
      {error ? <p className="hotel-request-error">{error}</p> : null}
    </div>
  );
}

function Field({ label, name, type = "text", placeholder, error, defaultValue, value, onChange, multiline = false, wide = false }: { label: string; name: string; type?: string; placeholder?: string; error?: string; defaultValue?: string; value?: string; onChange?: (value: string) => void; multiline?: boolean; wide?: boolean }) {
  const controlled = value !== undefined;
  return (
    <div className={multiline || wide ? "hotel-request-span" : "hotel-request-cell"}>
      <label htmlFor={name}>{label}</label>
      <div className={`hotel-request-control mt-5${error ? " is-invalid" : ""}`}>
        {multiline ? (
          <textarea id={name} name={name} rows={3} placeholder={placeholder} value={controlled ? value : undefined} defaultValue={controlled ? undefined : defaultValue} onChange={onChange ? (event) => onChange(event.target.value) : undefined} />
        ) : (
          <input id={name} name={name} type={type} placeholder={placeholder} value={controlled ? value : undefined} defaultValue={controlled ? undefined : defaultValue} onChange={onChange ? (event) => onChange(event.target.value) : undefined} />
        )}
      </div>
      {error ? <p className="hotel-request-error">{error}</p> : null}
    </div>
  );
}

function Submit({ label, busy }: { label: string; busy: boolean }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="hotel-request-submit" disabled={pending || busy}>
      {pending ? "Sending…" : label}
    </button>
  );
}
