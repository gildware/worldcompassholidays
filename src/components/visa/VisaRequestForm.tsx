"use client";

import { useActionState, useEffect, useMemo, useRef, useState, type FormEvent, type MouseEvent } from "react";
import { useRouter } from "next/navigation";
import type { FirebaseOptions } from "firebase/app";
import { submitVisaRequest } from "@/actions/visa";
import { RequestPhoneVerify } from "@/components/auth/RequestPhoneVerify";
import {
  FieldMessage,
  GuideActions,
  GuideCards,
  GuideContact,
  GuideCounter,
  GuideDateField,
  GuideNote,
  GuideProgress,
  GuideSelectField,
  deferGuideStep,
  RequestSuccessStep,
  ReviewLine,
  ReviewSection,
  StepTitle,
  clampCount,
  focusGuideField,
  optionIcon,
  prettyDate,
  todayIso,
} from "@/components/service-request/guide-ui";
import { CountryMark } from "@/components/visa/CountryFlag";
import { canonicalPhone, formatPhone } from "@/lib/auth/phone";
import { initialFormState, type FormState } from "@/lib/forms";
import { worldCountries } from "@/lib/data/world-countries";
import type { RequestCountry } from "@/lib/request-locations";
import { visaApplyPath, visaTypeLabel, visaTypeLabels } from "@/lib/visa";
import type { SelectOption } from "@/components/ui/SearchableSelect";

type StepIndex = 0 | 1 | 2 | 3 | 4;

const stepLabels = ["Destination", "Dates & party", "Other details", "Preview", "Submitted"] as const;

const stepFields = [
  ["country", "nationality", "visaType"],
  ["departure", "returnDate", "travellers"],
  ["message"],
  ["phone"],
] as const;

const visaTypeCards = [
  { value: "tourist", title: "Tourist", description: "Holiday or short leisure travel", icon: "tourist" },
  { value: "business", title: "Business", description: "Meetings, conferences, or work visits", icon: "business" },
  { value: "family", title: "Family visit", description: "Visiting relatives or a host family", icon: "family" },
  { value: "transit", title: "Transit", description: "A connection through another country", icon: "transit" },
  { value: "other", title: "Not sure yet", description: "We will recommend the right visa type", icon: "any" },
] as const;

function resolveCountryName(value: string, destinations: RequestCountry[]) {
  const needle = value.trim().toLowerCase();
  if (!needle) return "";
  const configured = destinations.find((item) => {
    const tokens = `${item.name} ${item.keywords}`.toLowerCase().split(/[^a-z0-9]+/);
    return item.name.toLowerCase() === needle || tokens.includes(needle);
  });
  if (configured) return configured.name;
  const found = worldCountries.find((item) => {
    const tokens = `${item.name} ${item.keywords}`.toLowerCase().split(/[^a-z0-9]+/);
    return item.name.toLowerCase() === needle || tokens.includes(needle);
  });
  return found?.name ?? value;
}

export function VisaRequestForm({
  customer,
  defaults,
  destinations,
  loginHref: _loginHref,
  firebaseConfig = null,
  defaultCountry = "IN",
}: {
  customer: { name: string; email: string; phone: string } | null;
  defaults: { country: string; visaType: string; nationality?: string };
  destinations: RequestCountry[];
  loginHref: string;
  firebaseConfig?: FirebaseOptions | null;
  defaultCountry?: string;
}) {
  const router = useRouter();
  const [state, action, pending] = useActionState(submitVisaRequest, initialFormState);
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
  const [datesTouched, setDatesTouched] = useState(false);
  const [contactTouched, setContactTouched] = useState(false);
  const today = todayIso();

  const [country, setCountry] = useState(() => {
    const initial = resolveCountryName(saved.country || defaults.country, destinations);
    return destinations.some((item) => item.name === initial) ? initial : "";
  });
  const [nationality, setNationality] = useState(saved.nationality || defaults.nationality || "India");
  const [visaType, setVisaType] = useState(saved.visaType || defaults.visaType);
  const [departure, setDeparture] = useState(saved.departure ?? "");
  const [returnDate, setReturnDate] = useState(saved.returnDate ?? "");
  const [travellers, setTravellers] = useState(clampCount(saved.travellers, "1", 1, 20));
  const [message, setMessage] = useState(saved.message ?? "");
  const [guestName, setGuestName] = useState(saved.name || customer?.name || "");
  const [phone, setPhone] = useState(saved.phone || customer?.phone || "");

  const countryOptions = useMemo<SelectOption[]>(
    () =>
      worldCountries.map((item) => ({
        value: item.name,
        label: item.name,
        keywords: item.keywords,
        icon: <CountryMark code={item.code} />,
      })),
    [],
  );
  const destinationOptions = useMemo<SelectOption[]>(
    () =>
      destinations
        .map((item) => ({
          value: item.name,
          label: item.name,
          keywords: item.keywords,
          icon: item.code ? <CountryMark code={item.code} /> : undefined,
        }))
        .sort((a, b) => a.label.localeCompare(b.label, "en")),
    [destinations],
  );

  const destinationErrors = useMemo(() => {
    const errors: Record<string, string> = {};
    if (!destinations.some((item) => item.name === country)) {
      errors.country = "Choose a destination from the list.";
    }
    if (nationality.trim().length < 2) errors.nationality = "Enter the nationality on the passport.";
    if (!(visaType in visaTypeLabels)) errors.visaType = "Choose a visa type.";
    return errors;
  }, [country, destinations, nationality, visaType]);

  const dateErrors = useMemo(() => {
    const errors: Record<string, string> = {};
    if (!departure) errors.departure = "Choose a departure date.";
    else if (departure < today) errors.departure = "Choose a departure date from today onward.";
    if (!returnDate) errors.returnDate = "Choose a return date.";
    else if (departure && returnDate < departure) errors.returnDate = "Return must be on or after the departure date.";
    return errors;
  }, [departure, returnDate, today]);

  const messageError = message.length > 2000 ? "Keep the note under 2000 characters." : undefined;
  const nameError = !customer && contactTouched && guestName.trim().length < 2 ? "Enter your name." : undefined;
  const phoneError = !contactTouched
    ? undefined
    : !customer
      ? (!canonicalPhone(phone) ? "Enter a phone number with country code." : undefined)
      : (!customer.phone && phone.replace(/\D/g, "").length < 8 ? "Enter a phone number with country code." : undefined);

  const successReference = submittedInThisVisit && !busy && view.reference && !view.error ? view.reference : "";

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
    const card = document.getElementById("visa-request-pass");
    if (!card) return;
    window.scrollTo({ top: Math.max(0, card.getBoundingClientRect().top + window.scrollY - 80), behavior: "smooth" });
  }, [step]);

  function errorFor(name: string, clientError?: string, show = false) {
    return view.fields?.[name] || (show ? clientError : undefined);
  }

  function continueTo(next: 1 | 2 | 3) {
    if (step === 0) {
      setTouched(true);
      if (Object.keys(destinationErrors).length) return;
    }
    if (step === 1) {
      setDatesTouched(true);
      if (Object.keys(dateErrors).length) return;
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
    if (Object.keys(destinationErrors).length) {
      event.preventDefault();
      setStep(0);
      setTouched(true);
      return;
    }
    if (Object.keys(dateErrors).length) {
      event.preventDefault();
      setStep(1);
      setDatesTouched(true);
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
    const result = await submitVisaRequest(initialFormState, data);
    setWhatsappState(result);
    setWhatsappPending(false);
    if (result.whatsappUrl) window.open(result.whatsappUrl, "_blank", "noopener,noreferrer");
  }

  return (
    <div className="hotel-request-card hotel-guide-card tour-guide-card" id="visa-request-pass">
      <button
        type="button"
        className="hotel-request-back"
        onClick={() => (window.history.length > 1 ? router.back() : router.push("/visa-services"))}
      >
        Back
      </button>
      <div className="hotel-guide-heading">
        <h1>Personal visa concierge</h1>
      </div>
      <GuideProgress
        label="Visa"
        labels={stepLabels}
        step={step}
        onSelect={(next) => {
          if (next < step && step < 4) setStep(next as StepIndex);
        }}
      />
      {step === 4 && successReference ? (
        <RequestSuccessStep
          reference={successReference}
          exploreHref="/visa-services"
          detail="Nothing is filed until you accept the quote. We will reply with the document list and the service fee."
        />
      ) : (
      <>
      <form
        ref={formRef}
        id="visa-request-form"
        action={action}
        noValidate
        className="hotel-request-form hotel-guide-form"
        onSubmit={handleSubmit}
      >
        <input type="hidden" name="country" value={country} />
        <input type="hidden" name="nationality" value={nationality} />
        <input type="hidden" name="visaType" value={visaType} />
        <input type="hidden" name="departure" value={departure} />
        <input type="hidden" name="returnDate" value={returnDate} />
        <input type="hidden" name="travellers" value={travellers} />
        <input type="hidden" name="message" value={message} />
        <input type="hidden" name="name" value={guestName} />
        <input type="hidden" name="phone" value={phone} />
        {view.error ? (
          <p className="hotel-request-banner-alert hotel-guide-alert" role="alert">
            {view.fields ? "Please check the highlighted details." : view.error}
          </p>
        ) : null}

        {step === 0 ? (
          <section className="hotel-guide-panel" aria-labelledby="visa-step-one-title">
            <StepTitle
              number="01"
              id="visa-step-one-title"
              title="Where are you travelling, and which visa?"
              text="Choose the destination, the passport nationality, and the visa type that fits the trip."
            />
            <div className="hotel-guide-grid">
              <GuideSelectField
                name="country"
                label="Destination country"
                icon="pin"
                value={country}
                options={destinationOptions}
                emptyLabel="Country you are travelling to"
                searchPlaceholder="Search countries"
                error={errorFor("country", destinationErrors.country, touched)}
                onChange={setCountry}
              />
              <GuideSelectField
                name="nationality"
                label="Nationality"
                icon="passport"
                value={nationality}
                options={countryOptions}
                emptyLabel="Country of your passport"
                searchPlaceholder="Search countries"
                error={errorFor("nationality", destinationErrors.nationality, touched)}
                onChange={setNationality}
              />
            </div>
            <GuideCards
              id="visaType"
              label="Which visa do you need?"
              items={visaTypeCards}
              value={visaType}
              onChange={setVisaType}
              error={errorFor("visaType", destinationErrors.visaType, touched)}
            />
          </section>
        ) : null}

        {step === 1 ? (
          <section className="hotel-guide-panel" aria-labelledby="visa-step-two-title">
            <StepTitle
              number="02"
              id="visa-step-two-title"
              title="When are you travelling?"
              text="Set your travel dates and tell us how many people need the visa."
            />
            <div className="hotel-guide-grid">
              <GuideDateField
                name="departure"
                label="Departure"
                icon="cal-in"
                value={departure}
                min={today}
                error={errorFor("departure", dateErrors.departure, datesTouched)}
                onPick={(next) => {
                  setDeparture(next);
                  if (returnDate && returnDate < next) setReturnDate("");
                }}
              />
              <GuideDateField
                name="returnDate"
                label="Return"
                icon="cal-out"
                value={returnDate}
                min={departure || today}
                error={errorFor("returnDate", dateErrors.returnDate, datesTouched)}
                onPick={setReturnDate}
              />
            </div>
            <div className="hotel-guide-travellers tour-guide-travellers">
              <GuideCounter
                id="travellers"
                label="Travellers"
                icon="adults"
                hint="People needing this visa"
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
          <section className="hotel-guide-panel" aria-labelledby="visa-step-three-title">
            <StepTitle
              number="03"
              id="visa-step-three-title"
              title="Anything else we should know?"
              text="A previous refusal, children on the trip, or a fixed appointment date helps us quote accurately."
            />
            <GuideNote
              label="What should we know?"
              placeholder="A previous refusal, children on the trip, or a fixed appointment date"
              value={message}
              onChange={setMessage}
            />
            <FieldMessage message={errorFor("message", messageError, true)} />
          </section>
        ) : null}

        {step === 3 ? (
          <section className="hotel-guide-panel" aria-labelledby="visa-step-four-title">
            <StepTitle
              number="04"
              id="visa-step-four-title"
              title="Review your visa request"
              text="Check the details before sending. You can edit any section if something needs changing."
            />
            <div className="hotel-guide-review tour-guide-review">
              <ReviewSection title="Destination" icon="pin" onEdit={() => setStep(0)}>
                <ReviewLine label="Country" icon="pin" value={country || "Not provided"} />
                <ReviewLine label="Nationality" icon="passport" value={nationality || "Not provided"} />
                <ReviewLine label="Visa type" icon={optionIcon(visaType)} value={visaTypeLabel(visaType)} />
              </ReviewSection>
              <ReviewSection title="Dates & party" icon="calendar" onEdit={() => setStep(1)}>
                <ReviewLine label="Departure" icon="cal-in" value={prettyDate(departure)} />
                <ReviewLine label="Return" icon="cal-out" value={prettyDate(returnDate)} />
                <ReviewLine
                  label="Travellers"
                  icon="adults"
                  value={`${travellers} ${travellers === 1 ? "traveller" : "travellers"}`}
                />
              </ReviewSection>
              <ReviewSection title="Other details" icon="note" onEdit={() => setStep(2)}>
                <ReviewLine label="Note" icon="note" value={message || "None"} />
              </ReviewSection>
            </div>
            <p className="hotel-guide-reassurance">
              Our travel team will review your request and reply with the document list and a quote. Nothing is filed until you accept.
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
        formId="visa-request-form"
        busy={busy}
        submitLabel="Submit visa request"
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

export type VisaRequestDefaults = {
  country: string;
  visaType: string;
  nationality?: string;
};

export function visaLoginHref(defaults: VisaRequestDefaults) {
  return `/login?next=${encodeURIComponent(visaApplyPath({ country: defaults.country, visaType: defaults.visaType }))}`;
}
