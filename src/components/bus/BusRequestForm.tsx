"use client";

import { useActionState, useEffect, useMemo, useRef, useState, type FormEvent, type MouseEvent } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { submitBusRequest } from "@/actions/bus-request";
import { SuccessModal } from "@/components/hotel-request/HotelRequestForm";
import {
  focusGuideField,
  GuideActions,
  GuideChips,
  GuideCityField,
  GuideContact,
  GuideCounter,
  GuideDateField,
  GuideNote,
  GuideProgress,
  GuideTextField,
  FieldMessage,
  StepTitle,
  clampCount,
  todayIso,
} from "@/components/service-request/guide-ui";
import { busCoachTypes, busTimeWindows } from "@/lib/buses";
import { optionLabel } from "@/lib/custom-request";
import { initialFormState, type FormState } from "@/lib/forms";

type StepIndex = 0 | 1;

const stepFields = [
  ["fromCity", "toCity", "travelDate", "busName"],
  ["passengers", "coach", "timeWindow", "luggageQuantity", "luggageWeight", "message", "phone"],
] as const;

export type BusRequestDefaults = {
  fromCity: string;
  toCity: string;
  travelDate: string;
  passengers: string;
  coach: string;
  timeWindow: string;
  luggageQuantity: string;
  luggageWeight: string;
  busName: string;
  slug: string;
  message: string;
};

export function BusRequestForm({
  sent,
  reference,
  customer,
  defaults,
  cities,
  loginHref,
}: {
  sent: boolean;
  reference: string;
  customer: { name: string; email: string; phone: string } | null;
  defaults: BusRequestDefaults;
  cities: string[];
  loginHref: string;
}) {
  const router = useRouter();
  const [state, action, pending] = useActionState(submitBusRequest, initialFormState);
  const [whatsappState, setWhatsappState] = useState<FormState | null>(null);
  const [whatsappPending, setWhatsappPending] = useState(false);
  const view = whatsappState ?? state;
  const saved = state.values ?? {};
  const busy = pending || whatsappPending;
  const formRef = useRef<HTMLFormElement>(null);
  const firstStep = useRef(true);
  const [mounted, setMounted] = useState(false);
  const [step, setStep] = useState<StepIndex>(0);
  const [successDismissed, setSuccessDismissed] = useState(false);
  const [touched, setTouched] = useState(false);
  const [phoneTouched, setPhoneTouched] = useState(false);
  const today = todayIso();

  const [fromCity, setFromCity] = useState(saved.fromCity || defaults.fromCity);
  const [toCity, setToCity] = useState(saved.toCity || defaults.toCity);
  const [travelDate, setTravelDate] = useState(saved.travelDate || defaults.travelDate);
  const [busName, setBusName] = useState(saved.busName || defaults.busName);
  const [passengers, setPassengers] = useState(clampCount(saved.passengers, defaults.passengers, 1, 20));
  const [coach, setCoach] = useState(saved.coach || defaults.coach || "any");
  const [timeWindow, setTimeWindow] = useState(saved.timeWindow || defaults.timeWindow || "any");
  const [luggageQuantity, setLuggageQuantity] = useState(saved.luggageQuantity || defaults.luggageQuantity || "0");
  const [luggageWeight, setLuggageWeight] = useState(saved.luggageWeight || defaults.luggageWeight || "0");
  const [message, setMessage] = useState(saved.message || defaults.message);
  const [phone, setPhone] = useState(saved.phone || "");
  const cityOptions = useMemo(
    () => Array.from(new Set(cities.map((city) => city.trim()).filter(Boolean))).sort((a, b) => a.localeCompare(b, "en")),
    [cities],
  );

  const tripErrors = useMemo(() => {
    const errors: Record<string, string> = {};
    if (fromCity.trim().length < 2) errors.fromCity = "Enter the boarding city.";
    if (toCity.trim().length < 2) errors.toCity = "Enter the arrival city.";
    else if (fromCity.trim() && fromCity.trim().toLowerCase() === toCity.trim().toLowerCase()) errors.toCity = "Choose a different arrival city.";
    if (!travelDate) errors.travelDate = "Choose your travel date.";
    else if (travelDate < today) errors.travelDate = "Choose today or a future date.";
    return errors;
  }, [fromCity, toCity, today, travelDate]);
  const messageError = message.length > 2000 ? "Keep the note under 2000 characters." : undefined;
  const phoneError = customer && !customer.phone && phoneTouched && phone.replace(/\D/g, "").length < 8
    ? "Enter a phone number with country code."
    : undefined;

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => setMounted(true));
    return () => window.cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    if (!view.error) return;
    const fields = view.fields ?? {};
    const invalidStep = stepFields.findIndex((names) => names.some((name) => fields[name]));
    const frame = window.requestAnimationFrame(() => {
      if (invalidStep >= 0) setStep(invalidStep as StepIndex);
      focusGuideField(stepFields.flat(), fields);
    });
    return () => window.cancelAnimationFrame(frame);
  }, [view]);

  useEffect(() => {
    if (firstStep.current) {
      firstStep.current = false;
      return;
    }
    const card = document.getElementById("bus-request-pass");
    if (!card) return;
    window.scrollTo({ top: Math.max(0, card.getBoundingClientRect().top + window.scrollY - 80), behavior: "smooth" });
  }, [step]);

  const successReference = successDismissed
    ? ""
    : !busy && state.reference && !state.error
      ? state.reference
      : !busy && whatsappState?.reference && !whatsappState.error
        ? whatsappState.reference
        : sent
          ? reference
          : "";

  function errorFor(name: string, clientError?: string, show = false) {
    return view.fields?.[name] || (show ? clientError : undefined);
  }

  function continueTo(next: 1) {
    if (step === 0) {
      setTouched(true);
      if (Object.keys(tripErrors).length) return;
    }
    setStep(next);
  }

  function loginWithBrief(form: HTMLFormElement) {
    const data = new FormData(form);
    const params = new URLSearchParams();
    for (const [from, to] of [
      ["fromCity", "from"],
      ["toCity", "to"],
      ["travelDate", "date"],
      ["passengers", "passengers"],
      ["coach", "coach"],
      ["timeWindow", "time"],
      ["luggageQuantity", "luggageQuantity"],
      ["luggageWeight", "luggageWeight"],
      ["busName", "busName"],
      ["slug", "slug"],
      ["message", "message"],
    ] as const) {
      const value = String(data.get(from) || "").trim();
      if (value && value !== "any") params.set(to, value);
    }
    router.push(params.size ? `/login?next=${encodeURIComponent(`/buses/request?${params}`)}` : loginHref);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    setWhatsappState(null);
    if (step < 1 || busy) {
      event.preventDefault();
      return;
    }
    if (Object.keys(tripErrors).length) {
      event.preventDefault();
      setStep(0);
      setTouched(true);
      return;
    }
    if (messageError) {
      event.preventDefault();
      setStep(1);
      return;
    }
    if (!customer) {
      event.preventDefault();
      loginWithBrief(event.currentTarget);
      return;
    }
    if (!customer.phone && phone.replace(/\D/g, "").length < 8) {
      event.preventDefault();
      setPhoneTouched(true);
      return;
    }
    setSuccessDismissed(false);
  }

  async function sendOnWhatsApp(event: MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    const form = formRef.current;
    if (!form || busy) return;
    if (!customer?.phone && phone.replace(/\D/g, "").length < 8) {
      setPhoneTouched(true);
      return;
    }
    const data = new FormData(form);
    data.set("channel", "whatsapp");
    setSuccessDismissed(false);
    setWhatsappPending(true);
    const result = await submitBusRequest(initialFormState, data);
    setWhatsappState(result);
    setWhatsappPending(false);
    if (result.whatsappUrl) window.open(result.whatsappUrl, "_blank", "noopener,noreferrer");
  }

  const successModal = successReference ? (
    <SuccessModal reference={successReference} exploreHref="/buses" detail="Nothing is booked until you accept a quote." onClose={() => setSuccessDismissed(true)} />
  ) : null;

  return (
    <div className="hotel-request-card hotel-guide-card tour-guide-card" id="bus-request-pass">
      <button type="button" className="hotel-request-back" onClick={() => (window.history.length > 1 ? router.back() : router.push("/buses"))}>
        Back
      </button>
      <div className="hotel-guide-heading">
        <p className="hotel-guide-kicker">PERSONAL BUS CONCIERGE</p>
        <h1>Find the right coach for your journey.</h1>
        <p>Share a few details and our local team will find the right options for you.</p>
      </div>
      <GuideProgress label="Bus" labels={["Route & date", "Bus details"]} step={step} onSelect={(next) => next < step && setStep(next as StepIndex)} />
      <form ref={formRef} id="bus-request-form" action={action} noValidate className="hotel-request-form hotel-guide-form" onSubmit={handleSubmit}>
        <input type="hidden" name="fromCity" value={fromCity} />
        <input type="hidden" name="toCity" value={toCity} />
        <input type="hidden" name="travelDate" value={travelDate} />
        <input type="hidden" name="busName" value={busName} />
        <input type="hidden" name="slug" value={saved.slug || defaults.slug} />
        <input type="hidden" name="passengers" value={passengers} />
        <input type="hidden" name="coach" value={coach} />
        <input type="hidden" name="timeWindow" value={timeWindow} />
        <input type="hidden" name="luggageQuantity" value={luggageQuantity} />
        <input type="hidden" name="luggageWeight" value={luggageWeight} />
        <input type="hidden" name="message" value={message} />
        <input type="hidden" name="phone" value={phone} />
        {view.error ? <p className="hotel-request-banner-alert hotel-guide-alert" role="alert">{view.fields ? "Please check the highlighted details." : view.error}</p> : null}

        {step === 0 ? (
          <section className="hotel-guide-panel" aria-labelledby="bus-step-one-title">
            <StepTitle number="01" id="bus-step-one-title" title="Where and when are you travelling?" text="Choose your boarding and arrival cities, travel date, and an operator if you have one in mind." />
            <div className="hotel-guide-grid">
              <GuideCityField name="fromCity" label="From" value={fromCity} cities={cityOptions} emptyLabel="Choose a boarding city" customLabel="+ Enter another city" customPlaceholder="Enter a city or location" error={errorFor("fromCity", tripErrors.fromCity, touched)} onChange={setFromCity} />
              <GuideCityField name="toCity" label="To" icon="route" value={toCity} cities={cityOptions} emptyLabel="Choose an arrival city" customLabel="+ Enter another city" customPlaceholder="Enter a city or location" error={errorFor("toCity", tripErrors.toCity, touched)} onChange={setToCity} />
              <GuideDateField name="travelDate" label="Travel date" icon="calendar" value={travelDate} min={today} error={errorFor("travelDate", tripErrors.travelDate, touched)} onPick={setTravelDate} />
              <GuideTextField name="busName" label="Bus name (optional)" icon="bus" placeholder="A bus or operator you have in mind" value={busName} onChange={setBusName} error={view.fields?.busName} />
            </div>
          </section>
        ) : null}

        {step === 1 ? (
          <section className="hotel-guide-panel" aria-labelledby="bus-step-two-title">
            <StepTitle number="02" id="bus-step-two-title" title="What should we arrange for the trip?" text="Tell us the passenger count, coach and departure preferences, luggage, and any extra details." />
            <div className="tour-guide-stack">
            <div className="hotel-guide-travellers tour-guide-travellers">
              <GuideCounter id="passengers" label="Passengers" icon="adults" hint="Everyone travelling" value={passengers} min={1} max={20} error={view.fields?.passengers} onChange={setPassengers} />
            </div>
            <GuideChips id="coach" label="Which coach would you like?" labelIcon="bus" options={busCoachTypes} value={coach} onChange={setCoach} error={view.fields?.coach} withIcons />
            <GuideChips id="timeWindow" label="When would you like to leave?" labelIcon="clock" options={busTimeWindows} value={timeWindow} onChange={setTimeWindow} error={view.fields?.timeWindow} withIcons />
            <div className="hotel-guide-grid">
              <div className="hotel-guide-field" id="luggageQuantity-field">
                <label htmlFor="guide-luggageQuantity">Luggage quantity (pieces)</label>
                <div className={`hotel-request-control mt-5${view.fields?.luggageQuantity ? " is-invalid" : ""}`}>
                  <input id="guide-luggageQuantity" type="number" min="0" max="50" step="1" inputMode="numeric" value={luggageQuantity} onChange={(event) => setLuggageQuantity(event.target.value)} aria-invalid={view.fields?.luggageQuantity ? true : undefined} />
                </div>
                <FieldMessage message={view.fields?.luggageQuantity} />
              </div>
              <div className="hotel-guide-field" id="luggageWeight-field">
                <label htmlFor="guide-luggageWeight">Total luggage weight (kg)</label>
                <div className={`hotel-request-control mt-5${view.fields?.luggageWeight ? " is-invalid" : ""}`}>
                  <input id="guide-luggageWeight" type="number" min="0" max="500" step="0.1" inputMode="decimal" value={luggageWeight} onChange={(event) => setLuggageWeight(event.target.value)} aria-invalid={view.fields?.luggageWeight ? true : undefined} />
                </div>
                <FieldMessage message={view.fields?.luggageWeight} />
              </div>
            </div>
            <p className="hotel-guide-reassurance">Enter the total number of pieces and their combined weight. Use 0 if you have no luggage.</p>
            <GuideNote label="Anything else we should know?" placeholder="Pickup point, evening departure, travelling with family" value={message} onChange={setMessage} />
            <FieldMessage message={errorFor("message", messageError, true)} />
            </div>
            <p className="hotel-guide-reassurance">Our travel team will review your requirements and get back to you with suitable buses and a quote.</p>
            <GuideContact customer={customer} phone={phone} error={phoneError} onPhone={setPhone} />
          </section>
        ) : null}
      </form>
      <GuideActions step={step} last={1} formId="bus-request-form" busy={busy} submitLabel="Submit bus request" busyLabel="Sending request…" onBack={() => setStep(0)} onContinue={() => continueTo(1)}>
        {customer ? <button type="button" className="hotel-guide-whatsapp" disabled={busy} onClick={sendOnWhatsApp}>{whatsappPending ? "Preparing…" : "Send via WhatsApp"}</button> : null}
      </GuideActions>
      {mounted && successModal ? createPortal(successModal, document.body) : null}
    </div>
  );
}
