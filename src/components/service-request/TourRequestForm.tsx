"use client";

import { useActionState, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import type { FirebaseOptions } from "firebase/app";
import { submitServiceRequest } from "@/actions/service-request";
import { RequestPhoneVerify } from "@/components/auth/RequestPhoneVerify";
import { BackIcon } from "@/components/hotel-request/HotelRequestForm";
import { DateMenu, prettyStayDate } from "@/components/hotel-list/stay-list/HotelStayList";
import { deferGuideStep, GuideProgress, RequestSuccessStep } from "@/components/service-request/guide-ui";
import { SearchableSelect } from "@/components/ui/SearchableSelect";
import { canonicalPhone, formatPhone } from "@/lib/auth/phone";
import {
  budgetChoices,
  isBudgetValue,
  tourCarPreferences,
  tourBudgetBands,
  tourDietaryPreferences,
  tourFoodPreferences,
  tourHotelPreferences,
  tourLengths,
  tourStyles,
  tourTypes,
  yesNoOptions,
  type RequestOption,
} from "@/lib/custom-request";
import { initialFormState } from "@/lib/forms";
import type { ServiceDefaults } from "@/components/service-request/ServiceRequestForm";

const tourFields = [
  "startCity",
  "places",
  "itemName",
  "start",
  "length",
  "datesFlexible",
  "adults",
  "children",
  "style",
  "tourType",
  "needFood",
  "foodPreference",
  "dietaryPreferences",
  "needCar",
  "carPreference",
  "needHotel",
  "hotelPreference",
  "budget",
  "message",
  "phone",
] as const;

const glyphs: Record<string, string> = {
  pin: "M12 21s7-5.2 7-11a7 7 0 1 0-14 0c0 5.8 7 11 7 11zM12 12.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z",
  calendar: "M7 3v3M17 3v3M4 8h16M5 5h14a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1z",
  hotel: "M4 21V5a1 1 0 0 1 1-1h9a1 1 0 0 1 1 1v16M15 10h4a1 1 0 0 1 1 1v10M3 21h18M8 8h3M8 12h3M8 16h3",
  adults: "M12 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7zM5 21a7 7 0 0 1 14 0",
  children: "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM8.5 14a4 4 0 0 0 7 0M9 9.5h.01M15 9.5h.01",
  note: "M5 4h14a1 1 0 0 1 1 1v14l-4-4H5a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1zM8 8h8M8 11h5",
  journey: "M3 17l6-6 4 4 8-9M15 6h6v6",
  any: "M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.2 2.2m8.4 8.4 2.2 2.2m0-12.8-2.2 2.2m-8.4 8.4-2.2 2.2",
  religious: "M12 3v18M6 9h12",
  honeymoon: "M20.8 8.8c0 5.2-8.8 11-8.8 11s-8.8-5.8-8.8-11a4.8 4.8 0 0 1 8.8-2.6 4.8 4.8 0 0 1 8.8 2.6z",
  adventure: "m3 20 7-14 4 8 3-5 4 11H3z",
  family: "M9 10a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM17 11a2.5 2.5 0 1 0 0-5M3 20a6 6 0 0 1 12 0M15 15a5 5 0 0 1 6 5",
  culture: "M3 21h18M5 21V10h14v11M3 10l9-7 9 7M9 14v3M15 14v3",
  nature: "M12 21V11m0 4c-5 0-8-3-8-8 5 0 8 3 8 8zm0-4c0-5 3-8 8-8 0 5-3 8-8 8z",
  leisure: "M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6 7 7m10 10 1.4 1.4m0-12.8L17 7M7 17l-1.4 1.4M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0z",
  leaf: "M20 4c-9 0-15 4-15 11a5 5 0 0 0 5 5c7 0 11-7 10-16zM5 20l9-9",
  plate: "M4 3v7M7 3v7M4 7h3M5.5 10v11M14 3v8h5V3M16.5 11v10",
  food: "M4 3v7M7 3v7M4 7h3M5.5 10v11M14 3v8h5V3M16.5 11v10",
  wallet: "M4 7a2 2 0 0 1 2-2h12v3M4 7v10a2 2 0 0 0 2 2h13a1 1 0 0 0 1-1V9a1 1 0 0 0-1-1H6a2 2 0 0 1-2-1zM16 13.5h.01",
  breakfast: "M4 9h12v6a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4V9zM16 10h2a2 2 0 0 1 0 4h-2M7 3v2M11 3v2",
  lunch: "M3 13h18M5 13a7 7 0 0 1 14 0M5 13v5h14v-5M8 18v2M16 18v2",
  dinner: "M12 3v3M5.6 5.6l2.1 2.1M3 12h3M18 12h3M16.3 7.7l2.1-2.1M5 21a7 7 0 0 1 14 0M8 17h8",
  crescent: "M20 15.5A8.5 8.5 0 0 1 8.5 4 8.5 8.5 0 1 0 20 15.5z",
  car: "M5 17h14l1-6-2-5H6l-2 5 1 6zM4 11h16M7 17v2M17 17v2M7 14h.01M17 14h.01",
  suv: "M3 16h18l-1-7-3-3H7L4 9l-1 7zM3 11h18M6 16v2M18 16v2M7 12h.01M17 12h.01",
  van: "M3 7h12v10H3zM15 10h4l3 3v4h-7zM6 17a2 2 0 1 0 4 0M16 17a2 2 0 1 0 4 0",
  star: "m12 3 2.7 5.5 6.1.9-4.4 4.3 1 6.1-5.4-2.9-5.4 2.9 1-6.1-4.4-4.3 6.1-.9L12 3z",
  houseboat: "M3 14h18l-2 5H5l-2-5zM6 14V8h12v6M9 8V5h6v3M12 2v3",
  no: "M5 5l14 14M19 5 5 19",
};

const optionIcons: Record<string, string> = {
  any: "any",
  religious: "religious",
  honeymoon: "honeymoon",
  adventure: "adventure",
  family: "family",
  culture: "culture",
  nature: "nature",
  leisure: "leisure",
  vegetarian: "leaf",
  vegan: "leaf",
  jain: "plate",
  halal: "crescent",
  "non-vegetarian": "plate",
  sedan: "car",
  suv: "suv",
  muv: "van",
  luxury: "star",
  none: "no",
  budget: "hotel",
  comfortable: "hotel",
  "3-star": "star",
  "4-star": "star",
  "5-star": "star",
  houseboat: "houseboat",
  breakfast: "breakfast",
  lunch: "lunch",
  dinner: "dinner",
};

function Glyph({ name }: { name: string }) {
  const path = glyphs[name];
  return path ? <svg className="hg-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={path} /></svg> : null;
}

function todayIso() {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function clampCount(value: string | undefined, fallback: string, min: number, max: number) {
  const parsed = Number(value && /^\d+$/.test(value) ? value : fallback);
  return Number.isFinite(parsed) ? Math.min(max, Math.max(min, Math.round(parsed))) : min;
}

function prettyDate(iso: string) {
  if (!iso) return "Not selected";
  return new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric" }).format(new Date(`${iso}T00:00:00`));
}

function focusErrorField(fields?: Record<string, string>) {
  const key = tourFields.find((name) => fields?.[name]);
  const target = key
    ? document.getElementById(key === "phone" ? "phone-entry-field" : `${key}-field`) ?? document.getElementById(`tour-${key}`) ?? document.getElementById(key)
    : null;
  if (!(target instanceof HTMLElement)) return;
  target.scrollIntoView({ behavior: "smooth", block: "center" });
  const input = target.matches("input, textarea, select") ? target : target.querySelector("input:not([type=hidden]), textarea, select, button");
  if (input instanceof HTMLElement) input.focus({ preventScroll: true });
}

function count(value: number, unit: string) {
  const plural = unit === "child" ? "children" : `${unit}s`;
  return `${value} ${value === 1 ? unit : plural}`;
}

function parseSelectionList(value: string | undefined, options: readonly RequestOption[]) {
  const allowed = new Set(options.map((option) => option.value));
  try {
    const parsed: unknown = JSON.parse(value || "[]");
    if (Array.isArray(parsed)) {
      const selected = [...new Set(parsed.filter((item): item is string => typeof item === "string" && allowed.has(item)))];
      return selected.includes("any") ? ["any"] : selected;
    }
  } catch {
    if (value && allowed.has(value)) return [value];
  }
  return [];
}

export function TourRequestForm({
  customer,
  defaults,
  loginHref: _loginHref,
  locations,
  firebaseConfig = null,
  defaultCountry = "IN",
}: {
  customer: { name: string; email: string; phone: string } | null;
  defaults: ServiceDefaults;
  loginHref: string;
  locations: string[];
  firebaseConfig?: FirebaseOptions | null;
  defaultCountry?: string;
}) {
  const router = useRouter();
  const [state, action, pending] = useActionState(submitServiceRequest, initialFormState);
  const [submittedInThisVisit, setSubmittedInThisVisit] = useState(false);
  const [verifyOpen, setVerifyOpen] = useState(false);
  const [step, setStep] = useState<0 | 1 | 2 | 3 | 4>(0);
  const [stepOneTouched, setStepOneTouched] = useState(false);
  const [stepTwoTouched, setStepTwoTouched] = useState(false);
  const [stepThreeTouched, setStepThreeTouched] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const verifiedRef = useRef(Boolean(customer));
  const initialStartCity = state.values?.startCity || defaults.startCity;
  const [startLocation, setStartLocation] = useState(locations.includes(initialStartCity) ? initialStartCity : "");
  const startCity = locations.includes(startLocation) ? startLocation : "";
  const [places, setPlaces] = useState(state.values?.places || defaults.places);
  const [itemName, setItemName] = useState(state.values?.itemName || defaults.itemName);
  const [start, setStart] = useState(state.values?.start || defaults.start);
  const [length, setLength] = useState(state.values?.length || defaults.length);
  const [adults, setAdults] = useState(clampCount(state.values?.adults, defaults.adults, 1, 20));
  const [children, setChildren] = useState(clampCount(state.values?.children, defaults.children, 0, 12));
  const [style, setStyle] = useState(state.values?.style || defaults.style);
  const [tourType, setTourType] = useState(state.values?.tourType || defaults.tourType || "any");
  const [needFood, setNeedFood] = useState(state.values?.needFood || defaults.needFood || "no");
  const [foodPreference, setFoodPreference] = useState(() => parseSelectionList(state.values?.foodPreference || defaults.foodPreference, tourFoodPreferences));
  const [dietaryPreferences, setDietaryPreferences] = useState(() => parseSelectionList(state.values?.dietaryPreferences || defaults.dietaryPreferences, tourDietaryPreferences));
  const [needCar, setNeedCar] = useState(state.values?.needCar || defaults.needCar || "no");
  const [carPreference, setCarPreference] = useState(state.values?.carPreference || defaults.carPreference || "any");
  const [needHotel, setNeedHotel] = useState(state.values?.needHotel || defaults.needHotel || "no");
  const [hotelPreference, setHotelPreference] = useState(() => parseSelectionList(state.values?.hotelPreference || defaults.hotelPreference, tourHotelPreferences));
  const [datesFlexible, setDatesFlexible] = useState(state.values?.datesFlexible || defaults.datesFlexible || "no");
  const [budgetChoice, setBudgetChoice] = useState(state.values?.budget || defaults.budget || "");
  const [otherBudget, setOtherBudget] = useState("");
  const [message, setMessage] = useState(state.values?.message || defaults.message);
  const [guestName, setGuestName] = useState(state.values?.name || customer?.name || "");
  const [phone, setPhone] = useState(state.values?.phone || customer?.phone || "");
  const [contactTouched, setContactTouched] = useState(false);
  const firstStep = useRef(true);
  const today = todayIso();
  const locationOptions = useMemo(
    () => locations.map((location) => ({ value: location, label: location })),
    [locations],
  );

  const budgetValues = useMemo(() => new Set(budgetChoices(tourBudgetBands).map((option) => option.value)), []);
  const isCustomBudget = budgetChoice === "other" || (Boolean(budgetChoice) && !budgetValues.has(budgetChoice));
  const customAmount = budgetChoice === "other" ? otherBudget.replace(/\D/g, "") : isCustomBudget ? budgetChoice : "";
  const budgetValue = isCustomBudget ? customAmount : budgetChoice;
  const budgetError = isCustomBudget && !isBudgetValue(tourBudgetBands, budgetValue)
    ? customAmount ? "Enter an amount from ₹100 to ₹5,00,000." : "Enter a budget or choose a range."
    : undefined;

  const stepOneErrors = useMemo(() => {
    const errors: Record<string, string> = {};
    if (!startCity) errors.startCity = "Choose a starting location.";
    if (places.trim().length < 2) errors.places = "Add at least one place to cover.";
    if (!start) errors.start = "Choose your preferred start date.";
    else if (start < today) errors.start = "Choose today or a future date.";
    if (!tourLengths.some((option) => option.value === length)) errors.length = "Choose the trip length.";
    return errors;
  }, [length, places, start, startCity, today]);
  const stepTwoErrors = useMemo(() => {
    const errors: Record<string, string> = {};
    if (adults < 1 || adults > 20) errors.adults = "Choose 1 to 20 adults.";
    if (children < 0 || children > 12) errors.children = "Choose 0 to 12 children.";
    if (!tourStyles.some((option) => option.value === style)) errors.style = "Choose a group or private tour.";
    if (!tourTypes.some((option) => option.value === tourType)) errors.tourType = "Choose a trip type.";
    return errors;
  }, [adults, children, style, tourType]);
  const stepThreeValid = !budgetError && message.length <= 2000 && (needFood !== "yes" || foodPreference.length > 0) && (needHotel !== "yes" || hotelPreference.length > 0);
  const foodPreferenceError = stepThreeTouched && needFood === "yes" && foodPreference.length === 0 ? "Choose at least one meal." : undefined;
  const hotelPreferenceError = stepThreeTouched && needHotel === "yes" && hotelPreference.length === 0 ? "Choose at least one hotel preference." : undefined;

  const successReference = submittedInThisVisit && !pending && state.reference && !state.error ? state.reference : "";

  useEffect(() => {
    if (successReference) setStep(4);
  }, [successReference]);

  useEffect(() => {
    if (!state.error) return;
    const fields = state.fields ?? {};
    const invalidStep = ["startCity", "places", "itemName", "start", "length"].some((field) => fields[field])
      ? 0
      : ["adults", "children", "style", "tourType"].some((field) => fields[field])
        ? 1
        : ["budget", "message", "needFood", "foodPreference", "dietaryPreferences", "needCar", "carPreference", "needHotel", "hotelPreference"].some((field) => fields[field])
          ? 2
          : fields.phone ? 3 : null;
    const frame = window.requestAnimationFrame(() => {
      if (invalidStep !== null) setStep(invalidStep);
      focusErrorField(fields);
    });
    return () => window.cancelAnimationFrame(frame);
  }, [state]);

  useEffect(() => {
    if (firstStep.current) {
      firstStep.current = false;
      return;
    }
    const card = document.getElementById("tour-request-pass");
    if (!card) return;
    const top = card.getBoundingClientRect().top + window.scrollY - 80;
    window.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
  }, [step]);

  function errorFor(name: string, clientError?: string, touched = false) {
    return state.fields?.[name] || (touched ? clientError : undefined);
  }

  function continueTo(next: 1 | 2 | 3) {
    if (step === 0) {
      setStepOneTouched(true);
      if (Object.keys(stepOneErrors).length) return;
    }
    if (step === 1) {
      setStepTwoTouched(true);
      if (Object.keys(stepTwoErrors).length) return;
    }
    if (step === 2) {
      setStepThreeTouched(true);
      if (!stepThreeValid) return;
    }
    deferGuideStep(() => setStep(next));
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    if (step < 3) {
      event.preventDefault();
      return;
    }
    if (pending) {
      event.preventDefault();
      return;
    }
    if (Object.keys(stepOneErrors).length) {
      event.preventDefault();
      setStep(0);
      setStepOneTouched(true);
      return;
    }
    if (Object.keys(stepTwoErrors).length) {
      event.preventDefault();
      setStep(1);
      setStepTwoTouched(true);
      return;
    }
    if (!stepThreeValid) {
      event.preventDefault();
      setStep(2);
      setStepThreeTouched(true);
      return;
    }
    if (!customer && !verifiedRef.current) {
      event.preventDefault();
      setStep(3);
      setContactTouched(true);
      if (guestName.trim().length < 2 || !canonicalPhone(phone)) return;
      setVerifyOpen(true);
      return;
    }
    if (customer && !customer.phone && phone.replace(/\D/g, "").length < 8) {
      event.preventDefault();
      setStep(3);
      setContactTouched(true);
      return;
    }
    setSubmittedInThisVisit(true);
  }

  const nameError = !customer && contactTouched && guestName.trim().length < 2 ? "Enter your name." : undefined;
  const phoneError = !contactTouched
    ? undefined
    : !customer
      ? (!canonicalPhone(phone) ? "Enter a phone number with country code." : undefined)
      : (!customer.phone && phone.replace(/\D/g, "").length < 8 ? "Enter a phone number with country code." : undefined);

  return (
    <div className="hotel-request-card hotel-guide-card tour-guide-card" id="tour-request-pass">
      <button type="button" className="hotel-request-back" onClick={() => (window.history.length > 1 ? router.back() : router.push("/tours"))}>
        <BackIcon />Back
      </button>
      <div className="hotel-guide-heading">
        <p className="hotel-guide-kicker">PERSONAL TOUR CONCIERGE</p>
        <h1>Plan a trip that feels like yours.</h1>
        <p>Tell us what you have in mind and our local team will shape the journey around you.</p>
      </div>
      <GuideProgress
        label="Tour"
        labels={["Trip details", "Travellers", "Trip preferences", "Review", "Submitted"]}
        step={step}
        onSelect={(next) => next < step && step < 4 && setStep(next as 0 | 1 | 2 | 3 | 4)}
      />
      {step === 4 && successReference ? (
        <RequestSuccessStep reference={successReference} exploreHref="/tours" detail="Nothing is booked until you accept the trip." />
      ) : (
      <>
      <form ref={formRef} id="tour-request-form" action={action} noValidate className="hotel-request-form hotel-guide-form" onSubmit={handleSubmit}>
        <input type="hidden" name="kind" value="tour" />
        <input type="hidden" name="startCity" value={startCity} />
        <input type="hidden" name="places" value={places} />
        <input type="hidden" name="itemName" value={itemName} />
        <input type="hidden" name="start" value={start} />
        <input type="hidden" name="length" value={length} />
        <input type="hidden" name="adults" value={adults} />
        <input type="hidden" name="children" value={children} />
        <input type="hidden" name="style" value={style} />
        <input type="hidden" name="tourType" value={tourType} />
        <input type="hidden" name="needFood" value={needFood} />
        <input type="hidden" name="foodPreference" value={needFood === "yes" ? JSON.stringify(foodPreference) : "[]"} />
        <input type="hidden" name="dietaryPreferences" value={needFood === "yes" ? JSON.stringify(dietaryPreferences) : "[]"} />
        <input type="hidden" name="needCar" value={needCar} />
        <input type="hidden" name="carPreference" value={needCar === "yes" ? carPreference : "any"} />
        <input type="hidden" name="needHotel" value={needHotel} />
        <input type="hidden" name="hotelPreference" value={needHotel === "yes" ? JSON.stringify(hotelPreference) : "[]"} />
        <input type="hidden" name="datesFlexible" value={datesFlexible} />
        <input type="hidden" name="budget" value={budgetValue} />
        <input type="hidden" name="message" value={message} />
        <input type="hidden" name="name" value={customer?.name || guestName} />
        <input type="hidden" name="phone" value={phone} />
        {state.error ? <p className="hotel-request-banner-alert hotel-guide-alert" role="alert">{state.fields ? "Please check the highlighted details." : state.error}</p> : null}

        {step === 0 ? (
          <section className="hotel-guide-panel" aria-labelledby="tour-step-one-title">
            <div className="hotel-guide-step-title"><span>01</span><div><h2 id="tour-step-one-title">Where and when would you like to travel?</h2><p>Add your starting point, places to visit, trip length and preferred dates.</p></div></div>
            <div className="hotel-guide-grid">
              <LocationField
                value={startCity}
                options={locationOptions}
                error={errorFor("startCity", stepOneErrors.startCity, stepOneTouched)}
                onChange={setStartLocation}
              />
              <TourField label="Places to cover" icon="journey" name="places" placeholder="Sonamarg, Gulmarg, Pahalgam" value={places} onChange={setPlaces} error={errorFor("places", stepOneErrors.places, stepOneTouched)} />
              <TourField label="Tour name (optional)" icon="journey" name="itemName" placeholder="A tour or experience you have in mind" value={itemName} onChange={setItemName} />
              <TourDateField label="Preferred start date" name="start" value={start} min={today} error={errorFor("start", stepOneErrors.start, stepOneTouched)} onPick={setStart} />
            </div>
            <div className="tour-guide-section">
              <ChoiceGroup id="length-field" label="How long would you like to travel?" options={tourLengths} value={length} onChange={setLength} error={errorFor("length", stepOneErrors.length, stepOneTouched)} variant="chips" />
              <ChoiceGroup id="datesFlexible-field" label="Can your dates move?" options={yesNoOptions} value={datesFlexible} onChange={setDatesFlexible} variant="chips" />
            </div>
          </section>
        ) : null}

        {step === 1 ? (
          <section className="hotel-guide-panel" aria-labelledby="tour-step-two-title">
            <div className="hotel-guide-step-title"><span>02</span><div><h2 id="tour-step-two-title">Who’s travelling, and what kind of tour?</h2><p>Set your group size, tour style and the kind of experience you want.</p></div></div>
              <div className="hotel-guide-travellers tour-guide-travellers">
              <GuestCounter label="Adults" icon="adults" value={adults} min={1} max={20} error={errorFor("adults", stepTwoErrors.adults, stepTwoTouched)} onChange={setAdults} />
              <GuestCounter label="Children" icon="children" value={children} min={0} max={12} error={errorFor("children", stepTwoErrors.children, stepTwoTouched)} onChange={setChildren} />
            </div>
            <fieldset id="style-field" className="hotel-guide-choice-group tour-guide-choice-group">
              <legend>Choose your tour style</legend>
              <div className="hotel-guide-style-grid tour-guide-style-grid">
                {tourStyles.map((option) => <ChoiceCard key={option.value} selected={style === option.value} icon={option.value === "group" ? "family" : option.value === "private" ? "pin" : "any"} title={option.label} description={option.value === "group" ? "Share the experience with other travellers" : option.value === "private" ? "A flexible itinerary just for your group" : "Recommend the best fit for my trip"} onClick={() => setStyle(option.value)} />)}
              </div>
              {errorFor("style", stepTwoErrors.style, stepTwoTouched) ? <FieldMessage message={errorFor("style", stepTwoErrors.style, stepTwoTouched)} /> : null}
            </fieldset>
            <ChoiceGroup id="tourType-field" label="What type of tour are you looking for?" labelIcon="journey" options={tourTypes} value={tourType} onChange={setTourType} error={errorFor("tourType", stepTwoErrors.tourType, stepTwoTouched)} variant="chips" withIcons />
          </section>
        ) : null}

        {step === 2 ? (
          <section className="hotel-guide-panel" aria-labelledby="tour-step-three-title">
            <div className="hotel-guide-step-title"><span>03</span><div><h2 id="tour-step-three-title">What should we arrange for your trip?</h2><p>Set a per-person budget and choose whether you need meals, a car or a hotel.</p></div></div>
            <div className="tour-guide-prefs">
              <div className="tour-guide-pref-card" id="budget-field">
                <label htmlFor="tour-budget-choice" className="tour-guide-pref-title"><Glyph name="wallet" />Budget per person <span>(INR)</span></label>
                {isCustomBudget ? (
                  <div className="hotel-request-control hotel-guide-custom-destination-input">
                    <input id="tour-budget-choice" inputMode="numeric" autoComplete="off" aria-label="Budget per person" placeholder="Enter amount in rupees" value={customAmount} onChange={(event) => { setBudgetChoice("other"); setOtherBudget(event.target.value.replace(/\D/g, "")); setStepThreeTouched(true); }} aria-invalid={Boolean(budgetError)} aria-describedby={budgetError ? "tour-budget-error" : undefined} />
                    <button type="button" className="hotel-guide-custom-destination" onClick={() => { setBudgetChoice(""); setOtherBudget(""); }}>Choose a range</button>
                  </div>
                ) : (
                  <SearchableSelect
                    id="tour-budget-choice"
                    value={budgetChoice}
                    options={[
                      ...tourBudgetBands.map(({ value, label }) => ({ value, label })),
                      { value: "other", label: "+ Enter a custom amount", action: true },
                    ]}
                    emptyLabel="Flexible budget"
                    ariaLabel="Budget per person"
                    searchPlaceholder="Search budget ranges"
                    className="hotel-guide-select-trigger"
                    menuClassName="hotel-guide-select-menu"
                    onChange={(value) => setBudgetChoice(value)}
                  />
                )}
                <input type="hidden" name="budget-choice" value={budgetValue} />
                <FieldMessage id="tour-budget-error" message={stepThreeTouched ? budgetError : undefined} />
              </div>
              <PrefToggle icon="food" label="Need food arranged?" value={needFood} onChange={setNeedFood}>
                <MultiChoiceGroup id="foodPreference-field" label="Choose meals" labelIcon="food" options={tourFoodPreferences} values={foodPreference} onChange={setFoodPreference} error={state.fields?.foodPreference || foodPreferenceError} />
                <MultiChoiceGroup id="dietaryPreferences-field" label="Dietary preference" labelIcon="leaf" options={tourDietaryPreferences} values={dietaryPreferences} onChange={setDietaryPreferences} />
              </PrefToggle>
              <PrefToggle icon="car" label="Need a car?" value={needCar} onChange={setNeedCar}>
                <ChoiceGroup label="Car preference" labelIcon="car" options={tourCarPreferences.filter((option) => option.value !== "none")} value={carPreference} onChange={setCarPreference} variant="chips" withIcons />
              </PrefToggle>
              <PrefToggle icon="hotel" label="Need a hotel?" value={needHotel} onChange={setNeedHotel}>
                <MultiChoiceGroup id="hotelPreference-field" label="Hotel preferences" labelIcon="hotel" options={tourHotelPreferences} values={hotelPreference} onChange={setHotelPreference} error={state.fields?.hotelPreference || hotelPreferenceError} />
              </PrefToggle>
            </div>
            <div className="tour-guide-note" id="message-field">
              <label htmlFor="tour-message" className="tour-guide-pref-title"><Glyph name="note" />Anything else we should know? <span>(optional)</span></label>
              <textarea id="tour-message" rows={3} maxLength={2000} value={message} onChange={(event) => setMessage(event.target.value)} placeholder="Pace, interests, accessibility needs or travelling with family" aria-describedby="tour-message-count" />
              <span className="tour-guide-character-count" id="tour-message-count">{message.length}/2000</span>
            </div>
          </section>
        ) : null}

        {step === 3 ? (
          <section className="hotel-guide-panel" aria-labelledby="tour-step-four-title">
            <div className="hotel-guide-step-title"><span>04</span><div><h2 id="tour-step-four-title">Review your tour request</h2><p>Check your itinerary, group and preferences before sending.</p></div></div>
            <div className="hotel-guide-review tour-guide-review">
              <ReviewSection title="Trip details" icon="pin" onEdit={() => setStep(0)}>
                <ReviewLine label="Starting from" value={startCity || "Not provided"} />
                <ReviewLine label="Places" value={places || "Not provided"} />
                {itemName ? <ReviewLine label="Tour" value={itemName} /> : null}
                <ReviewLine label="Date and length" value={`${prettyDate(start)} · ${tourLengths.find((option) => option.value === length)?.label || "Not selected"}`} />
                <ReviewLine label="Date flexibility" value={datesFlexible === "yes" ? "Dates can move" : "Fixed dates"} />
              </ReviewSection>
              <ReviewSection title="Travellers & style" icon="adults" onEdit={() => setStep(1)}>
                <ReviewLine label="Travellers" value={`${count(adults, "adult")} · ${count(children, "child")}`} />
                <ReviewLine label="Style" value={tourStyles.find((option) => option.value === style)?.label || "Not selected"} />
                <ReviewLine label="Tour type" value={tourTypes.find((option) => option.value === tourType)?.label || "Any"} />
              </ReviewSection>
              <ReviewSection title="Budget & notes" icon="journey" onEdit={() => setStep(2)}>
                <ReviewLine label="Budget" value={budgetValue && budgetValue !== "other" ? tourBudgetBands.find((band) => band.value === budgetValue)?.label || `₹${Number(budgetValue).toLocaleString("en-IN")} per person` : "Flexible budget"} />
                <ReviewLine label="Meals" value={needFood === "yes" ? tourFoodPreferences.filter((option) => foodPreference.includes(option.value)).map((option) => option.label).join(", ") || "Choose meals" : "Not needed"} />
                <ReviewLine label="Dietary preference" value={needFood === "yes" ? tourDietaryPreferences.filter((option) => dietaryPreferences.includes(option.value)).map((option) => option.label).join(", ") || "Any" : "Not needed"} />
                <ReviewLine label="Car" value={needCar === "yes" ? tourCarPreferences.find((option) => option.value === carPreference)?.label || "Any" : "Not needed"} />
                <ReviewLine label="Hotel" value={needHotel === "yes" ? tourHotelPreferences.filter((option) => hotelPreference.includes(option.value)).map((option) => option.label).join(", ") || "Choose preferences" : "Not needed"} />
                <ReviewLine label="Note" value={message || "None"} />
              </ReviewSection>
            </div>
            <p className="hotel-guide-reassurance">Our travel team will review your request and contact you with a suitable itinerary and quote. No seats are held until confirmed.</p>
            {customer ? (
              <div className="hotel-guide-contact-summary">
                <span>Requesting as <strong>{customer.name}</strong></span>
                {customer.phone ? <span>{formatPhone(customer.phone) || customer.phone}</span> : <TourField label="Phone number" name="phone-entry" placeholder="+91 98765 43210" value={phone} onChange={(value) => { setPhone(value); setContactTouched(true); }} error={phoneError} />}
              </div>
            ) : (
              <div className="hotel-guide-guest-contact">
                <p className="hotel-guide-login-note">Add your name and mobile number. We’ll text a code to this number when you submit.</p>
                <div className="hotel-guide-grid">
                  <TourField label="Your name" name="guest-name" placeholder="Full name" value={guestName} onChange={(value) => { setGuestName(value); setContactTouched(true); }} error={nameError} />
                  <TourField label="Contact number" name="phone-entry" placeholder="+91 98765 43210" value={phone} onChange={(value) => { setPhone(value); setContactTouched(true); }} error={phoneError} />
                </div>
              </div>
            )}
          </section>
        ) : null}

      </form>
      <div className="hotel-guide-actions">
        {step > 0 ? <button type="button" className="hotel-guide-back" onClick={() => setStep((step - 1) as 0 | 1 | 2 | 3)}>Back</button> : <span className="hotel-guide-secure"><span aria-hidden="true">✦</span> Free, no-obligation request</span>}
        {step < 3 ? (
          <div className="hotel-guide-action-right">
            <button type="button" className="hotel-guide-primary" onClick={(event) => { event.preventDefault(); event.stopPropagation(); continueTo((step + 1) as 1 | 2 | 3); }}>Continue <span aria-hidden="true">→</span></button>
          </div>
        ) : (
          <div className="hotel-guide-submit-group">
            <button type="submit" form="tour-request-form" className="hotel-guide-primary" disabled={pending}>{pending ? "Sending request…" : "Submit tour request"}</button>
          </div>
        )}
      </div>
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

function GuestCounter({ label, icon, value, min, max, error, onChange }: { label: string; icon: string; value: number; min: number; max: number; error?: string; onChange: (value: number) => void }) {
  return <div id={`${label.toLowerCase()}-field`} className={`hotel-guide-counter${error ? " is-invalid" : ""}`}><div className="hotel-guide-counter-label"><span><strong className="has-icon"><Glyph name={icon} />{label}</strong><small>{label === "Adults" ? "Ages 12+" : "Ages 0–17"}</small></span></div><div className="hotel-guide-counter-control" role="group" aria-label={label}><button type="button" aria-label={`Remove one ${label.toLowerCase()}`} disabled={value <= min} onClick={() => onChange(value - 1)}>−</button><output aria-live="polite">{value}</output><button type="button" aria-label={`Add one ${label.toLowerCase()}`} disabled={value >= max} onClick={() => onChange(value + 1)}>+</button></div>{error ? <FieldMessage message={error} /> : null}</div>;
}

function TourDateField({ label, name, value, min, error, onPick }: { label: string; name: string; value: string; min: string; error?: string; onPick: (iso: string) => void }) {
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState<{ top?: number; bottom?: number; left: number } | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const place = () => {
      const rect = ref.current?.getBoundingClientRect();
      if (!rect) return;
      const width = 292;
      const height = 350;
      const flip = rect.bottom + 8 + height > window.innerHeight && rect.top - height - 8 > 0;
      const left = Math.max(8, Math.min(rect.left, window.innerWidth - width - 8));
      setPosition(flip ? { bottom: window.innerHeight - rect.top + 8, left } : { top: rect.bottom + 8, left });
    };
    place();
    window.addEventListener("resize", place);
    window.addEventListener("scroll", place, true);
    const closeOutside = (event: PointerEvent) => {
      if (event.target instanceof Element && event.target.closest("[data-picker]")) return;
      setOpen(false);
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", closeOutside);
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      window.removeEventListener("resize", place);
      window.removeEventListener("scroll", place, true);
      document.removeEventListener("pointerdown", closeOutside);
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [open]);

  return (
    <div id={`${name}-field`} className="hotel-guide-field hotel-guide-date-field">
      <label htmlFor={`tour-${name}`} className="has-icon"><Glyph name="calendar" />{label}</label>
      <div ref={ref} className={`stay-list hr-stay-date mt-5${error ? " is-invalid" : ""}`} data-picker>
        <div className="sl-field">
          <button id={`tour-${name}`} className="sl-who" type="button" aria-haspopup="dialog" aria-expanded={open} aria-describedby={error ? `${name}-error` : undefined} onClick={() => setOpen((current) => !current)}>
            <strong>{value ? prettyStayDate(value) : "Select date"}</strong>
          </button>
          {open && position ? createPortal(
            <div className="stay-list hr-cal-pop" style={{ top: position.top, bottom: position.bottom, left: position.left }} data-picker>
              <DateMenu label={label} value={value || min} min={min} onClose={() => setOpen(false)} onPick={(iso) => { onPick(iso); setOpen(false); }} />
            </div>,
            document.body,
          ) : null}
        </div>
      </div>
      <FieldMessage id={`${name}-error`} message={error} />
    </div>
  );
}

function LocationField({
  value,
  options,
  error,
  onChange,
}: {
  value: string;
  options: readonly { value: string; label: string; action?: boolean }[];
  error?: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="hotel-guide-field hotel-guide-destination-field" id="startCity-field">
      <label htmlFor="tour-start-location" className="has-icon"><Glyph name="pin" />Starting from (Location)</label>
      <SearchableSelect
        id="tour-start-location"
        value={value}
        options={options}
        emptyLabel="Choose a starting location"
        placeholder="Search locations"
        searchPlaceholder="Search locations"
        ariaLabel="Starting from location"
        invalid={Boolean(error)}
        describedBy={error ? "tour-start-location-error" : undefined}
        className="hotel-guide-select-trigger"
        menuClassName="hotel-guide-select-menu"
        onChange={onChange}
      />
      <FieldMessage id="tour-start-location-error" message={error} />
    </div>
  );
}

function TourField({ label, icon, name, type = "text", placeholder, value, onChange, error, min }: { label: string; icon?: string; name: string; type?: string; placeholder?: string; value: string; onChange: (value: string) => void; error?: string; min?: string }) {
  const id = name === "phone-entry" ? "tour-phone" : `tour-${name}`;
  const errorId = `${id}-error`;
  return <div className={`hotel-guide-field${type === "date" ? " hotel-guide-date-field" : ""}`} id={`${name}-field`}><label htmlFor={id} className={icon ? "has-icon" : undefined}>{icon ? <Glyph name={icon} /> : null}{label}</label><div className={`hotel-request-control mt-5${error ? " is-invalid" : ""}`}><input id={id} type={type} placeholder={placeholder} min={min} value={value} onChange={(event) => onChange(event.target.value)} aria-invalid={error ? true : undefined} aria-describedby={error ? errorId : undefined} /></div><FieldMessage id={errorId} message={error} /></div>;
}

function ChoiceGroup({ id, label, labelIcon, options, value, onChange, error, variant = "cards", withIcons = false }: { id?: string; label: string; labelIcon?: string; options: readonly RequestOption[]; value: string; onChange: (value: string) => void; error?: string; variant?: "cards" | "chips"; withIcons?: boolean }) {
  return <fieldset id={id} className={`hotel-guide-choice-group tour-guide-choice-group${variant === "chips" ? " is-chips" : ""}`}><legend>{labelIcon ? <Glyph name={labelIcon} /> : null}{label}</legend><div className={variant === "chips" ? "hotel-guide-chip-grid" : "hotel-guide-style-grid"}>{options.map((option) => <button key={option.value} type="button" className={variant === "chips" ? (value === option.value ? "is-selected" : "") : `hotel-guide-style-card${value === option.value ? " is-selected" : ""}`} aria-pressed={value === option.value} onClick={() => onChange(option.value)}>{variant === "cards" ? <><span className="hotel-guide-radio" aria-hidden="true">{value === option.value ? "✓" : ""}</span><strong>{option.label}</strong></> : <>{withIcons ? <Glyph name={optionIcons[option.value] || "any"} /> : null}{option.label}</>}</button>)}</div>{error ? <FieldMessage message={error} /> : null}</fieldset>;
}

function PrefToggle({ icon, label, value, onChange, children }: { icon: string; label: string; value: string; onChange: (value: string) => void; children: React.ReactNode }) {
  return (
    <div className="tour-guide-pref-card">
      <div className="tour-guide-pref-head">
        <span className="tour-guide-pref-title"><Glyph name={icon} />{label}</span>
        <div className="tour-guide-yesno" role="group" aria-label={label}>
          {yesNoOptions.map((option) => <button key={option.value} type="button" className={value === option.value ? "is-selected" : ""} aria-pressed={value === option.value} onClick={() => onChange(option.value)}>{option.label}</button>)}
        </div>
      </div>
      {value === "yes" ? <div className="tour-guide-pref-detail">{children}</div> : null}
    </div>
  );
}

function MultiChoiceGroup({ id, label, labelIcon, options, values, onChange, error }: { id: string; label: string; labelIcon: string; options: readonly RequestOption[]; values: string[]; onChange: (values: string[]) => void; error?: string }) {
  function toggle(value: string) {
    if (value === "any") {
      onChange(values.includes("any") ? [] : ["any"]);
      return;
    }
    const selected = values.filter((item) => item !== "any");
    onChange(selected.includes(value) ? selected.filter((item) => item !== value) : [...selected, value]);
  }

  return (
    <fieldset id={id} className="hotel-guide-choice-group tour-guide-choice-group is-chips">
      <legend><Glyph name={labelIcon} />{label} <span>Select all that apply</span></legend>
      <div className="hotel-guide-chip-grid">
        {options.map((option) => (
          <button key={option.value} type="button" className={values.includes(option.value) ? "is-selected" : ""} aria-pressed={values.includes(option.value)} onClick={() => toggle(option.value)}>
            <Glyph name={optionIcons[option.value] || "any"} />{option.label}
          </button>
        ))}
      </div>
      {error ? <FieldMessage message={error} /> : null}
    </fieldset>
  );
}

function ChoiceCard({ selected, icon, title, description, onClick }: { selected: boolean; icon: string; title: string; description: string; onClick: () => void }) {
  return <button type="button" className={`hotel-guide-style-card${selected ? " is-selected" : ""}`} aria-pressed={selected} onClick={onClick}><span className="hotel-guide-radio" aria-hidden="true">{selected ? "✓" : ""}</span><span className="hotel-guide-style-icon" aria-hidden="true"><Glyph name={icon} /></span><strong>{title}</strong><small>{description}</small></button>;
}

function ReviewSection({ title, icon, onEdit, children }: { title: string; icon: string; onEdit: () => void; children: React.ReactNode }) {
  return <section className="hotel-guide-review-section"><div className="hotel-guide-review-heading"><h3 className="has-icon"><Glyph name={icon} />{title}</h3><button type="button" onClick={onEdit}>Edit</button></div><dl>{children}</dl></section>;
}

function ReviewLine({ label, value }: { label: string; value: string }) {
  return <div className="hotel-guide-review-line"><dt>{label}</dt><dd>{value}</dd></div>;
}

function FieldMessage({ id, message }: { id?: string; message?: string }) {
  return message ? <p id={id} className="hotel-request-error" role="alert">{message}</p> : null;
}
