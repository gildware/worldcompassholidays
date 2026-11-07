"use client";

import { useActionState, useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import type { FirebaseOptions } from "firebase/app";
import { submitServiceRequest } from "@/actions/service-request";
import { RequestPhoneVerify } from "@/components/auth/RequestPhoneVerify";
import { canonicalPhone, formatPhone } from "@/lib/auth/phone";
import {
  FieldMessage,
  focusGuideField,
  GuideActions,
  GuideBudget,
  GuideCards,
  GuideChips,
  GuideCityField,
  GuideContact,
  GuideCounter,
  GuideDateField,
  GuideNote,
  GuideProgress,
  GuideSelectField,
  GuideTextField,
  deferGuideStep,
  RequestSuccessStep,
  ReviewLine,
  ReviewSection,
  StepTitle,
  budgetFromSaved,
  budgetSummary,
  clampCount,
  nextDayIso,
  plural,
  prettyDate,
  resolveBudget,
  timeLabel,
  timeOptions,
  todayIso,
} from "@/components/service-request/guide-ui";
import {
  bikeBudgetBands,
  bikeTypes,
  carBudgetBands,
  carTypes,
  driveOptions,
  optionLabel,
  riderOptions,
  transmissionOptions,
  yesNoOptions,
} from "@/lib/custom-request";
import { initialFormState } from "@/lib/forms";

export type ServiceKind = "tour" | "car" | "bike";
type RentalKind = Exclude<ServiceKind, "tour">;
type StepIndex = 0 | 1 | 2 | 3 | 4;

const copy = {
  car: {
    kicker: "PERSONAL CAR CONCIERGE",
    heading: "Find the right car for your trip.",
    lede: "Share a few details and our local team will find the right options for you.",
    backHref: "/rentals/cars",
    labels: ["Trip details", "Car options", "Budget & notes", "Review", "Submitted"],
    stepOneTitle: "Where and when do you need the car?",
    stepOneText: "Set your pickup and return details, including the pickup point and time.",
    stepTwoTitle: "Choose your car and driver options",
    stepTwoText: "Tell us the car type, passenger count, child-seat needs, driver and transmission preference.",
    stepThreeTitle: "What is your daily budget?",
    stepThreeText: "Choose a per-day budget and share details that will help us find the right car.",
    stepFourTitle: "Review your car request",
    stepFourText: "Check your trip and car preferences before sending your request.",
    nameLabel: "Car name (optional)",
    namePlaceholder: "A model you have in mind",
    budgetLabel: "Budget per day",
    budgetUnit: "per day",
    bands: carBudgetBands,
    notePlaceholder: "Airport arrival, luggage, a hill road",
    submit: "Submit car request",
    detail: "Nothing is booked until you accept the car.",
    reassurance: "Our travel team will review your requirements and get back to you with suitable cars and a quote.",
  },
  bike: {
    kicker: "PERSONAL BIKE CONCIERGE",
    heading: "Find the right bike for your ride.",
    lede: "Share a few details and our local team will find the right options for you.",
    backHref: "/rentals/bikes",
    labels: ["Trip details", "Bike options", "Budget & notes", "Review", "Submitted"],
    stepOneTitle: "Where and when do you need the bike?",
    stepOneText: "Choose your pickup city and point, rental dates, and where you’ll return the bike.",
    stepTwoTitle: "Choose your bike and riding option",
    stepTwoText: "Select a bike type and whether you need a driver. If not, we’ll ask about your licence and who is riding.",
    stepThreeTitle: "What is your daily budget?",
    stepThreeText: "Choose a per-day budget and share details that will help us find the right bike.",
    stepFourTitle: "Review your bike request",
    stepFourText: "Check your trip and bike preferences before sending your request.",
    nameLabel: "Bike name (optional)",
    namePlaceholder: "A model you have in mind",
    budgetLabel: "Budget per day",
    budgetUnit: "per day",
    bands: bikeBudgetBands,
    notePlaceholder: "A hill ride, luggage, riding experience",
    submit: "Submit bike request",
    detail: "Nothing is booked until you accept the bike.",
    reassurance: "Our travel team will review your requirements and get back to you with suitable bikes and a quote.",
  },
} as const;

const fieldSteps: Record<RentalKind, readonly (readonly string[])[]> = {
  car: [
    ["destination", "pickupPoint", "dropoffCity", "itemName", "start", "end", "pickupTime"],
    ["vehicleType", "passengers", "childSeats", "drive", "transmission"],
    ["budget", "message"],
    ["phone"],
  ],
  bike: [
    ["destination", "pickupPoint", "dropoffCity", "itemName", "start", "end"],
    ["needDriver", "licence", "riders", "bikeType"],
    ["budget", "message"],
    ["phone"],
  ],
};

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
  tourType: string;
  needFood: string;
  foodPreference: string;
  dietaryPreferences: string;
  needCar: string;
  carPreference: string;
  needHotel: string;
  hotelPreference: string;
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
  needDriver: string;
  licence: string;
  budget: string;
  message: string;
};

const driveCards = [
  { value: "self", title: "Self-drive", description: "You drive the car yourself", icon: "key" },
  { value: "driver", title: "With driver", description: "A local driver takes you around", icon: "wheel" },
] as const;

const riderCards = [
  { value: "1", title: "Solo", description: "Riding on your own", icon: "bike" },
  { value: "2", title: "With a pillion", description: "The rider plus one passenger", icon: "users" },
] as const;

const dropOptions = [
  { value: "same", label: "Same city" },
  { value: "other", label: "Another city" },
];

function dayCount(start: string, end: string) {
  if (!start || !end) return 0;
  return Math.max(0, Math.round((new Date(`${end}T00:00:00`).getTime() - new Date(`${start}T00:00:00`).getTime()) / 86400000));
}

export function ServiceRequestForm({
  kind,
  customer,
  defaults,
  loginHref: _loginHref,
  locations,
  firebaseConfig = null,
  defaultCountry = "IN",
}: {
  kind: RentalKind;
  customer: { name: string; email: string; phone: string } | null;
  defaults: ServiceDefaults;
  loginHref: string;
  locations: string[];
  firebaseConfig?: FirebaseOptions | null;
  defaultCountry?: string;
}) {
  const router = useRouter();
  const text = copy[kind];
  const isCar = kind === "car";
  const formId = `${kind}-request-form`;
  const [state, action, pending] = useActionState(submitServiceRequest, initialFormState);
  const saved = state.values ?? {};
  const [submittedInThisVisit, setSubmittedInThisVisit] = useState(false);
  const [verifyOpen, setVerifyOpen] = useState(false);
  const [step, setStep] = useState<StepIndex>(0);
  const [touched, setTouched] = useState<[boolean, boolean, boolean]>([false, false, false]);
  const [contactTouched, setContactTouched] = useState(false);
  const firstStep = useRef(true);
  const formRef = useRef<HTMLFormElement>(null);
  const verifiedRef = useRef(Boolean(customer));
  const today = todayIso();

  const [destination, setDestination] = useState(() => {
    const initial = saved.destination || defaults.destination;
    return locations.includes(initial) ? initial : "";
  });
  const [pickupPoint, setPickupPoint] = useState(saved.pickupPoint || defaults.pickupPoint);
  const [itemName, setItemName] = useState(saved.itemName || defaults.itemName);
  const [dropMode, setDropMode] = useState(saved.dropoffCity || defaults.dropoffCity ? "other" : "same");
  const [dropoffCity, setDropoffCity] = useState(() => {
    const initial = saved.dropoffCity || defaults.dropoffCity;
    return locations.includes(initial) ? initial : "";
  });
  const [start, setStart] = useState(saved.start || defaults.start);
  const [end, setEnd] = useState(saved.end || defaults.end);
  const [pickupTime, setPickupTime] = useState(saved.pickupTime || defaults.pickupTime);
  const [vehicleType, setVehicleType] = useState(saved.vehicleType || defaults.vehicleType || "any");
  const [passengers, setPassengers] = useState(clampCount(saved.passengers, defaults.passengers, 1, 12));
  const [childSeats, setChildSeats] = useState(clampCount(saved.childSeats, defaults.childSeats, 0, 4));
  const [drive, setDrive] = useState(saved.drive || defaults.drive);
  const [transmission, setTransmission] = useState(saved.transmission || defaults.transmission || "either");
  const [bikeType, setBikeType] = useState(saved.bikeType || defaults.bikeType || "any");
  const [riders, setRiders] = useState(saved.riders === "2" || defaults.riders === "2" ? "2" : "1");
  const [needDriver, setNeedDriver] = useState(saved.needDriver || defaults.needDriver);
  const [licence, setLicence] = useState(saved.licence || defaults.licence);
  const initialBudget = budgetFromSaved(text.bands, saved.budget || defaults.budget);
  const [budgetChoice, setBudgetChoice] = useState(initialBudget.choice);
  const [otherBudget, setOtherBudget] = useState(initialBudget.other);
  const [message, setMessage] = useState(saved.message || defaults.message);
  const [guestName, setGuestName] = useState(saved.name || customer?.name || "");
  const [phone, setPhone] = useState(saved.phone || customer?.phone || "");

  const budget = resolveBudget(text.bands, budgetChoice, otherBudget);
  const times = useMemo(() => timeOptions(pickupTime), [pickupTime]);

  const stepErrors = useMemo(() => {
    const trip: Record<string, string> = {};
    if (!locations.includes(destination)) trip.destination = "Choose a pickup city.";
    if (pickupPoint.trim().length < 2) trip.pickupPoint = "Enter the pickup point.";
    if (dropMode === "other" && !locations.includes(dropoffCity)) trip.dropoffCity = "Choose a drop-off city.";
    if (!start) trip.start = "Choose your pickup date.";
    else if (start < today) trip.start = "Choose today or a future date.";
    if (!end) trip.end = "Choose your return date.";
    else if (start && end <= start) trip.end = "Return must be after the pickup date.";
    if (isCar && !/^([01]\d|2[0-3]):[0-5]\d$/.test(pickupTime)) trip.pickupTime = "Choose a pickup time.";

    const ride: Record<string, string> = {};
    if (isCar) {
      if (!carTypes.some((option) => option.value === vehicleType)) ride.vehicleType = "Choose a vehicle type.";
      if (!driveOptions.some((option) => option.value === drive)) ride.drive = "Say whether you need a driver.";
      if (!transmissionOptions.some((option) => option.value === transmission)) ride.transmission = "Choose a transmission.";
    } else {
      if (!yesNoOptions.some((option) => option.value === needDriver)) ride.needDriver = "Say whether you need a driver.";
      if (needDriver === "no") {
        if (!yesNoOptions.some((option) => option.value === licence)) ride.licence = "Say whether you have a valid two-wheeler licence.";
        if (!riderOptions.some((option) => option.value === riders)) ride.riders = "Choose solo or with a pillion.";
      }
      if (!bikeTypes.some((option) => option.value === bikeType)) ride.bikeType = "Choose a bike type.";
    }

    const details: Record<string, string> = {};
    if (budget.error) details.budget = budget.error;
    if (message.length > 2000) details.message = "Keep the note under 2000 characters.";
    return [trip, ride, details] as const;
  }, [bikeType, budget.error, destination, drive, dropMode, dropoffCity, end, isCar, licence, locations, message, needDriver, pickupPoint, pickupTime, riders, start, today, transmission, vehicleType]);

  const nameError = !customer && contactTouched && guestName.trim().length < 2 ? "Enter your name." : undefined;
  const phoneError = !contactTouched
    ? undefined
    : !customer
      ? (!canonicalPhone(phone) ? "Enter a phone number with country code." : undefined)
      : (!customer.phone && phone.replace(/\D/g, "").length < 8 ? "Enter a phone number with country code." : undefined);

  const successReference = submittedInThisVisit && !pending && state.reference && !state.error ? state.reference : "";

  useEffect(() => {
    if (successReference) setStep(4);
  }, [successReference]);

  useEffect(() => {
    if (!state.error) return;
    const fields = state.fields ?? {};
    const invalidStep = fieldSteps[kind].findIndex((names) => names.some((name) => fields[name]));
    const frame = window.requestAnimationFrame(() => {
      if (invalidStep >= 0) setStep(invalidStep as StepIndex);
      focusGuideField(fieldSteps[kind].flat(), fields);
    });
    return () => window.cancelAnimationFrame(frame);
  }, [kind, state]);

  useEffect(() => {
    if (firstStep.current) {
      firstStep.current = false;
      return;
    }
    const card = document.getElementById(`${kind}-request-pass`);
    if (!card) return;
    window.scrollTo({ top: Math.max(0, card.getBoundingClientRect().top + window.scrollY - 80), behavior: "smooth" });
  }, [kind, step]);

  function errorFor(name: string, clientError?: string, show = false) {
    return state.fields?.[name] || (show ? clientError : undefined);
  }

  function touchStep(index: 0 | 1 | 2) {
    setTouched((current) => current.map((value, position) => (position === index ? true : value)) as [boolean, boolean, boolean]);
  }

  function continueTo(next: 1 | 2 | 3) {
    if (step < 3) {
      const index = step as 0 | 1 | 2;
      touchStep(index);
      if (Object.keys(stepErrors[index]).length) return;
    }
    deferGuideStep(() => setStep(next));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    if (step < 3 || pending) {
      event.preventDefault();
      return;
    }
    for (const index of [0, 1, 2] as const) {
      if (Object.keys(stepErrors[index]).length) {
        event.preventDefault();
        setStep(index);
        touchStep(index);
        return;
      }
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

  const [tripErrors, rideErrors, detailErrors] = stepErrors;
  const [showTrip, showRide, showDetails] = touched;
  const days = dayCount(start, end);

  return (
    <div className="hotel-request-card hotel-guide-card tour-guide-card" id={`${kind}-request-pass`}>
      <button type="button" className="hotel-request-back" onClick={() => (window.history.length > 1 ? router.back() : router.push(text.backHref))}>
        Back
      </button>
      <div className="hotel-guide-heading">
        <p className="hotel-guide-kicker">{text.kicker}</p>
        <h1>{text.heading}</h1>
        <p>{text.lede}</p>
      </div>
      <GuideProgress label={isCar ? "Car" : "Bike"} labels={text.labels} step={step} onSelect={(next) => next < step && step < 4 && setStep(next as StepIndex)} />
      {step === 4 && successReference ? (
        <RequestSuccessStep reference={successReference} exploreHref={text.backHref} detail={text.detail} />
      ) : (
      <>
      <form ref={formRef} id={formId} action={action} noValidate className="hotel-request-form hotel-guide-form" onSubmit={handleSubmit}>
        <input type="hidden" name="kind" value={kind} />
        <input type="hidden" name="destination" value={destination} />
        <input type="hidden" name="pickupPoint" value={pickupPoint} />
        <input type="hidden" name="itemName" value={itemName} />
        <input type="hidden" name="dropMode" value={dropMode} />
        <input type="hidden" name="dropoffCity" value={dropMode === "other" ? dropoffCity : ""} />
        <input type="hidden" name="start" value={start} />
        <input type="hidden" name="end" value={end} />
        {isCar ? (
          <>
            <input type="hidden" name="pickupTime" value={pickupTime} />
            <input type="hidden" name="vehicleType" value={vehicleType} />
            <input type="hidden" name="passengers" value={passengers} />
            <input type="hidden" name="childSeats" value={childSeats} />
            <input type="hidden" name="drive" value={drive} />
            <input type="hidden" name="transmission" value={transmission} />
          </>
        ) : (
          <>
            <input type="hidden" name="bikeType" value={bikeType} />
            <input type="hidden" name="needDriver" value={needDriver} />
            <input type="hidden" name="riders" value={needDriver === "no" ? riders : ""} />
            <input type="hidden" name="licence" value={needDriver === "no" ? licence : ""} />
          </>
        )}
        <input type="hidden" name="budget" value={budget.value} />
        <input type="hidden" name="message" value={message} />
        <input type="hidden" name="name" value={customer?.name || guestName} />
        <input type="hidden" name="phone" value={phone} />
        {state.error ? <p className="hotel-request-banner-alert hotel-guide-alert" role="alert">{state.fields ? "Please check the highlighted details." : state.error}</p> : null}

        {step === 0 ? (
          <section className="hotel-guide-panel" aria-labelledby={`${kind}-step-one-title`}>
            <StepTitle number="01" id={`${kind}-step-one-title`} title={text.stepOneTitle} text={text.stepOneText} />
            <div className="hotel-guide-grid">
              <GuideCityField
                name="destination"
                label="Pickup city"
                value={destination}
                cities={locations}
                emptyLabel="Choose a pickup city"
                error={errorFor("destination", tripErrors.destination, showTrip)}
                onChange={setDestination}
              />
              <GuideTextField name="pickupPoint" label="Pickup point" icon="route" placeholder="Airport, hotel, or address" value={pickupPoint} onChange={setPickupPoint} error={errorFor("pickupPoint", tripErrors.pickupPoint, showTrip)} />
              <GuideDateField
                name="start"
                label="Pickup date"
                icon="cal-in"
                value={start}
                min={today}
                error={errorFor("start", tripErrors.start, showTrip)}
                onPick={(value) => {
                  setStart(value);
                  if (end && end <= value) setEnd("");
                }}
              />
              <GuideDateField name="end" label="Return date" icon="cal-out" value={end} min={nextDayIso(start || today)} error={errorFor("end", tripErrors.end, showTrip)} onPick={setEnd} />
              {isCar ? (
                <>
                  <GuideSelectField name="pickupTime" label="Pickup time" icon="clock" value={pickupTime} options={times} emptyLabel="Choose a time" searchPlaceholder="Search time" error={errorFor("pickupTime", tripErrors.pickupTime, showTrip)} onChange={setPickupTime} />
                  <GuideTextField name="itemName" label={text.nameLabel} icon="car" placeholder={text.namePlaceholder} value={itemName} onChange={setItemName} error={state.fields?.itemName} />
                </>
              ) : (
                <GuideTextField name="itemName" label={text.nameLabel} icon="bike" placeholder={text.namePlaceholder} value={itemName} onChange={setItemName} error={state.fields?.itemName} wide />
              )}
            </div>
            <div className="tour-guide-drop">
              <GuideChips id="dropMode" label="Where will you drop it off?" labelIcon="pin" options={dropOptions} value={dropMode} onChange={setDropMode} />
              {dropMode === "other" ? (
                <GuideCityField
                  name="dropoffCity"
                  label="Drop-off city"
                  value={dropoffCity}
                  cities={locations}
                  emptyLabel="Choose a drop-off city"
                  error={errorFor("dropoffCity", tripErrors.dropoffCity, showTrip)}
                  onChange={setDropoffCity}
                />
              ) : null}
            </div>
          </section>
        ) : null}

        {step === 1 && isCar ? (
          <section className="hotel-guide-panel" aria-labelledby="car-step-two-title">
            <StepTitle number="02" id="car-step-two-title" title={text.stepTwoTitle} text={text.stepTwoText} />
            <div className="tour-guide-stack">
            <div className="hotel-guide-travellers tour-guide-travellers">
              <GuideCounter id="passengers" label="Passengers" icon="adults" hint="Including you" value={passengers} min={1} max={12} error={state.fields?.passengers} onChange={setPassengers} />
              <GuideCounter id="childSeats" label="Child seats" icon="children" hint="If you need them" value={childSeats} min={0} max={4} error={state.fields?.childSeats} onChange={setChildSeats} />
            </div>
            <GuideChips id="vehicleType" label="What type of car are you looking for?" labelIcon="car" options={carTypes} value={vehicleType} onChange={setVehicleType} error={errorFor("vehicleType", rideErrors.vehicleType, showRide)} withIcons />
            <GuideCards id="drive" label="Who will drive?" items={driveCards} value={drive} onChange={setDrive} error={errorFor("drive", rideErrors.drive, showRide)} />
            <GuideChips id="transmission" label="Transmission" labelIcon="gear" options={transmissionOptions} value={transmission} onChange={setTransmission} error={errorFor("transmission", rideErrors.transmission, showRide)} withIcons />
            </div>
          </section>
        ) : null}

        {step === 1 && !isCar ? (
          <section className="hotel-guide-panel" aria-labelledby="bike-step-two-title">
            <StepTitle number="02" id="bike-step-two-title" title={text.stepTwoTitle} text={text.stepTwoText} />
            <div className="tour-guide-stack">
            <GuideChips id="needDriver" label="Do you need a driver?" labelIcon="wheel" options={yesNoOptions} value={needDriver} onChange={setNeedDriver} error={errorFor("needDriver", rideErrors.needDriver, showRide)} />
            {needDriver === "no" ? (
              <>
                <GuideChips id="licence" label="Do you hold a valid two-wheeler licence?" labelIcon="licence" options={yesNoOptions} value={licence} onChange={setLicence} error={errorFor("licence", rideErrors.licence, showRide)} />
                <GuideCards
                  id="riders"
                  label="Who is riding?"
                  items={riderCards}
                  value={riders}
                  onChange={setRiders}
                  error={errorFor("riders", rideErrors.riders, showRide)}
                />
              </>
            ) : null}
            <GuideChips id="bikeType" label="What type of bike are you looking for?" labelIcon="bike" options={bikeTypes} value={bikeType} onChange={setBikeType} error={errorFor("bikeType", rideErrors.bikeType, showRide)} withIcons />
            </div>
          </section>
        ) : null}

        {step === 2 ? (
          <section className="hotel-guide-panel" aria-labelledby={`${kind}-step-three-title`}>
            <StepTitle number="03" id={`${kind}-step-three-title`} title={text.stepThreeTitle} text={text.stepThreeText} />
            <div className="tour-guide-prefs">
              <GuideBudget
                label={text.budgetLabel}
                unit={text.budgetUnit}
                bands={text.bands}
                choice={budgetChoice}
                other={otherBudget}
                error={errorFor("budget", budget.error, showDetails)}
                onChoice={setBudgetChoice}
                onOther={setOtherBudget}
              />
            </div>
            <GuideNote label="What should we look for?" placeholder={text.notePlaceholder} value={message} onChange={setMessage} />
            <FieldMessage message={errorFor("message", detailErrors.message, showDetails)} />
          </section>
        ) : null}

        {step === 3 ? (
          <section className="hotel-guide-panel" aria-labelledby={`${kind}-step-four-title`}>
            <StepTitle number="04" id={`${kind}-step-four-title`} title={text.stepFourTitle} text={text.stepFourText} />
            <div className="hotel-guide-review tour-guide-review">
              <ReviewSection title="Trip details" icon="pin" onEdit={() => setStep(0)}>
                <ReviewLine label="Pickup city" icon="pin" value={destination || "Not provided"} />
                <ReviewLine label="Pickup point" icon="route" value={pickupPoint || "Not provided"} />
                <ReviewLine label="Drop-off" icon="pin" value={dropMode === "other" && dropoffCity ? dropoffCity : "Same city"} />
                <ReviewLine label="Dates" icon="calendar" value={`${prettyDate(start)} – ${prettyDate(end)}${days ? ` · ${plural(days, "day")}` : ""}`} />
                {isCar ? <ReviewLine label="Pickup time" icon="clock" value={pickupTime ? timeLabel(pickupTime) : "Not selected"} /> : null}
                {itemName ? <ReviewLine label={isCar ? "Car" : "Bike"} icon={isCar ? "car" : "bike"} value={itemName} /> : null}
              </ReviewSection>
              {isCar ? (
                <ReviewSection title="Ride preferences" icon="car" onEdit={() => setStep(1)}>
                  <ReviewLine label="Passengers" icon="adults" value={String(passengers)} />
                  <ReviewLine label="Child seats" icon="children" value={childSeats ? String(childSeats) : "None"} />
                  <ReviewLine label="Car type" icon="car" value={optionLabel(carTypes, vehicleType)} />
                  <ReviewLine label="Driver" icon="wheel" value={optionLabel(driveOptions, drive) || "Not selected"} />
                  <ReviewLine label="Transmission" icon="gear" value={optionLabel(transmissionOptions, transmission)} />
                </ReviewSection>
              ) : (
                <ReviewSection title="Bike preferences" icon="bike" onEdit={() => setStep(1)}>
                  <ReviewLine label="Driver" icon="wheel" value={needDriver === "yes" ? "Needed" : needDriver === "no" ? "Not needed" : "Not selected"} />
                  {needDriver === "no" ? (
                    <>
                      <ReviewLine label="Licence" icon="licence" value={licence === "yes" ? "Valid two-wheeler licence" : "No licence"} />
                      <ReviewLine label="Riders" icon="users" value={optionLabel(riderOptions, riders)} />
                    </>
                  ) : null}
                  <ReviewLine label="Bike type" icon="bike" value={optionLabel(bikeTypes, bikeType)} />
                </ReviewSection>
              )}
              <ReviewSection title="Budget & notes" icon="wallet" onEdit={() => setStep(2)}>
                <ReviewLine label="Budget" icon="wallet" value={budgetSummary(text.bands, budget.value, text.budgetUnit)} />
                <ReviewLine label="Note" icon="note" value={message || "None"} />
              </ReviewSection>
            </div>
            <p className="hotel-guide-reassurance">{text.reassurance}</p>
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
      <GuideActions step={step} last={3} formId={formId} busy={pending} submitLabel={text.submit} busyLabel="Sending request…" onBack={() => setStep((step - 1) as StepIndex)} onContinue={() => continueTo((step + 1) as 1 | 2 | 3)} />
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
