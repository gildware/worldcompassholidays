"use client";

import { useActionState, useEffect, useMemo, useRef, useState, type MouseEvent } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { submitHotelRequest } from "@/actions/hotel-request";
import { formatPhone } from "@/lib/auth/phone";
import { DateMenu, prettyStayDate } from "@/components/hotel-list/stay-list/HotelStayList";
import { SearchableSelect, type SelectOption } from "@/components/ui/SearchableSelect";
import {
  hotelAdditionalPreferences,
  hotelBudgetBands,
  hotelMeals,
  hotelRoomTypes,
  hotelStayPreferences,
  legacyHotelBudgetBands,
  legacyHotelRoomTypes,
  isBudgetValue,
  type RequestOption,
} from "@/lib/custom-request";
import { initialFormState, type FormState } from "@/lib/forms";

const starOptions = [
  { value: "any", label: "Any", title: "Any star rating", count: 0 },
  { value: "3", label: "3 stars", title: "3 stars or more", count: 3 },
  { value: "4", label: "4 stars", title: "4 stars or more", count: 4 },
  { value: "5", label: "5 stars", title: "5 stars", count: 5 },
];

const sparkle = "M12 3l1.8 4.7 4.7 1.8-4.7 1.8L12 16l-1.8-4.7L5.5 9.5l4.7-1.8L12 3zM18 15l.8 2.2L21 18l-2.2.8L18 21l-.8-2.2L15 18l2.2-.8L18 15z";
const users = "M9 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM3 20a6 6 0 0 1 12 0M17 11a2.5 2.5 0 1 0 0-5M17 14a5 5 0 0 1 4.5 5";
const glyphs: Record<string, string> = {
  star: "M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9L12 3z",
  any: sparkle,
  room: "M3 18v-7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v7M3 18h18M3 14h18M7 9V7a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1v2",
  breakfast: "M4 9h12v6a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4V9zM16 10h2a2 2 0 0 1 0 4h-2M7 3v2M11 3v2",
  half: "M6 3v7a2 2 0 0 0 2 2v9M10 3v7M6 7h4M17 3c-2 1-3 3-3 6s1 4 3 4v8",
  full: "M12 4a8 8 0 1 0 0 16 8 8 0 0 0 0-16zM12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8z",
  luxury: "M6 3h12l4 6-10 12L2 9l4-6zM2 9h20M9 3l3 6 3-6M12 21L8 9M12 21l4-12",
  comfortable: "M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1v-9z",
  family: users,
  budget: "M7 5h10M7 9h10M7 5c5 0 7 2 7 4s-2 4-7 4l7 7",
  "lake-view": "M2 8c2 0 2-2 5-2s3 2 5 2 3-2 5-2 3 2 5 2M2 14c2 0 2-2 5-2s3 2 5 2 3-2 5-2 3 2 5 2M2 20c2 0 2-2 5-2s3 2 5 2 3-2 5-2 3 2 5 2",
  "mountain-view": "M3 20l6-11 4 6 3-4 5 9H3z",
  "city-view": "M5 21V5a1 1 0 0 1 1-1h8a1 1 0 0 1 1 1v16M15 10h3a1 1 0 0 1 1 1v10M3 21h18M8 8h2M8 12h2M8 16h2",
  "near-market": "M5 8h14l-1 12H6L5 8zM9 8a3 3 0 0 1 6 0",
  pool: "M2 19c2 0 2-1.5 5-1.5s3 1.5 5 1.5 3-1.5 5-1.5 3 1.5 5 1.5M8 14V6a2 2 0 0 1 4 0M14 14V6a2 2 0 0 1 4 0M8 10h6",
  parking: "M5 3h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2zM9 17V7h4a3 3 0 0 1 0 6H9",
  wifi: "M2 9a15 15 0 0 1 20 0M5 12.5a10 10 0 0 1 14 0M8.5 16a5 5 0 0 1 7 0M12 19.5h.01",
  "airport-transfer": "M10 14L3 11l1-2 8 1 5-5a2 2 0 0 1 3 3l-5 5 1 8-2 1-3-7z",
  "pet-friendly": "M7 11a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zM12 8.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zM17 11a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zM12 12c-3 0-5 3-5 5 0 2 2 2.5 5 2.5s5-.5 5-2.5c0-2-2-5-5-5z",
  "family-friendly": users,
  accessible: "M12 5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zM12 7v6h5l2 6M12 10H8M8 14a5 5 0 1 0 7 6",
  pin: "M12 21s7-5.2 7-11a7 7 0 1 0-14 0c0 5.8 7 11 7 11zM12 12.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z",
  hotel: "M4 21V5a1 1 0 0 1 1-1h9a1 1 0 0 1 1 1v16M15 10h4a1 1 0 0 1 1 1v10M3 21h18M8 8h3M8 12h3M8 16h3",
  "cal-in": "M7 3v3M17 3v3M4 8h16M5 5h14a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1zM9.5 14.5l2 2 3.5-3.5",
  "cal-out": "M7 3v3M17 3v3M4 8h16M5 5h14a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1zM9 15h6M13 12.5l2.5 2.5-2.5 2.5",
  adults: "M12 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7zM5 21a7 7 0 0 1 14 0",
  children: "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM8.5 14a4 4 0 0 0 7 0M9 9.5h.01M15 9.5h.01",
  rooms: "M6 21V4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v17M4 21h16M14.5 12h.01",
  area: "M9 4L3 6v14l6-2 6 2 6-2V4l-6 2-6-2zM9 4v14M15 6v14",
  calendar: "M7 3v3M17 3v3M4 8h16M5 5h14a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1z",
  note: "M5 4h14a1 1 0 0 1 1 1v14l-4-4H5a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1zM8 8h8M8 11h5",
};

function Glyph({ name, filled = false }: { name: string; filled?: boolean }) {
  const path = glyphs[name];
  if (!path) return null;
  return (
    <svg className="hg-icon" viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
      <path d={path} />
    </svg>
  );
}

const budgetOptions: RequestOption[] = [
  { value: "", label: "Flexible budget" },
  ...hotelBudgetBands.map(({ value, label }) => ({ value, label })),
  { value: "other", label: "Enter a custom amount" },
];
const budgetValues = new Set([
  "",
  "other",
  ...hotelBudgetBands.map((option) => option.value),
  ...legacyHotelBudgetBands.map((option) => option.value),
]);
const allRoomTypeOptions = [...hotelRoomTypes, ...legacyHotelRoomTypes];
const fieldOrder = ["phone", "destination", "area", "hotelName", "checkIn", "checkOut", "adults", "children", "childAges", "rooms", "budget", "stars", "roomType", "meals", "message"];
function parseSelectionList(value: string | undefined, allowed: readonly string[]) {
  try {
    const parsed: unknown = JSON.parse(value || "[]");
    if (!Array.isArray(parsed)) return [];
    const known = new Set(allowed);
    return [...new Set(parsed.filter((item): item is string => typeof item === "string" && known.has(item)))];
  } catch {
    return [];
  }
}

function todayIso() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}

function nightCount(checkIn: string, checkOut: string) {
  if (!checkIn || !checkOut) return 0;
  return Math.max(0, Math.round((new Date(`${checkOut}T00:00:00`).getTime() - new Date(`${checkIn}T00:00:00`).getTime()) / 86400000));
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
  stayPreference: string;
  preferences: string;
};

export function HotelRequestForm({
  sent,
  reference,
  customer,
  defaults,
  destinations = [],
  autoSubmit = false,
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
  destinations?: string[];
  autoSubmit?: boolean;
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
  const formRef = useRef<HTMLFormElement>(null);
  const submissionStarted = useRef(false);
  const autoResumeStarted = useRef(false);
  const [submitStarted, setSubmitStarted] = useState(false);
  const [resumeReady, setResumeReady] = useState(!autoSubmit);
  const [step, setStep] = useState<0 | 1 | 2 | 3>(autoSubmit ? 3 : 0);
  const firstStep = useRef(true);

  useEffect(() => {
    if (firstStep.current) {
      firstStep.current = false;
      return;
    }
    const card = document.getElementById("hotel-request-pass");
    if (!card) return;
    const top = card.getBoundingClientRect().top + window.scrollY - 80;
    window.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
  }, [step]);
  const [stepOneTouched, setStepOneTouched] = useState(false);
  const [touchedFields, setTouchedFields] = useState<Record<string, boolean>>({});
  const touch = (name: string) => setTouchedFields((current) => (current[name] ? current : { ...current, [name]: true }));
  const [stars, setStars] = useState(saved.stars || defaults.stars || "any");
  const [destination, setDestination] = useState(saved.destination || defaults.destination);
  const [customDestination, setCustomDestination] = useState("");
  const [phone, setPhone] = useState(saved.phone || "");
  const [hotelName, setHotelName] = useState(saved.hotelName || defaults.hotelName || "");
  const [checkIn, setCheckIn] = useState(saved.checkIn || defaults.checkIn || "");
  const [checkOut, setCheckOut] = useState(saved.checkOut || defaults.checkOut || "");
  const [note, setNote] = useState(saved.message || defaults.message || "");
  const savedBudget = saved.budget || defaults.budget || "";
  const savedIsOther = Boolean(savedBudget) && !budgetValues.has(savedBudget);
  const [budgetChoice, setBudgetChoice] = useState(savedIsOther ? "other" : savedBudget);
  const [otherBudget, setOtherBudget] = useState(savedIsOther ? savedBudget : "");
  const [area, setArea] = useState(saved.area || defaults.area || "");
  const [roomType, setRoomType] = useState(saved.roomType || defaults.roomType || "any");
  const [meals, setMeals] = useState(saved.meals || defaults.meals || "any");
  const [stayPreference, setStayPreference] = useState(saved.stayPreference || defaults.stayPreference || "any");
  const [preferences, setPreferences] = useState(() =>
    parseSelectionList(saved.preferences || defaults.preferences, hotelAdditionalPreferences.map((item) => item.value)),
  );
  const [adults, setAdults] = useState(clampCount(saved.adults, defaults.adults, 1, 20));
  const [children, setChildren] = useState(clampCount(saved.children, defaults.children, 0, 12));
  const [childAges, setChildAges] = useState(splitAges(saved.childAges || defaults.childAges, clampCount(saved.children, defaults.children, 0, 12)));
  const [rooms, setRooms] = useState(clampCount(saved.rooms, defaults.rooms, 1, 10));
  const [mounted, setMounted] = useState(false);
  const budgetValue = budgetChoice === "other" ? otherBudget.replace(/\D/g, "") : budgetChoice;
  const destinationValue = destination === "__custom__" ? customDestination.trim() : destination;
  const destinationOptions = useMemo<SelectOption[]>(() => {
    const options = new Map<string, SelectOption>();
    for (const entry of destinations) {
      const parts = entry.split(",").map((part) => part.trim()).filter(Boolean);
      const label = parts[0] || entry;
      const key = label.toLocaleLowerCase();
      if (!options.has(key)) {
        options.set(key, {
          value: entry,
          label,
          keywords: entry,
        });
      }
    }
    const result = [...options.values()];
    if (destination && destination !== "__custom__" && !result.some((option) => option.value === destination)) {
      result.unshift({ value: destination, label: destination });
    }
    result.push({ value: "__custom__", label: "+ Add a destination not listed", action: true });
    return result;
  }, [destination, destinations]);
  const today = todayIso();

  const stepOneErrors = useMemo(() => {
    const errors: Record<string, string> = {};
    if (destinationValue.trim().length < 2) errors.destination = "Enter a destination.";
    if (!checkIn) errors.checkIn = "Choose your check-in date.";
    else if (checkIn < today) errors.checkIn = "Choose today or a future date.";
    if (!checkOut) errors.checkOut = "Choose your check-out date.";
    else if (checkIn && checkOut <= checkIn) errors.checkOut = "Check-out must be after check-in.";
    else if (checkIn && nightCount(checkIn, checkOut) > 60) errors.checkOut = "Choose a stay of 60 nights or fewer.";
    if (customer && !customer.phone && phone.replace(/\D/g, "").length < 8) errors.phone = "Enter a phone number with country code.";
    if (children > 0 && (childAges.length !== children || childAges.some((age) => !/^\d{1,2}$/.test(age) || Number(age) > 17))) {
      errors.childAges = "Choose an age for every child.";
    }
    return errors;
  }, [childAges, checkIn, checkOut, children, customer, destinationValue, phone, today]);
  const stepOneValid = Object.keys(stepOneErrors).length === 0;
  const customBudgetValid = budgetChoice !== "other" ||
    (Boolean(otherBudget) && isBudgetValue([...hotelBudgetBands, ...legacyHotelBudgetBands], budgetValue));
  const customBudgetError = budgetChoice === "other" && !customBudgetValid
    ? otherBudget ? "Enter an amount from ₹100 to ₹5,00,000." : "Enter a nightly amount or choose a range."
    : undefined;
  const stepTwoValid = customBudgetValid;
  const savedRoomType = allRoomTypeOptions.find((option) => option.value === roomType);
  const roomTypeOptions = savedRoomType && !hotelRoomTypes.some((option) => option.value === roomType)
    ? [...hotelRoomTypes, savedRoomType]
    : hotelRoomTypes;
  const budgetBand = [...hotelBudgetBands, ...legacyHotelBudgetBands].find((item) => item.value === budgetChoice);
  const budgetSummary = budgetChoice === "other"
    ? otherBudget ? `₹${Number(otherBudget).toLocaleString("en-IN")} per night` : "Custom amount"
    : budgetBand?.label ?? "Flexible budget";
  const starSummary = starOptions.find((option) => option.value === stars)?.title ?? "Any star rating";
  const mealSummary = hotelMeals.find((option) => option.value === meals)?.label ?? "Any";
  const stayPreferenceSummary = hotelStayPreferences.find((option) => option.value === stayPreference)?.label ?? "No preference";
  const roomSummary = allRoomTypeOptions.find((option) => option.value === roomType)?.label ?? "Any";
  const preferenceSummary = preferences.map((value) => hotelAdditionalPreferences.find((item) => item.value === value)?.label ?? value);

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
    if (!autoSubmit || resumeReady || autoResumeStarted.current) return;
    const timer = window.setTimeout(() => {
      try {
        const raw = window.sessionStorage.getItem("wch-pending-hotel-request");
        if (raw) {
          const pending: unknown = JSON.parse(raw);
          if (pending && typeof pending === "object" && !Array.isArray(pending)) {
            const data = pending as Record<string, unknown>;
            const value = (key: string) => typeof data[key] === "string" ? data[key] as string : "";
            setDestination(value("destination"));
            setCustomDestination(value("customDestination"));
            setHotelName(value("hotelName"));
            setCheckIn(value("checkIn"));
            setCheckOut(value("checkOut"));
            setAdults(clampCount(value("adults"), defaults.adults, 1, 20));
            setChildren(clampCount(value("children"), defaults.children, 0, 12));
            setChildAges(splitAges(value("childAges"), clampCount(value("children"), defaults.children, 0, 12)));
            setRooms(clampCount(value("rooms"), defaults.rooms, 1, 10));
            setPhone(value("phone"));
            setArea(value("area"));
            const restoredBudget = value("budget");
            const restoredCustomBudget = /^\d+$/.test(restoredBudget) && !budgetValues.has(restoredBudget);
            setBudgetChoice(restoredBudget === "other" || restoredCustomBudget ? "other" : budgetValues.has(restoredBudget) ? restoredBudget : "");
            setOtherBudget(restoredCustomBudget ? restoredBudget : "");
            setStars(value("stars") || "any");
            setRoomType(value("roomType") || "any");
            setMeals(value("meals") || "any");
            setStayPreference(value("stayPreference") || "any");
            setPreferences(parseSelectionList(value("preferences"), hotelAdditionalPreferences.map((item) => item.value)));
            setNote(value("message"));
          }
        }
      } catch {
        // The URL defaults remain available if session storage is disabled.
      }
      setResumeReady(true);
    }, 0);
    return () => window.clearTimeout(timer);
  }, [autoSubmit, defaults, resumeReady]);

  useEffect(() => {
    if (!autoSubmit || !customer || !resumeReady || autoResumeStarted.current) return;
    autoResumeStarted.current = true;
    try {
      window.sessionStorage.removeItem("wch-pending-hotel-request");
    } catch {
      // Ignore unavailable session storage after using URL defaults.
    }
    const url = new URL(window.location.href);
    url.searchParams.delete("resume");
    window.history.replaceState(window.history.state, "", `${url.pathname}${url.search}${url.hash}`);
    formRef.current?.requestSubmit();
  }, [autoSubmit, customer, resumeReady]);

  useEffect(() => {
    if (!state.reference) return;
    try {
      window.sessionStorage.removeItem("wch-pending-hotel-request");
    } catch {
      // Ignore unavailable session storage.
    }
  }, [state.reference]);

  useEffect(() => {
    if (!pending && state.error) {
      submissionStarted.current = false;
      setSubmitStarted(false);
    }
  }, [pending, state.error]);

  useEffect(() => {
    if (!view.error) return;
    const errors = view.fields ?? {};
    const tripFields = ["phone", "destination", "area", "hotelName", "checkIn", "checkOut", "adults", "children", "childAges", "rooms"];
    const preferenceFields = ["budget", "stars", "roomType", "meals", "stayPreference", "preferences"];
    if (tripFields.some((field) => errors[field])) setStep(0);
    else if (preferenceFields.some((field) => errors[field])) setStep(1);
    else if (errors.message) setStep(2);
  }, [view]);

  useEffect(() => {
    if (!view.error) return;
    const frame = window.requestAnimationFrame(() => focusErrorField(view.fields));
    return () => window.cancelAnimationFrame(frame);
  }, [step, view]);

  const successReference =
    !busy && state.reference && !state.error
      ? state.reference
      : !busy && whatsappState?.reference && !whatsappState.error
        ? whatsappState.reference
        : sent
          ? reference
          : "";

  const successModal = successReference ? (
    <SuccessModal
      reference={successReference}
      exploreHref="/hotels"
      detail="Nothing is booked until you accept a stay."
    />
  ) : null;

  function setChildCount(next: number) {
    touch("childAges");
    setChildren(next);
    setChildAges((current) => {
      const copy = current.slice(0, next);
      while (copy.length < next) copy.push("");
      return copy;
    });
  }

  function togglePreference(value: string) {
    setPreferences((current) => current.includes(value)
      ? current.filter((item) => item !== value)
      : [...current, value]);
  }

  function loginWithBrief(form: HTMLFormElement | null) {
    const params = new URLSearchParams();
    if (form) {
      const data = new FormData(form);
      try {
        window.sessionStorage.setItem("wch-pending-hotel-request", JSON.stringify(Object.fromEntries(data.entries())));
      } catch {
        // The query string below remains a fallback if session storage is unavailable.
      }
      for (const key of ["destination", "customDestination", "area", "hotelName", "checkIn", "checkOut", "adults", "children", "childAges", "rooms", "stars", "roomType", "meals", "stayPreference", "preferences", "budget", "message"]) {
        const value = String(data.get(key) || "").trim();
        if (value) params.set(key, value);
      }
    }
    params.set("resume", "1");
    const returnPath = `/hotels/request?${params}`;
    window.location.assign(form ? `/login?next=${encodeURIComponent(returnPath)}` : loginHref);
  }

  async function sendOnWhatsApp(event: MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    const form = event.currentTarget.form;
    if (!form || busy || submitStarted || submissionStarted.current) return;
    submissionStarted.current = true;
    setSubmitStarted(true);
    const data = new FormData(form);
    data.set("channel", "whatsapp");
    setWhatsappPending(true);
    const result = await submitHotelRequest(initialFormState, data);
    setWhatsappState(result);
    setWhatsappPending(false);
    submissionStarted.current = false;
    setSubmitStarted(false);
    if (result.whatsappUrl) window.open(result.whatsappUrl, "_blank", "noopener,noreferrer");
  }

  function errorFor(name: string) {
    const serverError = view.fields?.[name];
    if (serverError) return serverError;
    return stepOneTouched || touchedFields[name] ? stepOneErrors[name] : undefined;
  }

  function continueTo(next: 1 | 2 | 3) {
    if (step === 0 && !stepOneValid) {
      setStepOneTouched(true);
      return;
    }
    if (step === 1 && !stepTwoValid) {
      return;
    }
    setStep(next);
  }

  return (
    <div className="hotel-request-card hotel-guide-card" id="hotel-request-pass">
      <button type="button" className="hotel-request-back" onClick={() => (window.history.length > 1 ? router.back() : router.push(backHref))}>
        Back
      </button>
      <div className="hotel-guide-heading">
        <p className="hotel-guide-kicker">PERSONAL HOTEL CONCIERGE</p>
        <h1>Find a stay that feels right.</h1>
        <p>Share a few details and our local team will find the right options for you.</p>
      </div>
      <GuidedProgress step={step} onSelect={(next) => next < step && setStep(next as 0 | 1 | 2 | 3)} />
      <form
        ref={formRef}
        action={action}
        noValidate
        className="hotel-request-form hotel-guide-form"
        onSubmit={(event) => {
          setWhatsappState(null);
          if (busy || submitStarted || submissionStarted.current) {
            event.preventDefault();
            return;
          }
          if (!stepOneValid) {
            event.preventDefault();
            setStep(0);
            setStepOneTouched(true);
            return;
          }
          if (!customer) {
            event.preventDefault();
            loginWithBrief(event.currentTarget);
            return;
          }
          submissionStarted.current = true;
          setSubmitStarted(true);
        }}
      >
        <input type="hidden" name="stayPreference" value={stayPreference} />
        <input type="hidden" name="preferences" value={JSON.stringify(preferences)} />
        {step !== 0 ? (
          <>
            <input type="hidden" name="destination" value={destinationValue} />
            <input type="hidden" name="customDestination" value={customDestination} />
            <input type="hidden" name="hotelName" value={hotelName} />
            <input type="hidden" name="checkIn" value={checkIn} />
            <input type="hidden" name="checkOut" value={checkOut} />
            <input type="hidden" name="adults" value={adults} />
            <input type="hidden" name="children" value={children} />
            <input type="hidden" name="rooms" value={rooms} />
            <input type="hidden" name="childAges" value={children > 0 ? childAges.join(",") : ""} />
            <input type="hidden" name="area" value={area} />
          </>
        ) : null}
        {step !== 0 && (customer || phone) && !(step === 3 && customer && !customer.phone) ? <input type="hidden" name="phone" value={phone} /> : null}
        {step !== 1 ? (
          <>
            <input type="hidden" name="budget" value={budgetValue} />
            <input type="hidden" name="stars" value={stars} />
            <input type="hidden" name="roomType" value={roomType} />
            <input type="hidden" name="meals" value={meals} />
          </>
        ) : null}
        {step !== 2 ? <input type="hidden" name="message" value={note} /> : null}
        {view.error ? (
          <p className="hotel-request-banner-alert hotel-guide-alert" role="alert">
            {view.fields ? "Please check the highlighted details." : view.error}
          </p>
        ) : null}
        {step === 0 ? (
          <section className="hotel-guide-panel" aria-labelledby="hotel-step-one-title">
            <div className="hotel-guide-step-title">
              <span>01</span>
              <div><h2 id="hotel-step-one-title">Where and when do you need a stay?</h2><p>Choose your destination, dates and party size. Add a hotel or area if you have one in mind.</p></div>
            </div>
            <div className="hotel-guide-grid">
              <div className="hotel-guide-field hotel-guide-destination-field" id="destination-field">
                <label htmlFor="destination-picker" className="has-icon"><Glyph name="pin" />Destination</label>
                {destination === "__custom__" ? (
                  <div className={`hotel-request-control hotel-guide-custom-destination-input${errorFor("destination") ? " is-invalid" : ""}`}>
                    <input
                      id="destination-picker"
                      type="text"
                      autoFocus
                      aria-label="Destination"
                      placeholder="Enter a city, destination or country"
                      value={customDestination}
                      aria-invalid={errorFor("destination") ? true : undefined}
                      aria-describedby={errorFor("destination") ? "destination-error" : undefined}
                      onChange={(event) => {
                        setCustomDestination(event.target.value);
                        touch("destination");
                      }}
                    />
                    <button
                      type="button"
                      className="hotel-guide-custom-destination"
                      onClick={() => {
                        setDestination("");
                        setCustomDestination("");
                        touch("destination");
                      }}
                    >
                      Choose from list
                    </button>
                  </div>
                ) : (
                  <SearchableSelect
                    id="destination-picker"
                    value={destination}
                    options={destinationOptions}
                    emptyLabel="Choose a destination"
                    placeholder="Search destinations"
                    searchPlaceholder="Search city, destination or country"
                    ariaLabel="Destination"
                    invalid={Boolean(errorFor("destination"))}
                    describedBy={errorFor("destination") ? "destination-error" : undefined}
                    className="hotel-guide-select-trigger"
                    menuClassName="hotel-guide-select-menu"
                    onChange={(value, typed) => {
                      setDestination(value);
                      setCustomDestination(value === "__custom__" ? typed || "" : "");
                      touch("destination");
                    }}
                  />
                )}
                <FieldMessage id="destination-error" message={errorFor("destination")} />
              </div>
              <Field label="Preferred hotel (optional)" icon="hotel" name="hotelName" placeholder="Any hotel name, if you have one in mind" value={hotelName} onChange={setHotelName} />
              <StayDateField
                label="Check-in"
                icon="cal-in"
                name="checkIn"
                value={checkIn}
                min={today}
                error={errorFor("checkIn")}
                onPick={(value) => {
                  setCheckIn(value);
                  if (checkOut && checkOut <= value) setCheckOut("");
                  touch("checkIn");
                }}
              />
              <StayDateField
                label="Check-out"
                icon="cal-out"
                name="checkOut"
                value={checkOut}
                min={nextDayIso(checkIn || today)}
                error={errorFor("checkOut")}
                onPick={(value) => { setCheckOut(value); touch("checkOut"); }}
              />
            </div>
            <div className="hotel-guide-travellers">
              <GuestCounter label="Adults" icon="adults" value={adults} min={1} max={20} onChange={setAdults} />
              <GuestCounter label="Children" icon="children" value={children} min={0} max={12} onChange={setChildCount} />
              <GuestCounter label="Rooms" icon="rooms" value={rooms} min={1} max={10} onChange={setRooms} />
            </div>
            {children > 0 ? (
              <div className="hotel-guide-child-ages" id="childAges-field">
                <div><strong>Children’s ages</strong><span>Help us find the right room and rate.</span></div>
                <div className="hotel-guide-age-grid">
                  {childAges.map((age, index) => (
                    <div className="hotel-guide-age-field" key={index}>
                      <span>Child {index + 1}</span>
                      <SearchableSelect
                        id={`child-age-${index}`}
                        value={age}
                        options={Array.from({ length: 18 }, (_, value) => ({ value: String(value), label: `${value} years` }))}
                        emptyLabel="Select age"
                        placeholder="Select age"
                        searchPlaceholder="Search age"
                        ariaLabel={`Age of child ${index + 1}`}
                        className="hotel-guide-select-trigger"
                        menuClassName="hotel-guide-select-menu"
                        onChange={(value) => {
                          setChildAges((current) => current.map((item, itemIndex) => itemIndex === index ? value : item));
                          touch("childAges");
                        }}
                      />
                    </div>
                  ))}
                </div>
                <input type="hidden" name="childAges" value={children > 0 ? childAges.join(",") : ""} />
                <FieldMessage id="childAges-error" message={errorFor("childAges")} />
              </div>
            ) : <input type="hidden" name="childAges" value="" />}
            {customer ? (
              <div className="hotel-guide-contact">
                <span>Requesting as <strong>{customer.name}</strong></span>
                {customer.phone ? <span>{formatPhone(customer.phone) || customer.phone}</span> : null}
                <Field label={customer.phone ? "Alternative phone (optional)" : "Phone number"} name="phone" type="tel" autoComplete="tel" placeholder="+91 98765 43210" error={errorFor("phone")} value={phone} onChange={(value) => { setPhone(value); touch("phone"); }} />
              </div>
            ) : <input type="hidden" name="phone" value="" />}
            <Field label="City area or landmark (optional)" icon="area" name="area" placeholder="Dal Lake, near the market, close to the airport" value={area} onChange={setArea} />
          </section>
        ) : null}

        {step === 1 ? (
          <section className="hotel-guide-panel" aria-labelledby="hotel-step-two-title">
            <div className="hotel-guide-step-title">
              <span>02</span>
                <div><h2 id="hotel-step-two-title">What kind of stay are you looking for?</h2><p>Choose your stay style, nightly budget, star rating, room type and meal preference.</p></div>
            </div>
            <fieldset className="hotel-guide-choice-group">
              <legend>Your preferred style</legend>
              <div className="hotel-guide-style-grid">
                {hotelStayPreferences.map((option) => <ChoiceCard key={option.value} selected={stayPreference === option.value} icon={option.value} title={option.label} description={option.text} onClick={() => setStayPreference(option.value)} />)}
              </div>
            </fieldset>
            <div className="hotel-guide-preference-grid">
              <div className="hotel-guide-field" id="budget-field">
                <label htmlFor="budget-choice">Budget per night <span>(INR)</span></label>
                {budgetChoice === "other" ? (
                  <div className={`hotel-request-control hotel-guide-custom-destination-input${view.fields?.budget || customBudgetError ? " is-invalid" : ""}`}>
                    <input
                      id="budget-choice"
                      inputMode="numeric"
                      autoComplete="off"
                      autoFocus
                      aria-label="Budget per night"
                      placeholder="Enter amount in rupees"
                      value={otherBudget}
                      onChange={(event) => setOtherBudget(event.target.value.replace(/[^\d]/g, ""))}
                      aria-invalid={Boolean(view.fields?.budget || customBudgetError)}
                      aria-describedby={view.fields?.budget || customBudgetError ? "budget-error" : undefined}
                    />
                    <button type="button" className="hotel-guide-custom-destination" onClick={() => { setBudgetChoice(""); setOtherBudget(""); }}>
                      Choose a range
                    </button>
                  </div>
                ) : (
                  <SearchableSelect
                    id="budget-choice"
                    value={budgetChoice}
                    options={[
                      ...budgetOptions.filter((option) => option.value !== "other"),
                      ...legacyHotelBudgetBands
                        .filter((band) => band.value === budgetChoice)
                        .map((band) => ({ value: band.value, label: `Previous choice · ${band.label}` })),
                      { value: "other", label: "+ Enter a custom amount", action: true },
                    ]}
                    ariaLabel="Budget per night"
                    searchPlaceholder="Search budget ranges"
                    invalid={Boolean(view.fields?.budget || customBudgetError)}
                    describedBy={view.fields?.budget || customBudgetError ? "budget-error" : undefined}
                    className="hotel-guide-select-trigger"
                    menuClassName="hotel-guide-select-menu"
                    onChange={(value, typed) => {
                      setBudgetChoice(value);
                      if (value === "other") setOtherBudget((typed || "").replace(/\D/g, ""));
                    }}
                  />
                )}
                <input type="hidden" name="budget" value={budgetValue} />
                <FieldMessage id="budget-error" message={view.fields?.budget || customBudgetError} />
              </div>
              <fieldset className="hotel-guide-choice-group" id="stars-field">
                <legend>Star preference</legend>
                <div className="hotel-guide-star-grid">
                  {starOptions.map((option) => <button key={option.value} type="button" className={stars === option.value ? "is-selected" : ""} aria-pressed={stars === option.value} onClick={() => setStars(option.value)}>{option.count ? <span className="hg-stars" aria-hidden="true">{Array.from({ length: option.count }, (_, index) => <Glyph key={index} name="star" filled />)}</span> : <Glyph name="any" />}<span>{option.label}</span></button>)}
                </div>
                <input type="hidden" name="stars" value={stars} />
              </fieldset>
              <SelectRow label="Room type" name="roomType" value={roomType} options={roomTypeOptions} error={view.fields?.roomType} onChange={setRoomType} />
              <ChoiceRow label="Meal preference" name="meals" value={meals} options={hotelMeals} withIcons error={view.fields?.meals} onChange={setMeals} />
            </div>
          </section>
        ) : null}

        {step === 2 ? (
          <section className="hotel-guide-panel" aria-labelledby="hotel-step-three-title">
            <div className="hotel-guide-step-title">
              <span>03</span>
              <div><h2 id="hotel-step-three-title">What would make your stay more comfortable?</h2><p>Choose any features you’d like us to look for and add special requests.</p></div>
            </div>
            <fieldset className="hotel-guide-choice-group hotel-guide-feature-group">
              <legend>Stay features <span>Choose any that matter</span></legend>
              <div className="hotel-guide-chip-grid">
                {hotelAdditionalPreferences.map((option) => <button key={option.value} type="button" className={preferences.includes(option.value) ? "is-selected" : ""} aria-pressed={preferences.includes(option.value)} onClick={() => togglePreference(option.value)}><Glyph name={option.value} />{option.label}</button>)}
              </div>
            </fieldset>
            <Field label="Any special requests? (optional)" name="message" multiline placeholder="Tell us anything else we should know about your stay..." error={view.fields?.message} value={note} onChange={setNote} wide />
          </section>
        ) : null}

        {step === 3 ? (
          <section className="hotel-guide-panel" aria-labelledby="hotel-step-four-title">
            <div className="hotel-guide-step-title">
              <span>04</span>
              <div><h2 id="hotel-step-four-title">Review your hotel request</h2><p>Check your dates, guests and stay preferences before sending.</p></div>
            </div>
            <div className="hotel-guide-review">
              <ReviewSection title="Trip details" icon="pin" onEdit={() => setStep(0)}>
                <ReviewLine label="Destination" icon="pin" value={destinationValue || "Not provided"} />
                {hotelName ? <ReviewLine label="Preferred hotel" icon="hotel" value={hotelName} /> : null}
                {area ? <ReviewLine label="Area" icon="area" value={area} /> : null}
                <ReviewLine label="Dates" icon="calendar" value={`${prettyDate(checkIn)} – ${prettyDate(checkOut)}${nightCount(checkIn, checkOut) ? ` · ${nightCount(checkIn, checkOut)} nights` : ""}`} />
                <ReviewLine label="Guests" icon="adults" value={`${adults} adults · ${children} ${children === 1 ? "child" : "children"}${children ? ` (${childAges.join(", ")} years)` : ""} · ${rooms} ${rooms === 1 ? "room" : "rooms"}`} />
              </ReviewSection>
              <ReviewSection title="Stay preferences" icon="comfortable" onEdit={() => setStep(1)}>
                <ReviewLine label="Style" icon="luxury" value={stayPreferenceSummary} />
                <ReviewLine label="Budget" icon="budget" value={budgetSummary} />
                <ReviewLine label="Stars" icon="star" value={starSummary} />
                <ReviewLine label="Room" icon="room" value={roomSummary} />
                <ReviewLine label="Meals" icon="half" value={mealSummary} />
              </ReviewSection>
              <ReviewSection title="Special requests" icon="any" onEdit={() => setStep(2)}>
                <ReviewLine label="Features" icon="any" value={preferenceSummary.length ? preferenceSummary.join(", ") : "No additional preferences"} />
                <ReviewLine label="Note" icon="note" value={note || "None"} />
              </ReviewSection>
            </div>
            <p className="hotel-guide-reassurance">Our travel team will review your requirements and get back to you with suitable options.</p>
            {customer ? (
              <div className="hotel-guide-contact-summary">
                <span>Submitting as <strong>{customer.name}</strong></span>
                {customer.phone ? <span>{formatPhone(customer.phone) || customer.phone}</span> : <Field label="Phone number" name="phone" type="tel" autoComplete="tel" placeholder="+91 98765 43210" error={errorFor("phone")} value={phone} onChange={setPhone} />}
              </div>
            ) : <p className="hotel-guide-login-note">You’ll verify your mobile number before we send the request.</p>}
          </section>
        ) : null}

        <div className="hotel-guide-actions">
          {step > 0 ? <button type="button" className="hotel-guide-back" onClick={() => setStep((step - 1) as 0 | 1 | 2)}>Back</button> : <span className="hotel-guide-secure"><span aria-hidden="true">✦</span> Free, no-obligation request</span>}
          {step < 3 ? (
            <div className="hotel-guide-action-right">
              {step === 0 && !stepOneValid ? <span className="hotel-guide-hint">Add a destination, dates and traveler details to continue.</span> : null}
              <button type="button" className="hotel-guide-primary" disabled={(step === 0 && !stepOneValid) || (step === 1 && !stepTwoValid)} onClick={() => continueTo((step + 1) as 1 | 2 | 3)}>Continue <span aria-hidden="true">→</span></button>
            </div>
          ) : (
            <div className="hotel-guide-submit-group">
              <button type="submit" className="hotel-guide-primary" disabled={busy || submitStarted}>{pending ? "Sending request…" : "Submit hotel request"}</button>
              {customer ? <button type="button" className="hotel-guide-whatsapp" disabled={busy || submitStarted} onClick={sendOnWhatsApp}>{whatsappPending ? "Preparing…" : "Send via WhatsApp"}</button> : null}
            </div>
          )}
        </div>
      </form>
      {mounted && successModal ? createPortal(successModal, document.body) : null}
    </div>
  );
}

function GuidedProgress({ step, onSelect }: { step: number; onSelect: (step: number) => void }) {
  const labels = ["Trip details", "Stay preferences", "Stay details", "Review"];
  return (
    <nav className="hotel-guide-progress" aria-label="Hotel request progress">
      <div className="hotel-guide-progress-meta"><span>STEP {step + 1} OF 4</span><strong>{labels[step]}</strong></div>
      <div className="hotel-guide-progress-track" role="group" aria-label="Completed and current steps">
        {labels.map((label, index) => (
          <button key={label} type="button" className={index === step ? "is-current" : index < step ? "is-complete" : ""} aria-current={index === step ? "step" : undefined} aria-label={`Step ${index + 1}: ${label}`} disabled={index > step} onClick={() => onSelect(index)}>
            <span />
          </button>
        ))}
      </div>
    </nav>
  );
}

function GuestCounter({ label, icon, value, min, max, onChange }: { label: string; icon: string; value: number; min: number; max: number; onChange: (value: number) => void }) {
  return (
    <div className="hotel-guide-counter">
      <div className="hotel-guide-counter-label"><span><strong className="has-icon"><Glyph name={icon} />{label}</strong><small>{label === "Adults" ? "Ages 12+" : label === "Children" ? "Ages 0–17" : "Rooms needed"}</small></span></div>
      <div className="hotel-guide-counter-control" role="group" aria-label={label}>
        <button type="button" aria-label={`Remove one ${label.toLowerCase()}`} disabled={value <= min} onClick={() => onChange(value - 1)}>−</button>
        <output aria-live="polite">{value}</output>
        <button type="button" aria-label={`Add one ${label.toLowerCase()}`} disabled={value >= max} onClick={() => onChange(value + 1)}>+</button>
      </div>
    </div>
  );
}

function ChoiceCard({ selected, icon, title, description, onClick }: { selected: boolean; icon: string; title: string; description: string; onClick: () => void }) {
  return (
    <button type="button" className={`hotel-guide-style-card${selected ? " is-selected" : ""}`} aria-pressed={selected} onClick={onClick}>
      <span className="hotel-guide-radio" aria-hidden="true">{selected ? "✓" : ""}</span>
      <span className="hotel-guide-style-icon" aria-hidden="true"><Glyph name={icon} /></span>
      <strong>{title}</strong>
      <small>{description}</small>
    </button>
  );
}

function ReviewSection({ title, icon, onEdit, children }: { title: string; icon: string; onEdit: () => void; children: React.ReactNode }) {
  return (
    <section className="hotel-guide-review-section">
      <div className="hotel-guide-review-heading"><h3 className="has-icon"><Glyph name={icon} />{title}</h3><button type="button" onClick={onEdit}>Edit</button></div>
      <dl>{children}</dl>
    </section>
  );
}

function ReviewLine({ label, icon, value }: { label: string; icon: string; value: string }) {
  return <div className="hotel-guide-review-line"><dt><Glyph name={icon} />{label}</dt><dd>{value}</dd></div>;
}

function prettyDate(iso: string) {
  if (!iso) return "Not selected";
  return new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric" }).format(new Date(`${iso}T00:00:00`));
}

function ChoiceRow({
  label,
  name,
  value,
  options,
  withIcons = false,
  error,
  onChange,
}: {
  label: string;
  name: string;
  value: string;
  options: readonly RequestOption[];
  withIcons?: boolean;
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
          <button key={option.value} type="button" className={`${value === option.value ? "is-on" : ""}${withIcons ? " has-icon" : ""}`} aria-pressed={value === option.value} onClick={() => onChange(option.value)}>
            {withIcons ? <Glyph name={option.value} /> : null}
            {option.label}
          </button>
        ))}
      </div>
      <input type="hidden" name={name} value={value} />
      <FieldMessage id={`${name}-error`} message={error} />
    </div>
  );
}

function SelectRow({
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
    <div className="hotel-request-cell" id={`${name}-field`}>
      <label htmlFor={name}>{label}</label>
      <SearchableSelect
        id={name}
        value={value}
        options={options}
        ariaLabel={label}
        searchPlaceholder={`Search ${label.toLowerCase()}`}
        invalid={Boolean(error)}
        describedBy={error ? `${name}-error` : undefined}
        className="hotel-guide-select-trigger"
        menuClassName="hotel-guide-select-menu"
        onChange={onChange}
      />
      <input type="hidden" name={name} value={value} />
      <FieldMessage id={`${name}-error`} message={error} />
    </div>
  );
}

function Field({
  label,
  icon,
  name,
  type = "text",
  placeholder,
  autoComplete,
  defaultValue,
  value,
  onChange,
  min,
  max,
  list,
  error,
  multiline = false,
  wide = false,
}: {
  label: string;
  icon?: string;
  name: string;
  type?: string;
  placeholder?: string;
  autoComplete?: string;
  defaultValue?: string;
  value?: string;
  onChange?: (value: string) => void;
  min?: number | string;
  max?: number | string;
  list?: string;
  error?: string;
  multiline?: boolean;
  wide?: boolean;
}) {
  const errorId = `${name}-error`;
  const controlled = value !== undefined;
  return (
    <div id={`${name}-field`} className={`${multiline || wide ? "hotel-request-span" : "hotel-request-cell"}${type === "date" ? " hotel-guide-date-field" : ""}`}>
      <label htmlFor={name} className={icon ? "has-icon" : undefined}>{icon ? <Glyph name={icon} /> : null}{label}</label>
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
          <>
          <input
            id={name}
            name={name}
            type={type}
            placeholder={placeholder}
            autoComplete={autoComplete}
            list={list}
            defaultValue={controlled ? undefined : defaultValue}
            value={controlled ? value : undefined}
            onChange={onChange ? (event) => onChange(event.target.value) : undefined}
            min={min}
            max={max}
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? errorId : undefined}
          />
          </>
        )}
      </div>
      <FieldMessage id={errorId} message={error} />
    </div>
  );
}

function nextDayIso(iso: string) {
  const date = new Date(`${iso}T00:00:00`);
  date.setDate(date.getDate() + 1);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function StayDateField({
  label,
  icon,
  name,
  value,
  min,
  error,
  onPick,
}: {
  label: string;
  icon: string;
  name: string;
  value: string;
  min: string;
  error?: string;
  onPick: (iso: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState<{ top?: number; bottom?: number; left: number } | null>(null);
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
      setPos(flip ? { bottom: window.innerHeight - rect.top + 8, left } : { top: rect.bottom + 8, left });
    };
    place();
    window.addEventListener("resize", place);
    window.addEventListener("scroll", place, true);
    return () => {
      window.removeEventListener("resize", place);
      window.removeEventListener("scroll", place, true);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onPointer = (event: PointerEvent) => {
      const target = event.target;
      if (target instanceof Element && target.closest("[data-picker]")) return;
      setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onPointer);
    window.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div id={`${name}-field`} className="hotel-request-cell">
      <label htmlFor={name} className="has-icon"><Glyph name={icon} />{label}</label>
      <div ref={ref} className={`stay-list hr-stay-date mt-5${error ? " is-invalid" : ""}`} data-picker>
        <div className="sl-field">
          <button
            id={name}
            className="sl-who"
            type="button"
            aria-haspopup="dialog"
            aria-expanded={open}
            aria-describedby={error ? `${name}-error` : undefined}
            onClick={() => setOpen((current) => !current)}
          >
            <strong>{value ? prettyStayDate(value) : "Select date"}</strong>
          </button>
          {open && pos && typeof document !== "undefined" ? createPortal(
            <div className="stay-list hr-cal-pop" style={{ top: pos.top, bottom: pos.bottom, left: pos.left }} data-picker>
              <DateMenu
                label={label}
                value={value || min}
                min={min}
                onClose={() => setOpen(false)}
                onPick={(iso) => {
                  onPick(iso);
                  setOpen(false);
                }}
              />
            </div>,
            document.body,
          ) : null}
        </div>
      </div>
      <FieldMessage id={`${name}-error`} message={error} />
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
  onClose,
}: {
  reference: string;
  exploreHref: string;
  detail: string;
  onClose?: () => void;
}) {
  return (
    <div className="hotel-request-modal" role="dialog" aria-modal="true" aria-labelledby="hotel-request-success-title">
      <div className="hotel-request-modal-card">
        {onClose ? <button type="button" className="hotel-request-modal-close" aria-label="Close confirmation and continue editing" onClick={onClose}>×</button> : null}
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
