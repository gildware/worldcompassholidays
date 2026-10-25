"use client";

import { useActionState, useEffect, useState, type MouseEvent } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { useFormStatus } from "react-dom";
import { submitServiceRequest } from "@/actions/service-request";
import { BackIcon, SuccessModal } from "@/components/hotel-request/HotelRequestForm";
import { formatPhone } from "@/lib/auth/phone";
import {
  bikeBudgetBands,
  bikeTypes,
  budgetChoices,
  carBudgetBands,
  carTypes,
  driveOptions,
  helmetOptions,
  riderOptions,
  tourBudgetBands,
  tourLengths,
  tourStyles,
  transmissionOptions,
  yesNoOptions,
  type BudgetBand,
  type RequestOption,
} from "@/lib/custom-request";
import { initialFormState } from "@/lib/forms";

const copy = {
  tour: {
    title: "Request a tour",
    backHref: "/tours",
    exploreHref: "/tours",
    budgetLabel: "Budget per person (INR)",
    budgetBands: tourBudgetBands,
    note: "Pace, meals, travelling with family",
    submit: "Request a tour",
    detail: "Nothing is booked until you accept the trip.",
  },
  car: {
    title: "Request a car",
    backHref: "/rentals/cars",
    exploreHref: "/rentals/cars",
    budgetLabel: "Budget per day (INR)",
    budgetBands: carBudgetBands,
    note: "Airport arrival, luggage, a hill road",
    submit: "Request a car",
    detail: "Nothing is booked until you accept the car.",
  },
  bike: {
    title: "Request a bike",
    backHref: "/rentals/bikes",
    exploreHref: "/rentals/bikes",
    budgetLabel: "Budget per day (INR)",
    budgetBands: bikeBudgetBands,
    note: "A hill ride, luggage, riding experience",
    submit: "Request a bike",
    detail: "Nothing is booked until you accept the bike.",
  },
} as const;

const fieldOrder = {
  tour: ["phone", "startCity", "places", "itemName", "start", "length", "style", "adults", "children", "hotelPickup", "pickupHotel", "datesFlexible", "budget", "message"],
  car: ["phone", "destination", "pickupPoint", "dropoffCity", "itemName", "start", "end", "pickupTime", "vehicleType", "passengers", "drive", "transmission", "childSeats", "budget", "message"],
  bike: ["phone", "destination", "pickupPoint", "dropoffCity", "itemName", "start", "end", "bikeType", "riders", "licence", "helmets", "budget", "message"],
} as const;

const loginKeys = [
  "destination",
  "startCity",
  "places",
  "itemName",
  "pickupPoint",
  "dropoffCity",
  "start",
  "end",
  "pickupTime",
  "length",
  "style",
  "adults",
  "children",
  "hotelPickup",
  "pickupHotel",
  "datesFlexible",
  "vehicleType",
  "passengers",
  "drive",
  "transmission",
  "childSeats",
  "bikeType",
  "riders",
  "licence",
  "helmets",
  "budget",
  "message",
];

export type ServiceKind = keyof typeof copy;

export type ServiceDefaults = {
  destination: string;
  startCity: string;
  places: string;
  itemName: string;
  pickupPoint: string;
  dropoffCity: string;
  start: string;
  end: string;
  pickupTime: string;
  length: string;
  style: string;
  adults: string;
  children: string;
  hotelPickup: string;
  pickupHotel: string;
  datesFlexible: string;
  vehicleType: string;
  passengers: string;
  drive: string;
  transmission: string;
  childSeats: string;
  bikeType: string;
  riders: string;
  licence: string;
  helmets: string;
  budget: string;
  message: string;
};

function clampCount(value: string | undefined, fallback: string, min: number, max: number) {
  const parsed = Number(value && /^\d+$/.test(value) ? value : fallback);
  if (!Number.isFinite(parsed)) return min;
  return Math.min(max, Math.max(min, Math.round(parsed)));
}

function focusErrorField(kind: ServiceKind, fields?: Record<string, string>) {
  const key = fieldOrder[kind].find((name) => fields?.[name]);
  const input = key ? document.getElementById(key) : null;
  const visibleInput = input instanceof HTMLInputElement && input.type === "hidden" ? null : input;
  const target = visibleInput || (key ? document.getElementById(`${key}-field`) : null) || document.querySelector(".hotel-request-banner-alert");
  if (!(target instanceof HTMLElement)) return;
  target.scrollIntoView({ behavior: "smooth", block: "center" });
  if (visibleInput instanceof HTMLElement) visibleInput.focus({ preventScroll: true });
}

function budgetState(saved: string, bands: readonly BudgetBand[]) {
  const choices = new Set(budgetChoices(bands).map((option) => option.value));
  if (!saved) return { choice: "", other: "" };
  if (choices.has(saved)) return { choice: saved, other: "" };
  if (/^\d+$/.test(saved)) return { choice: "other", other: saved };
  return { choice: "", other: "" };
}

export function ServiceRequestForm({
  kind,
  customer,
  defaults,
  loginHref,
}: {
  kind: ServiceKind;
  customer: { name: string; email: string; phone: string } | null;
  defaults: ServiceDefaults;
  loginHref: string;
}) {
  const router = useRouter();
  const text = copy[kind];
  const [state, action, pending] = useActionState(submitServiceRequest, initialFormState);
  const view = state;
  const saved = view.values ?? {};
  const [mounted, setMounted] = useState(false);
  const initialBudget = budgetState(saved.budget || defaults.budget, text.budgetBands);
  const [budgetChoice, setBudgetChoice] = useState(initialBudget.choice);
  const [otherBudget, setOtherBudget] = useState(initialBudget.other);
  const [note, setNote] = useState(saved.message || defaults.message);
  const [destination, setDestination] = useState(saved.destination || defaults.destination);
  const [startCity, setStartCity] = useState(saved.startCity || defaults.startCity);
  const [places, setPlaces] = useState(saved.places || defaults.places);
  const [dropoffCity, setDropoffCity] = useState(saved.dropoffCity || defaults.dropoffCity);
  const [dropMode, setDropMode] = useState(saved.dropoffCity || defaults.dropoffCity ? "other" : "same");
  const [adults, setAdults] = useState(clampCount(saved.adults, defaults.adults, 1, 20));
  const [children, setChildren] = useState(clampCount(saved.children, defaults.children, 0, 12));
  const [passengers, setPassengers] = useState(clampCount(saved.passengers, defaults.passengers, 1, 12));
  const initialSeats = clampCount(saved.childSeats, defaults.childSeats, 0, 4);
  const [childSeatMode, setChildSeatMode] = useState(initialSeats > 0 ? "yes" : "no");
  const [childSeats, setChildSeats] = useState(Math.max(1, initialSeats));
  const [vehicleType, setVehicleType] = useState(saved.vehicleType || defaults.vehicleType || "any");
  const [drive, setDrive] = useState(saved.drive || defaults.drive);
  const [transmission, setTransmission] = useState(saved.transmission || defaults.transmission || "either");
  const [bikeType, setBikeType] = useState(saved.bikeType || defaults.bikeType || "any");
  const [riders, setRiders] = useState(saved.riders === "2" || defaults.riders === "2" ? "2" : "1");
  const initialHelmets = saved.helmets || defaults.helmets;
  const [helmets, setHelmets] = useState(initialHelmets === "1" || initialHelmets === "2" ? initialHelmets : riders === "2" ? "2" : "1");
  const [licence, setLicence] = useState(saved.licence || defaults.licence);
  const [length, setLength] = useState(saved.length || defaults.length);
  const [style, setStyle] = useState(saved.style || defaults.style);
  const [hotelPickup, setHotelPickup] = useState(saved.hotelPickup || defaults.hotelPickup);
  const [datesFlexible, setDatesFlexible] = useState(saved.datesFlexible || defaults.datesFlexible || "no");
  const budgetValue = budgetChoice === "other" ? otherBudget.replace(/\D/g, "") : budgetChoice;

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!view.error) return;
    focusErrorField(kind, view.fields);
  }, [kind, view]);

  function loginWithBrief(form: HTMLFormElement | null) {
    const params = new URLSearchParams();
    if (form) {
      const data = new FormData(form);
      for (const key of loginKeys) {
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

        {kind === "tour" ? (
          <>
            <Field label="Starting from" name="startCity" placeholder="Srinagar, Manali, Delhi" error={view.fields?.startCity} value={startCity} onChange={setStartCity} />
            <Field label="Places to cover" name="places" placeholder="Sonamarg, Gulmarg, Pahalgam" error={view.fields?.places} value={places} onChange={setPlaces} />
            <Field label="Tour name" name="itemName" placeholder="Optional" error={view.fields?.itemName} defaultValue={saved.itemName || defaults.itemName} wide />
            <Field label="Start date" name="start" type="date" error={view.fields?.start} defaultValue={saved.start || defaults.start} />
            <Choices label="Length" name="length" value={length} options={tourLengths} error={view.fields?.length} onChange={setLength} />
            <Choices label="Style" name="style" value={style} options={tourStyles} error={view.fields?.style} onChange={setStyle} />
            <div className="hotel-request-span hotel-request-guests is-pair">
              <Stepper label="Adults" name="adults" value={adults} min={1} max={20} error={view.fields?.adults} onChange={setAdults} />
              <Stepper label="Children" name="children" value={children} min={0} max={12} error={view.fields?.children} onChange={setChildren} />
            </div>
            <Choices label="Hotel pickup" name="hotelPickup" value={hotelPickup} options={yesNoOptions} error={view.fields?.hotelPickup} onChange={setHotelPickup} />
            {hotelPickup === "yes" ? (
              <Field label="Hotel name" name="pickupHotel" placeholder="Where should we collect you?" error={view.fields?.pickupHotel} defaultValue={saved.pickupHotel || defaults.pickupHotel} wide />
            ) : (
              <input type="hidden" name="pickupHotel" value="" />
            )}
            <Choices label="Dates can move" name="datesFlexible" value={datesFlexible} options={yesNoOptions} error={view.fields?.datesFlexible} onChange={setDatesFlexible} />
          </>
        ) : null}

        {kind === "car" || kind === "bike" ? (
          <>
            <Field label="Pickup city" name="destination" placeholder={kind === "bike" ? "Srinagar, Manali, Leh" : "Srinagar, Jammu, Leh"} error={view.fields?.destination} value={destination} onChange={setDestination} />
            <Field label="Pickup point" name="pickupPoint" placeholder="Airport, hotel, or address" error={view.fields?.pickupPoint} defaultValue={saved.pickupPoint || defaults.pickupPoint} />
            <Choices
              label="Drop-off"
              name="dropMode"
              value={dropMode}
              options={[
                { value: "same", label: "Same city" },
                { value: "other", label: "Another city" },
              ]}
              onChange={setDropMode}
            />
            {dropMode === "other" ? (
              <Field label="Drop-off city" name="dropoffCity" placeholder="Leh, Manali, Jammu" error={view.fields?.dropoffCity} value={dropoffCity} onChange={setDropoffCity} wide />
            ) : (
              <input type="hidden" name="dropoffCity" value="" />
            )}
            <Field label={kind === "car" ? "Car name" : "Bike name"} name="itemName" placeholder="Optional" error={view.fields?.itemName} defaultValue={saved.itemName || defaults.itemName} />
            <Field label="Pickup" name="start" type="date" error={view.fields?.start} defaultValue={saved.start || defaults.start} />
            <Field label="Return" name="end" type="date" error={view.fields?.end} defaultValue={saved.end || defaults.end} />
          </>
        ) : null}

        {kind === "car" ? (
          <>
            <Field label="Pickup time" name="pickupTime" type="time" step={60} error={view.fields?.pickupTime} defaultValue={saved.pickupTime || defaults.pickupTime} />
            <Choices label="Vehicle type" name="vehicleType" value={vehicleType} options={carTypes} error={view.fields?.vehicleType} onChange={setVehicleType} />
            <Stepper label="Passengers" name="passengers" value={passengers} min={1} max={12} error={view.fields?.passengers} onChange={setPassengers} />
            <Choices label="Child seats" name="childSeatMode" value={childSeatMode} options={yesNoOptions} onChange={setChildSeatMode} />
            <div className="hotel-request-span" hidden={childSeatMode !== "yes"}>
              <Stepper label="How many child seats" name="childSeats" value={childSeatMode === "yes" ? childSeats : 0} min={1} max={4} error={view.fields?.childSeats} onChange={setChildSeats} />
            </div>
            <Choices label="Driver" name="drive" value={drive} options={driveOptions} error={view.fields?.drive} onChange={setDrive} />
            <Choices label="Transmission" name="transmission" value={transmission} options={transmissionOptions} error={view.fields?.transmission} onChange={setTransmission} />
          </>
        ) : null}

        {kind === "bike" ? (
          <>
            <Choices label="Type" name="bikeType" value={bikeType} options={bikeTypes} error={view.fields?.bikeType} onChange={setBikeType} />
            <Choices
              label="Riders"
              name="riders"
              value={riders}
              options={riderOptions}
              error={view.fields?.riders}
              onChange={(value) => {
                setRiders(value);
                setHelmets(value === "2" ? "2" : "1");
              }}
            />
            <Choices label="Valid two-wheeler licence" name="licence" value={licence} options={yesNoOptions} error={view.fields?.licence} onChange={setLicence} />
            <Choices label="Helmets" name="helmets" value={helmets} options={helmetOptions} error={view.fields?.helmets} onChange={setHelmets} />
          </>
        ) : null}

        <BudgetField label={text.budgetLabel} bands={text.budgetBands} choice={budgetChoice} other={otherBudget} submitted={budgetValue} error={view.fields?.budget} onChoice={setBudgetChoice} onOther={setOtherBudget} />
        <Field label="What should we look for?" name="message" multiline placeholder={text.note} error={view.fields?.message} value={note} onChange={setNote} />
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

function Choices({
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
      <input type="hidden" id={name} name={name} value={value} />
      {error ? <p className="hotel-request-error">{error}</p> : null}
    </div>
  );
}

function BudgetField({
  label,
  bands,
  choice,
  other,
  submitted,
  error,
  onChoice,
  onOther,
}: {
  label: string;
  bands: readonly BudgetBand[];
  choice: string;
  other: string;
  submitted: string;
  error?: string;
  onChoice: (value: string) => void;
  onOther: (value: string) => void;
}) {
  return (
    <div className="hotel-request-span" id="budget-field">
      <p className="hotel-request-label" id="service-budget-label">
        {label}
      </p>
      <div className="hotel-request-budget" role="group" aria-labelledby="service-budget-label">
        {budgetChoices(bands).map((option) => (
          <button key={option.label} type="button" className={choice === option.value ? "is-on" : ""} aria-pressed={choice === option.value} onClick={() => onChoice(option.value)}>
            {option.label}
          </button>
        ))}
      </div>
      {choice === "other" ? (
        <div className={`hotel-request-control hotel-request-other${error ? " is-invalid" : ""}`}>
          <input id="budget" inputMode="numeric" autoComplete="off" placeholder="Amount in rupees" value={other} onChange={(event) => onOther(event.target.value.replace(/[^\d]/g, ""))} aria-invalid={error ? true : undefined} />
        </div>
      ) : null}
      <input type="hidden" name="budget" value={submitted} />
      {error ? <p className="hotel-request-error">{error}</p> : null}
    </div>
  );
}

function Stepper({ label, name, value, min, max, error, onChange }: { label: string; name: string; value: number; min: number; max: number; error?: string; onChange: (value: number) => void }) {
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
      {error ? <p className="hotel-request-error">{error}</p> : null}
    </div>
  );
}

function Field({
  label,
  name,
  type = "text",
  placeholder,
  error,
  defaultValue,
  value,
  onChange,
  multiline = false,
  wide = false,
  step,
}: {
  label: string;
  name: string;
  type?: string;
  placeholder?: string;
  error?: string;
  defaultValue?: string;
  value?: string;
  onChange?: (value: string) => void;
  multiline?: boolean;
  wide?: boolean;
  step?: number;
}) {
  const controlled = value !== undefined;
  return (
    <div className={multiline || wide ? "hotel-request-span" : "hotel-request-cell"} id={multiline || wide ? `${name}-field` : undefined}>
      <label htmlFor={name}>{label}</label>
      <div className={`hotel-request-control mt-5${error ? " is-invalid" : ""}`}>
        {multiline ? (
          <textarea id={name} name={name} rows={3} placeholder={placeholder} value={controlled ? value : undefined} defaultValue={controlled ? undefined : defaultValue} onChange={onChange ? (event) => onChange(event.target.value) : undefined} />
        ) : (
          <input id={name} name={name} type={type} step={step} placeholder={placeholder} value={controlled ? value : undefined} defaultValue={controlled ? undefined : defaultValue} onChange={onChange ? (event) => onChange(event.target.value) : undefined} />
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
