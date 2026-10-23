"use client";

import Link from "next/link";
import { createContext, useCallback, useContext, useEffect, useId, useMemo, useRef, useState, type ReactNode, type RefObject } from "react";
import { BookingCheckout } from "@/components/rentals/BookingCheckout";
import { PlaceFields, startingPlace, type PlaceValue } from "@/components/rentals/PlaceFields";
import { RentalIcon, type RentalIconName } from "@/components/rentals/rental-icons";
import { Modal } from "@/components/ui/Modal";
import { formatPhone } from "@/lib/auth/phone";
import { formatMoney } from "@/lib/format";
import { parseMapPoint } from "@/lib/maps";
import {
  earliestPickupLocal,
  pickupLeadMessage,
  resolvePickupLocal,
  resolveReturnLocal,
} from "@/lib/rentals/dates";

type LocationOption = { id: string; name: string; address: string };
type AddonOption = { id: string; name: string; price: number; priceUnit: string };
type DocType = {
  id: string;
  name: string;
  description: string;
  requiresNumber: boolean;
  requiresIssueDate: boolean;
  requiresExpiry: boolean;
};
type SavedDoc = {
  configId: string;
  typeName: string;
  fileUrl: string;
  fileKey: string;
  fileDriver: "local" | "cloudinary";
  fileResource: "image" | "raw";
  number: string;
  issueDate: string;
  expiryDate: string;
};

export type RentalBookingOptions = {
  slug: string;
  vehicleId: string;
  vehicleName: string;
  currency: string;
  pricePerDay: number;
  signedIn: boolean;
  rider: { name: string; phone: string } | null;
  loginHref: string;
  counter: boolean;
  delivery: boolean;
  locations: LocationOption[];
  addons: AddonOption[];
  documents: DocType[];
  savedDocuments: SavedDoc[];
  defaultPickup: string;
  defaultReturn: string;
  defaultLocationId: string;
  mapApiKey: string;
  savedAddress: string;
  savedLat: string;
  savedLng: string;
};

const BookContext = createContext<(() => void) | null>(null);

export function RentalBookProvider({
  booking,
  children,
}: {
  booking: RentalBookingOptions;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  return (
    <BookContext.Provider value={() => setOpen(true)}>
      {children}
      <BookRentalModal booking={booking} open={open} onClose={() => setOpen(false)} />
    </BookContext.Provider>
  );
}

export function BookNowButton({
  className,
  children,
  disabled = false,
  signedIn = false,
  loginHref = "/login",
}: {
  className?: string;
  children: ReactNode;
  disabled?: boolean;
  signedIn?: boolean;
  loginHref?: string;
}) {
  const open = useContext(BookContext);
  if (disabled || !open) {
    return <span className={`${className ?? ""} is-disabled`.trim()}>{children}</span>;
  }
  if (!signedIn) {
    return (
      <Link href={loginHref} className={className}>
        {children}
      </Link>
    );
  }
  return (
    <button type="button" className={className} onClick={open}>
      {children}
    </button>
  );
}

function FieldIcon({
  name,
  label,
  invalid = false,
  children,
}: {
  name: RentalIconName;
  label: string;
  invalid?: boolean;
  children: ReactNode;
}) {
  return (
    <label className={invalid ? "rental-book__field is-invalid" : "rental-book__field"}>
      <span>
        <RentalIcon name={name} />
        {label}
      </span>
      {children}
    </label>
  );
}

function FieldError({ id, children }: { id: string; children: string }) {
  return (
    <p id={id} className="rental-book__field-error" role="alert">
      {children}
    </p>
  );
}

function DateTimeField({
  label,
  icon,
  value,
  error,
  inputRef,
  min,
  onChange,
}: {
  label: string;
  icon: RentalIconName;
  value: string;
  error?: string;
  inputRef?: RefObject<HTMLInputElement | null>;
  min?: string;
  onChange: (value: string) => void;
}) {
  const [picking, setPicking] = useState(false);
  const errorId = useId();
  return (
    <FieldIcon name={icon} label={label} invalid={Boolean(error)}>
      <input
        ref={inputRef}
        type={value || picking ? "datetime-local" : "text"}
        placeholder="Date and time"
        value={value}
        min={min || undefined}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        onInvalid={(event) => event.preventDefault()}
        onFocus={() => {
          setPicking(true);
          if (!value && min) onChange(min);
        }}
        onBlur={() => setPicking(false)}
        onChange={(event) => onChange(event.target.value)}
      />
      {error ? <FieldError id={errorId}>{error}</FieldError> : null}
    </FieldIcon>
  );
}

type StepErrors = {
  pickup?: string;
  return?: string;
  place?: string;
  address?: string;
  map?: string;
};

function dateProblems(pickup: string, ret: string): Pick<StepErrors, "pickup" | "return"> {
  const next: Pick<StepErrors, "pickup" | "return"> = {};
  const start = pickup ? new Date(pickup) : null;
  const end = ret ? new Date(ret) : null;
  if (!start || Number.isNaN(start.getTime())) {
    next.pickup = "Choose a pickup date and time.";
  } else {
    const lead = pickupLeadMessage(start);
    if (lead) next.pickup = lead;
  }
  if (!end || Number.isNaN(end.getTime())) {
    next.return = "Choose a return date and time.";
  } else if (start && !Number.isNaN(start.getTime()) && end <= start) {
    next.return = "Return must be after pickup.";
  }
  return next;
}

function BookRentalModal({
  booking,
  open,
  onClose,
}: {
  booking: RentalBookingOptions;
  open: boolean;
  onClose: () => void;
}) {
  const [pickup, setPickup] = useState(() => resolvePickupLocal(booking.defaultPickup));
  const [ret, setRet] = useState(() =>
    resolveReturnLocal(resolvePickupLocal(booking.defaultPickup), booking.defaultReturn),
  );
  const [place, setPlace] = useState<PlaceValue>(() =>
    startingPlace({
      counter: booking.counter,
      delivery: booking.delivery,
      locations: booking.locations,
      locationId: booking.defaultLocationId,
      address: booking.savedAddress,
      lat: booking.savedLat,
      lng: booking.savedLng,
    }),
  );
  const [addonIds, setAddonIds] = useState<string[]>([]);
  const [step, setStep] = useState<"dates" | "documents" | "notes">("dates");
  const [checkoutReady, setCheckoutReady] = useState(false);
  const [errors, setErrors] = useState<StepErrors>({});
  const pickupRef = useRef<HTMLInputElement>(null);
  const returnRef = useRef<HTMLInputElement>(null);
  const earliestPickup = earliestPickupLocal();

  useEffect(() => {
    if (!open) return;
    const nextPickup = resolvePickupLocal(booking.defaultPickup);
    setPickup(nextPickup);
    setRet(resolveReturnLocal(nextPickup, booking.defaultReturn));
  }, [booking.defaultPickup, booking.defaultReturn, open]);

  const returnPath = useMemo(() => {
    const params = new URLSearchParams({
      pickup,
      return: ret,
      mode: place.mode,
      returnMode: place.mode,
      location: place.mode === "counter" ? place.locationId : "",
      returnLocation: place.mode === "counter" ? place.locationId : "",
      address: place.mode === "delivery" ? place.address : "",
      returnAddress: place.mode === "delivery" ? place.address : "",
      deliveryLat: place.mode === "delivery" ? place.lat : "",
      deliveryLng: place.mode === "delivery" ? place.lng : "",
      same: "1",
    });
    for (const id of addonIds) params.append("addon", id);
    return `/rentals/${booking.slug}/book?${params.toString()}`;
  }, [addonIds, booking.slug, pickup, place, ret]);

  function close() {
    setStep("dates");
    setCheckoutReady(false);
    setErrors({});
    onClose();
  }

  function placeProblems(value: PlaceValue): Pick<StepErrors, "place" | "address" | "map"> {
    const next: Pick<StepErrors, "place" | "address" | "map"> = {};
    if (value.mode === "counter" && !value.locationId) {
      next.place = "The company location is not set yet.";
    }
    if (value.mode === "delivery" && value.address.trim().length < 8) {
      next.address = "Enter the full address.";
    }
    if (value.mode === "delivery" && booking.mapApiKey && !parseMapPoint(value.lat, value.lng)) {
      next.map = "Choose the pickup location on the map.";
    }
    return next;
  }

  function changePickup(value: string) {
    setPickup(value);
    setErrors((current) => {
      if (!current.pickup && !current.return) return current;
      const dates = dateProblems(value, ret);
      return { ...current, pickup: dates.pickup, return: dates.return };
    });
  }

  function changeReturn(value: string) {
    setRet(value);
    setErrors((current) => {
      if (!current.pickup && !current.return) return current;
      const dates = dateProblems(pickup, value);
      return { ...current, pickup: dates.pickup, return: dates.return };
    });
  }

  const changePlace = useCallback((value: PlaceValue) => {
    setPlace(value);
    setErrors((current) => {
      if (!current.place && !current.address && !current.map) return current;
      const next: Pick<StepErrors, "place" | "address" | "map"> = {};
      if (value.mode === "counter" && !value.locationId) {
        next.place = "The company location is not set yet.";
      }
      if (value.mode === "delivery" && value.address.trim().length < 8) {
        next.address = "Enter the full address.";
      }
      if (value.mode === "delivery" && booking.mapApiKey && !parseMapPoint(value.lat, value.lng)) {
        next.map = "Choose the pickup location on the map.";
      }
      return { ...current, place: next.place, address: next.address, map: next.map };
    });
  }, [booking.mapApiKey]);

  function toggleAddon(id: string) {
    setAddonIds((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]));
  }

  function continueBooking() {
    const next = { ...dateProblems(pickup, ret), ...placeProblems(place) };
    setErrors(next);
    if (next.pickup) {
      pickupRef.current?.focus();
      return;
    }
    if (next.return) {
      returnRef.current?.focus();
      return;
    }
    if (next.place || next.address || next.map) return;
    setCheckoutReady(true);
    setStep("documents");
  }

  const stepIndex = step === "dates" ? 0 : step === "documents" ? 1 : 2;
  const stepCopy = {
    dates: { title: `Book ${booking.vehicleName}`, description: "Pickup and return times." },
    documents: {
      title: "Documents",
      description:
        booking.documents.length > 0
          ? "Upload only the documents required for this booking."
          : "No documents are required for this booking.",
    },
    notes: { title: "Notes", description: "Add a note, then confirm." },
  }[step];

  const dayMs = 24 * 60 * 60 * 1000;
  const start = new Date(pickup);
  const end = new Date(ret);
  const days =
    pickup && ret && !Number.isNaN(start.getTime()) && !Number.isNaN(end.getTime()) && end > start
      ? Math.max(1, Math.ceil((end.getTime() - start.getTime()) / dayMs))
      : 0;

  return (
    <Modal
      open={open}
      onClose={close}
      size="lg"
      title={stepCopy.title}
      description={stepCopy.description}
    >
      <ol className="rental-book__steps" aria-label="Booking steps">
        {["Dates", "Documents", "Notes"].map((label, index) => (
          <li
            key={label}
            className={index === stepIndex ? "is-current" : index < stepIndex ? "is-done" : ""}
            aria-current={index === stepIndex ? "step" : undefined}
          >
            <span>{index < stepIndex ? "✓" : index + 1}</span>
            {label}
          </li>
        ))}
      </ol>
      {step === "dates" ? (
        <form
          className="rental-book"
          noValidate
          onSubmit={(event) => {
            event.preventDefault();
            continueBooking();
          }}
        >
          {booking.rider ? (
            <div className="rental-book__rider">
              <strong>{booking.rider.name}</strong>
              <span>{booking.rider.phone ? formatPhone(booking.rider.phone) : "Phone on your account"}</span>
            </div>
          ) : null}
          <div className="rental-book__grid">
            <DateTimeField
              label="Pickup"
              icon="calendar"
              value={pickup}
              error={errors.pickup}
              inputRef={pickupRef}
              min={earliestPickup}
              onChange={changePickup}
            />
            <DateTimeField
              label="Return"
              icon="clock"
              value={ret}
              error={errors.return}
              inputRef={returnRef}
              onChange={changeReturn}
            />
          </div>
          <PlaceFields
            counter={booking.counter}
            delivery={booking.delivery}
            locations={booking.locations}
            defaultLocationId={booking.defaultLocationId}
            defaultAddress={booking.savedAddress}
            defaultLat={booking.savedLat}
            defaultLng={booking.savedLng}
            mapApiKey={booking.mapApiKey}
            placeError={errors.place}
            addressError={errors.address}
            mapError={errors.map}
            onChange={changePlace}
          />
          {booking.addons.length > 0 ? (
            <fieldset className="rental-book__addons">
              <legend>
                <RentalIcon name="tag" />
                Add-ons
              </legend>
              {booking.addons.map((addon) => {
                const on = addonIds.includes(addon.id);
                return (
                  <button
                    key={addon.id}
                    type="button"
                    className={on ? "is-on" : ""}
                    aria-pressed={on}
                    onClick={() => toggleAddon(addon.id)}
                  >
                    <RentalIcon name={on ? "check" : "tag"} />
                    <span>{addon.name}</span>
                    <strong>
                      {formatMoney(addon.price, booking.currency)}
                      {addon.priceUnit === "per_day" ? " / day" : ""}
                    </strong>
                  </button>
                );
              })}
            </fieldset>
          ) : null}
          {days > 0 ? (
            <p className="rental-book__estimate">
              About {formatMoney(days * booking.pricePerDay, booking.currency)} for {days}{" "}
              {days === 1 ? "day" : "days"} at the daily rate.
              Weekly rates, tax, and the deposit are confirmed before you submit.
            </p>
          ) : null}
          <button type="submit" className="rental-detail__book">
            Continue
          </button>
        </form>
      ) : null}
      {checkoutReady ? (
        <div className="rental-book" hidden={step === "dates"}>
          <BookingCheckout
            signedIn={booking.signedIn}
            returnPath={returnPath}
            vehicleId={booking.vehicleId}
            pickupAt={pickup}
            returnAt={ret}
            pickupMode={place.mode}
            returnMode={place.mode}
            pickupLocationId={place.mode === "counter" ? place.locationId : ""}
            returnLocationId={place.mode === "counter" ? place.locationId : ""}
            deliveryAddress={place.mode === "delivery" ? place.address : ""}
            returnAddress={place.mode === "delivery" ? place.address : ""}
            deliveryLat={place.mode === "delivery" ? place.lat : ""}
            deliveryLng={place.mode === "delivery" ? place.lng : ""}
            sameReturn
            addonIds={addonIds}
            documents={booking.documents}
            savedDocuments={booking.savedDocuments}
            section={step === "notes" ? "notes" : "documents"}
            onBack={() => setStep(step === "notes" ? "documents" : "dates")}
            onContinue={() => setStep("notes")}
          />
        </div>
      ) : null}
    </Modal>
  );
}
