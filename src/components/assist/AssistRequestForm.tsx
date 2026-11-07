"use client";

import { useActionState, useEffect, useMemo, useRef, useState, type FormEvent, type MouseEvent } from "react";
import { useRouter } from "next/navigation";
import type { FirebaseOptions } from "firebase/app";
import { submitAssistRequest } from "@/actions/assist";
import { RequestPhoneVerify } from "@/components/auth/RequestPhoneVerify";
import {
  FieldMessage,
  GuideActions,
  GuideCards,
  GuideContact,
  GuideCounter,
  GuideDateField,
  GuideMultiChips,
  GuideNote,
  GuideProgress,
  GuideSelectField,
  GuideTextField,
  deferGuideStep,
  RequestSuccessStep,
  ReviewLine,
  ReviewSection,
  StepTitle,
  clampCount,
  focusGuideField,
  optionIcon,
  prettyDate,
  timeLabel,
  timeOptions,
  todayIso,
} from "@/components/service-request/guide-ui";
import { CountryMark } from "@/components/visa/CountryFlag";
import { canonicalPhone, formatPhone } from "@/lib/auth/phone";
import {
  assistExtraLabels,
  assistExtras,
  assistRequestPath,
  assistServiceLabel,
  assistServices,
} from "@/lib/assist";
import { initialFormState, type FormState } from "@/lib/forms";
import type { RequestAirport } from "@/lib/request-locations";
import type { SelectOption } from "@/components/ui/SearchableSelect";

type StepIndex = 0 | 1 | 2 | 3 | 4;

const stepLabels = ["Meet & airport", "Flight details", "Help & notes", "Preview", "Submitted"] as const;

const stepFields = [
  ["service", "airport", "airportName"],
  ["flightDate", "flightTime", "flightNumber", "returnDate", "returnTime", "returnFlight", "travellers"],
  ["message"],
  ["phone"],
] as const;

const serviceCards = [
  {
    value: "arrival",
    title: "Arrival",
    description: "A greeter waits at arrivals with your name and walks you out with the bags.",
    icon: "arrival",
  },
  {
    value: "departure",
    title: "Departure",
    description: "Someone meets you at the terminal and stays with you through check-in.",
    icon: "departure",
  },
  {
    value: "transit",
    title: "Transit connection",
    description: "On a tight link, they meet the inbound flight and take you to the next gate.",
    icon: "transit",
  },
  {
    value: "round",
    title: "Arrival and departure",
    description: "Landing and the flight home. Two flight numbers, one quote.",
    icon: "round",
  },
] as const;

const extraOptions = assistExtras.map((value) => ({ value, label: assistExtraLabels[value] }));

export type AssistRequestDefaults = {
  service: string;
  airport: string;
  airportName?: string;
};

export function AssistRequestForm({
  customer,
  defaults,
  airports,
  loginHref: _loginHref,
  firebaseConfig = null,
  defaultCountry = "IN",
}: {
  customer: { name: string; email: string; phone: string } | null;
  defaults: AssistRequestDefaults;
  airports: RequestAirport[];
  loginHref: string;
  firebaseConfig?: FirebaseOptions | null;
  defaultCountry?: string;
}) {
  const router = useRouter();
  const [state, action, pending] = useActionState(submitAssistRequest, initialFormState);
  const [whatsappState, setWhatsappState] = useState<FormState | null>(null);
  const [whatsappPending, setWhatsappPending] = useState(false);
  const view = whatsappState ?? state;
  const saved = state.values ?? {};
  const busy = pending || whatsappPending;
  const [submittedInThisVisit, setSubmittedInThisVisit] = useState(false);
  const [verifyOpen, setVerifyOpen] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const firstStep = useRef(true);
  const verifiedRef = useRef(Boolean(customer));
  const [step, setStep] = useState<StepIndex>(0);
  const [touched, setTouched] = useState(false);
  const [flightTouched, setFlightTouched] = useState(false);
  const [contactTouched, setContactTouched] = useState(false);
  const today = todayIso();

  const [service, setService] = useState(
    saved.service || ((assistServices as readonly string[]).includes(defaults.service) ? defaults.service : ""),
  );
  const [airport, setAirport] = useState(() => {
    const initial = (saved.airport || defaults.airport).trim().toUpperCase();
    return airports.some((item) => item.code === initial) ? initial : "";
  });
  const [flightDate, setFlightDate] = useState(saved.flightDate ?? "");
  const [flightTime, setFlightTime] = useState(saved.flightTime ?? "");
  const [flightNumber, setFlightNumber] = useState(saved.flightNumber ?? "");
  const [returnDate, setReturnDate] = useState(saved.returnDate ?? "");
  const [returnTime, setReturnTime] = useState(saved.returnTime ?? "");
  const [returnFlight, setReturnFlight] = useState(saved.returnFlight ?? "");
  const [travellers, setTravellers] = useState(clampCount(saved.travellers, "1", 1, 20));
  const [extras, setExtras] = useState(() =>
    (saved.extras ?? "")
      .split(",")
      .map((item) => item.trim())
      .filter((item) => (assistExtras as readonly string[]).includes(item as (typeof assistExtras)[number])),
  );
  const [message, setMessage] = useState(saved.message ?? "");
  const [guestName, setGuestName] = useState(saved.name || customer?.name || "");
  const [phone, setPhone] = useState(saved.phone || customer?.phone || "");

  const airportOptions = useMemo<SelectOption[]>(
    () =>
      airports.map((item) => ({
        value: item.code,
        label: item.label,
        keywords: `${item.name} ${item.city} ${item.country} ${item.code}`,
        icon: item.countryCode ? <CountryMark code={item.countryCode} /> : undefined,
      })),
    [airports],
  );
  const times = useMemo(() => timeOptions(flightTime || returnTime), [flightTime, returnTime]);
  const chosenAirport = useMemo(
    () => airports.find((item) => item.code === airport.trim().toUpperCase()) ?? null,
    [airport, airports],
  );

  const meetErrors = useMemo(() => {
    const errors: Record<string, string> = {};
    if (!(assistServices as readonly string[]).includes(service)) {
      errors.service = "Choose arrival, departure, a connection, or both.";
    }
    if (!chosenAirport) errors.airport = "Choose an airport from the list.";
    return errors;
  }, [chosenAirport, service]);

  const flightErrors = useMemo(() => {
    const errors: Record<string, string> = {};
    if (!flightDate) errors.flightDate = "Choose the flight date.";
    else if (flightDate < today) errors.flightDate = "Choose a flight date from today onward.";
    if (!/^([01]\d|2[0-3]):(00|30)$/.test(flightTime)) errors.flightTime = "Choose a flight time.";
    if (!/^[A-Za-z0-9 ]{2,10}$/.test(flightNumber.trim())) errors.flightNumber = "Enter the flight number.";
    if (service === "round") {
      if (!returnDate) errors.returnDate = "Choose the return flight date.";
      else if (flightDate && returnDate < flightDate) {
        errors.returnDate = "The return flight must be on or after the first flight.";
      }
      if (!/^([01]\d|2[0-3]):(00|30)$/.test(returnTime)) errors.returnTime = "Choose the return flight time.";
      if (!/^[A-Za-z0-9 ]{2,10}$/.test(returnFlight.trim())) {
        errors.returnFlight = "Enter the return flight number.";
      }
    }
    return errors;
  }, [flightDate, flightNumber, flightTime, returnDate, returnFlight, returnTime, service, today]);

  const messageError = message.length > 2000 ? "Keep the note under 2000 characters." : undefined;
  const nameError = !customer && contactTouched && guestName.trim().length < 2 ? "Enter your name." : undefined;
  const phoneError = !contactTouched
    ? undefined
    : !customer
      ? (!canonicalPhone(phone) ? "Enter a phone number with country code." : undefined)
      : (!customer.phone && phone.replace(/\D/g, "").length < 8 ? "Enter a phone number with country code." : undefined);

  const successReference = submittedInThisVisit && !busy && view.reference && !view.error ? view.reference : "";
  const airportSummary = chosenAirport?.label || airport || "Not provided";

  useEffect(() => {
    if (successReference) setStep(4);
  }, [successReference]);

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
    const card = document.getElementById("assist-request-pass");
    if (!card) return;
    window.scrollTo({ top: Math.max(0, card.getBoundingClientRect().top + window.scrollY - 80), behavior: "smooth" });
  }, [step]);

  function errorFor(name: string, clientError?: string, show = false) {
    return view.fields?.[name] || (show ? clientError : undefined);
  }

  function continueTo(next: 1 | 2 | 3) {
    if (step === 0) {
      setTouched(true);
      if (Object.keys(meetErrors).length) return;
    }
    if (step === 1) {
      setFlightTouched(true);
      if (Object.keys(flightErrors).length) return;
    }
    if (step === 2 && messageError) return;
    deferGuideStep(() => setStep(next));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    setWhatsappState(null);
    if (step < 3 || busy) {
      event.preventDefault();
      return;
    }
    if (Object.keys(meetErrors).length) {
      event.preventDefault();
      setStep(0);
      setTouched(true);
      return;
    }
    if (Object.keys(flightErrors).length) {
      event.preventDefault();
      setStep(1);
      setFlightTouched(true);
      return;
    }
    if (messageError) {
      event.preventDefault();
      setStep(2);
      return;
    }
    if (!customer && !verifiedRef.current) {
      event.preventDefault();
      setContactTouched(true);
      if (guestName.trim().length < 2 || !canonicalPhone(phone)) return;
      setVerifyOpen(true);
      return;
    }
    if (customer && !customer.phone && phone.replace(/\D/g, "").length < 8) {
      event.preventDefault();
      setContactTouched(true);
      return;
    }
    setSubmittedInThisVisit(true);
  }

  async function sendOnWhatsApp(event: MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    const form = formRef.current;
    if (!form || busy) return;
    if (!customer?.phone && phone.replace(/\D/g, "").length < 8) {
      setContactTouched(true);
      return;
    }
    const data = new FormData(form);
    data.set("channel", "whatsapp");
    setSubmittedInThisVisit(true);
    setWhatsappPending(true);
    const result = await submitAssistRequest(initialFormState, data);
    setWhatsappState(result);
    setWhatsappPending(false);
    if (result.whatsappUrl) window.open(result.whatsappUrl, "_blank", "noopener,noreferrer");
  }

  return (
    <div className="hotel-request-card hotel-guide-card tour-guide-card" id="assist-request-pass">
      <button
        type="button"
        className="hotel-request-back"
        onClick={() => (window.history.length > 1 ? router.back() : router.push("/meet-and-assist"))}
      >
        Back
      </button>
      <div className="hotel-guide-heading">
        <p className="hotel-guide-kicker">PERSONAL AIRPORT CONCIERGE</p>
        <h1>Request a greeter at the airport.</h1>
        <p>Share the flight details and our desk will quote who meets you and the fee before anyone is booked.</p>
      </div>
      <GuideProgress
        label="Greeter"
        labels={stepLabels}
        step={step}
        onSelect={(next) => {
          if (next < step && step < 4) setStep(next as StepIndex);
        }}
      />
      {step === 4 && successReference ? (
        <RequestSuccessStep
          reference={successReference}
          exploreHref="/meet-and-assist"
          detail="Nothing is booked until you accept the quote. We will reply with who meets you and the service fee."
        />
      ) : (
      <>
      <form
        ref={formRef}
        id="assist-request-form"
        action={action}
        noValidate
        className="hotel-request-form hotel-guide-form"
        onSubmit={handleSubmit}
      >
        <input type="hidden" name="service" value={service} />
        <input type="hidden" name="airport" value={airport} />
        <input type="hidden" name="airportName" value={chosenAirport?.name || ""} />
        <input type="hidden" name="flightDate" value={flightDate} />
        <input type="hidden" name="flightTime" value={flightTime} />
        <input type="hidden" name="flightNumber" value={flightNumber} />
        <input type="hidden" name="returnDate" value={service === "round" ? returnDate : ""} />
        <input type="hidden" name="returnTime" value={service === "round" ? returnTime : ""} />
        <input type="hidden" name="returnFlight" value={service === "round" ? returnFlight : ""} />
        <input type="hidden" name="travellers" value={travellers} />
        <input type="hidden" name="message" value={message} />
        <input type="hidden" name="name" value={guestName} />
        <input type="hidden" name="phone" value={phone} />
        {extras.map((extra) => (
          <input key={extra} type="hidden" name="extras" value={extra} />
        ))}
        {view.error ? (
          <p className="hotel-request-banner-alert hotel-guide-alert" role="alert">
            {view.fields ? "Please check the highlighted details." : view.error}
          </p>
        ) : null}

        {step === 0 ? (
          <section className="hotel-guide-panel" aria-labelledby="assist-step-one-title">
            <StepTitle
              number="01"
              id="assist-step-one-title"
              title="What kind of meet, and where?"
              text="Choose arrival, departure, a connection, or both, then pick the airport."
            />
            <GuideCards
              id="service"
              label="Meet type"
              items={serviceCards}
              value={service}
              onChange={setService}
              error={errorFor("service", meetErrors.service, touched)}
            />
            <div className="hotel-guide-grid">
              <GuideSelectField
                name="airport"
                label="Airport"
                icon="plane"
                value={airport}
                options={airportOptions}
                emptyLabel="Choose an airport"
                searchPlaceholder="Search airports"
                error={errorFor("airport", meetErrors.airport, touched)}
                onChange={setAirport}
              />
            </div>
          </section>
        ) : null}

        {step === 1 ? (
          <section className="hotel-guide-panel" aria-labelledby="assist-step-two-title">
            <StepTitle
              number="02"
              id="assist-step-two-title"
              title="Tell us the flight details"
              text="Add the date, time, and flight number so the greeter can follow the arrival board."
            />
            <div className="hotel-guide-grid">
              <GuideDateField
                name="flightDate"
                label="Flight date"
                icon="calendar"
                value={flightDate}
                min={today}
                error={errorFor("flightDate", flightErrors.flightDate, flightTouched)}
                onPick={(next) => {
                  setFlightDate(next);
                  if (returnDate && returnDate < next) setReturnDate("");
                }}
              />
              <GuideSelectField
                name="flightTime"
                label="Flight time"
                icon="clock"
                value={flightTime}
                options={times}
                emptyLabel="Select a time"
                searchPlaceholder="Search a time"
                error={errorFor("flightTime", flightErrors.flightTime, flightTouched)}
                onChange={setFlightTime}
              />
              <GuideTextField
                name="flightNumber"
                label="Flight number"
                icon="plane"
                placeholder="EK 512"
                value={flightNumber}
                onChange={setFlightNumber}
                error={errorFor("flightNumber", flightErrors.flightNumber, flightTouched)}
              />
            </div>
            {service === "round" ? (
              <div className="hotel-guide-grid mt-20">
                <GuideDateField
                  name="returnDate"
                  label="Return flight date"
                  icon="cal-out"
                  value={returnDate}
                  min={flightDate || today}
                  error={errorFor("returnDate", flightErrors.returnDate, flightTouched)}
                  onPick={setReturnDate}
                />
                <GuideSelectField
                  name="returnTime"
                  label="Return flight time"
                  icon="clock"
                  value={returnTime}
                  options={times}
                  emptyLabel="Select a time"
                  searchPlaceholder="Search a time"
                  error={errorFor("returnTime", flightErrors.returnTime, flightTouched)}
                  onChange={setReturnTime}
                />
                <GuideTextField
                  name="returnFlight"
                  label="Return flight number"
                  icon="plane"
                  placeholder="EK 513"
                  value={returnFlight}
                  onChange={setReturnFlight}
                  error={errorFor("returnFlight", flightErrors.returnFlight, flightTouched)}
                />
              </div>
            ) : null}
            <div className="hotel-guide-travellers tour-guide-travellers">
              <GuideCounter
                id="travellers"
                label="Travellers"
                icon="adults"
                hint="People the greeter will meet"
                value={travellers}
                min={1}
                max={20}
                error={view.fields?.travellers}
                onChange={setTravellers}
              />
            </div>
          </section>
        ) : null}

        {step === 2 ? (
          <section className="hotel-guide-panel" aria-labelledby="assist-step-three-title">
            <StepTitle
              number="03"
              id="assist-step-three-title"
              title="What help do you need at the airport?"
              text="Pick any extras you want quoted, and add a note for the greeter."
            />
            <GuideMultiChips
              id="extras"
              label="Help at the airport"
              labelIcon="board"
              options={extraOptions}
              values={extras}
              onChange={setExtras}
              withIcons
            />
            <GuideNote
              label="Anything else we should know?"
              placeholder="Terminal, a child seat, or the name to put on the board"
              value={message}
              onChange={setMessage}
            />
            <FieldMessage message={errorFor("message", messageError, true)} />
          </section>
        ) : null}

        {step === 3 ? (
          <section className="hotel-guide-panel" aria-labelledby="assist-step-four-title">
            <StepTitle
              number="04"
              id="assist-step-four-title"
              title="Review your greeter request"
              text="Check the details before sending. You can edit any section if something needs changing."
            />
            <div className="hotel-guide-review tour-guide-review">
              <ReviewSection title="Meet & airport" icon="plane" onEdit={() => setStep(0)}>
                <ReviewLine label="Meet" icon={optionIcon(service)} value={assistServiceLabel(service)} />
                <ReviewLine label="Airport" icon="pin" value={airportSummary} />
              </ReviewSection>
              <ReviewSection title="Flight" icon="calendar" onEdit={() => setStep(1)}>
                <ReviewLine
                  label="Outbound"
                  icon="plane"
                  value={`${flightNumber || "Flight"} · ${prettyDate(flightDate)} · ${flightTime ? timeLabel(flightTime) : "Time TBD"}`}
                />
                {service === "round" ? (
                  <ReviewLine
                    label="Return"
                    icon="plane"
                    value={`${returnFlight || "Flight"} · ${prettyDate(returnDate)} · ${returnTime ? timeLabel(returnTime) : "Time TBD"}`}
                  />
                ) : null}
                <ReviewLine
                  label="Travellers"
                  icon="adults"
                  value={`${travellers} ${travellers === 1 ? "traveller" : "travellers"}`}
                />
              </ReviewSection>
              <ReviewSection title="Help & notes" icon="note" onEdit={() => setStep(2)}>
                <ReviewLine
                  label="Extras"
                  icon="board"
                  value={extras.length ? extras.map((item) => assistExtraLabels[item as keyof typeof assistExtraLabels] || item).join(", ") : "None"}
                />
                <ReviewLine label="Note" icon="note" value={message || "None"} />
              </ReviewSection>
            </div>
            <p className="hotel-guide-reassurance">
              Our travel team will review the flight and reply with who meets you and the fee. A greeter is booked only after you accept the quote.
            </p>
            <GuideContact
              customer={customer}
              name={guestName}
              phone={phone}
              nameError={nameError}
              phoneError={phoneError}
              onName={(value) => { setGuestName(value); setContactTouched(true); }}
              onPhone={(value) => { setPhone(value); setContactTouched(true); }}
            />
          </section>
        ) : null}
      </form>
      <GuideActions
        step={step}
        last={3}
        formId="assist-request-form"
        busy={busy}
        submitLabel="Submit greeter request"
        busyLabel="Sending request…"
        onBack={() => setStep((step - 1) as StepIndex)}
        onContinue={() => continueTo((step + 1) as 1 | 2 | 3)}
      >
        {customer ? (
          <button type="button" className="hotel-guide-whatsapp" disabled={busy} onClick={sendOnWhatsApp}>
            {whatsappPending ? "Preparing…" : "Send via WhatsApp"}
          </button>
        ) : null}
      </GuideActions>
      </>
      )}
      <RequestPhoneVerify
        open={verifyOpen}
        name={guestName}
        phone={phone}
        config={firebaseConfig}
        defaultCountry={defaultCountry}
        onClose={() => setVerifyOpen(false)}
        onVerified={({ name: verifiedName, phone: verifiedPhone }) => {
          verifiedRef.current = true;
          setGuestName(verifiedName);
          setPhone(formatPhone(verifiedPhone) || verifiedPhone);
          setVerifyOpen(false);
          window.setTimeout(() => formRef.current?.requestSubmit(), 0);
        }}
      />
    </div>
  );
}

export function assistLoginHref(defaults: AssistRequestDefaults) {
  return `/login?next=${encodeURIComponent(assistRequestPath({ service: defaults.service, airport: defaults.airport }))}`;
}
