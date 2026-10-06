"use client";

import { useActionState, useEffect, useMemo, useRef, useState, useTransition, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { saveVehicle } from "@/actions/rental-admin";
import { Field } from "@/components/forms/Field";
import { Button, ButtonLink } from "@/components/ui/Button";
import { ImageUploader } from "@/components/ui/ImageUploader";
import { tourImageFrames } from "@/lib/tours/image-frames";
import { MultiSearchableSelect, SearchableSelect } from "@/components/ui/SearchableSelect";
import { initialFormState } from "@/lib/forms";
import { appliesToFleet, fleetLabel, vehicleBaseStatuses, vehicleStatusLabel } from "@/lib/rentals/labels";

type Option = {
  id: string;
  name: string;
  appliesTo: string;
  active: boolean;
  price: number;
  priceUnit: string;
};

type ImageItem = { url: string; key: string; driver: "local" | "cloudinary" };

export type VehicleFormValues = {
  id?: string;
  name: string;
  registrationNumber: string;
  kind: "car" | "bike";
  brand: string;
  modelName: string;
  year: string;
  summary: string;
  description: string;
  destinationId: string;
  vehicleTypeId: string;
  fuelTypeId: string;
  transmissionId: string;
  seats: string;
  doors: string;
  luggage: string;
  includedKmPerDay: string;
  status: string;
  published: boolean;
  allowCounterPickup: boolean;
  allowHomeDelivery: boolean;
  pricePerDay: string;
  pricePerWeek: string;
  pricePerMonth: string;
  securityDeposit: string;
  extraKmCharge: string;
  lateReturnCharge: string;
  discountType: string;
  discountValue: string;
  featureIds: string[];
  addonIds: string[];
  locationIds: string[];
  images: ImageItem[];
};

const DATA_STEPS = [
  { id: "vehicle", title: "Vehicle", description: "Name, fleet, and home destination" },
  { id: "specs", title: "Specifications", description: "Type, fuel, transmission, and features" },
  { id: "pricing", title: "Pricing", description: "Daily rates, deposit, and add-ons" },
  { id: "handover", title: "Handover", description: "Pickup, delivery, and locations" },
  { id: "images", title: "Images", description: "Cover photo and gallery" },
] as const;

const EXTRA_STEPS = [
  { id: "documents", title: "Documents", description: "Registration, insurance, and expiry" },
  { id: "availability", title: "Availability", description: "Bookings, holds, and maintenance" },
] as const;

type StepId = (typeof DATA_STEPS)[number]["id"] | (typeof EXTRA_STEPS)[number]["id"];

function fieldValue(form: HTMLFormElement, name: string) {
  const element = form.elements.namedItem(name);
  if (element instanceof RadioNodeList) return element.value;
  if (
    element instanceof HTMLInputElement ||
    element instanceof HTMLSelectElement ||
    element instanceof HTMLTextAreaElement
  ) {
    return element.value;
  }
  return "";
}

export function VehicleForm({
  values,
  kinds,
  destinations,
  types,
  fuels,
  transmissions,
  features,
  addons,
  locations,
  systemPickup,
  systemDelivery,
  initialStep = 0,
  documents,
  calendar,
}: {
  values: VehicleFormValues;
  kinds: Array<"car" | "bike">;
  destinations: { id: string; name: string }[];
  types: Option[];
  fuels: Option[];
  transmissions: Option[];
  features: Option[];
  addons: Option[];
  locations: { id: string; name: string; address: string }[];
  systemPickup: boolean;
  systemDelivery: boolean;
  initialStep?: number;
  documents?: ReactNode;
  calendar?: ReactNode;
}) {
  const isEdit = Boolean(values.id);
  const steps = useMemo(
    () => (isEdit ? [...DATA_STEPS, ...EXTRA_STEPS] : [...DATA_STEPS]),
    [isEdit],
  );
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const pendingContinueRef = useRef(false);
  const pendingDraftRef = useRef(false);
  const pendingPublishRef = useRef(false);
  const [step, setStep] = useState(() =>
    Math.min(Math.max(initialStep, 0), steps.length - 1),
  );
  const [vehicleId, setVehicleId] = useState(values.id ?? "");
  const [kind, setKind] = useState(values.kind);
  const [destinationId, setDestinationId] = useState(values.destinationId);
  const [status, setStatus] = useState(values.status);
  const [vehicleTypeId, setVehicleTypeId] = useState(values.vehicleTypeId);
  const [fuelTypeId, setFuelTypeId] = useState(values.fuelTypeId);
  const [transmissionId, setTransmissionId] = useState(values.transmissionId);
  const [discountType, setDiscountType] = useState(values.discountType);
  const [featureIds, setFeatureIds] = useState(values.featureIds);
  const [addonIds, setAddonIds] = useState(values.addonIds);
  const [locationIds, setLocationIds] = useState(values.locationIds);
  const [allowCounterPickup, setAllowCounterPickup] = useState(values.allowCounterPickup);
  const [allowHomeDelivery, setAllowHomeDelivery] = useState(values.allowHomeDelivery);
  const [images, setImages] = useState(values.images);
  const [uploading, setUploading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [saveMode, setSaveMode] = useState<"continue" | "draft" | "publish" | null>(null);
  const [state, action] = useActionState(saveVehicle, initialFormState);
  const [pending, startTransition] = useTransition();

  const visible = useMemo(
    () => ({
      types: types.filter((item) => item.active && appliesToFleet(item.appliesTo, kind)),
      fuels: fuels.filter((item) => item.active && appliesToFleet(item.appliesTo, kind)),
      transmissions: transmissions.filter((item) => item.active && appliesToFleet(item.appliesTo, kind)),
      features: features.filter((item) => item.active && appliesToFleet(item.appliesTo, kind)),
      addons: addons.filter((item) => item.active && appliesToFleet(item.appliesTo, kind)),
    }),
    [addons, features, fuels, kind, transmissions, types],
  );

  const current = steps[step];
  const dataStep = DATA_STEPS.some((item) => item.id === current.id);

  useEffect(() => {
    setVehicleTypeId((currentId) => (visible.types.some((item) => item.id === currentId) ? currentId : ""));
    setFuelTypeId((currentId) => (visible.fuels.some((item) => item.id === currentId) ? currentId : ""));
    setTransmissionId((currentId) =>
      visible.transmissions.some((item) => item.id === currentId) ? currentId : "",
    );
    setFeatureIds((currentIds) => currentIds.filter((id) => visible.features.some((item) => item.id === id)));
    setAddonIds((currentIds) => currentIds.filter((id) => visible.addons.some((item) => item.id === id)));
  }, [visible]);

  useEffect(() => {
    if (state.error) {
      pendingContinueRef.current = false;
      pendingDraftRef.current = false;
      pendingPublishRef.current = false;
      setSaveMode(null);
      setFormError(state.error);
      return;
    }
    if (!state.success) return;
    if (state.vehicleId) setVehicleId(state.vehicleId);

    if (pendingContinueRef.current) {
      pendingContinueRef.current = false;
      setSaveMode(null);
      setFormError(null);
      if (!values.id && state.vehicleId) {
        router.replace(`/admin/rentals/fleet/${state.vehicleId}?step=${step + 1}`);
        return;
      }
      setStep((currentStep) => Math.min(currentStep + 1, steps.length - 1));
      return;
    }

    if (pendingDraftRef.current || pendingPublishRef.current) {
      pendingDraftRef.current = false;
      pendingPublishRef.current = false;
      setSaveMode(null);
      router.push("/admin/rentals/fleet?saved=1");
      router.refresh();
    }
  }, [router, state, step, steps.length, values.id]);

  function validateStep(index: number) {
    const form = formRef.current;
    const errors: Record<string, string> = {};
    if (!form) return errors;
    const id = steps[index]?.id;
    if (id === "vehicle") {
      if (fieldValue(form, "name").trim().length < 2) errors.name = "Enter the vehicle name.";
      if (fieldValue(form, "registrationNumber").replace(/[\s-]/g, "").length < 4) {
        errors.registrationNumber = "Enter the registration number.";
      }
      if (!destinationId) errors.destinationId = "Choose a destination.";
    }
    if (id === "specs") {
      if (!vehicleTypeId) errors.vehicleTypeId = "Choose a vehicle type.";
      if (!fuelTypeId) errors.fuelTypeId = "Choose a fuel type.";
      if (!transmissionId) errors.transmissionId = "Choose a transmission.";
      const seats = Number(fieldValue(form, "seats"));
      if (!Number.isInteger(seats) || seats < 1) errors.seats = "Enter the number of seats.";
    }
    if (id === "pricing") {
      const price = Number(fieldValue(form, "pricePerDay"));
      if (!Number.isInteger(price) || price < 1) errors.pricePerDay = "Enter a daily price.";
    }
    if (id === "handover") {
      if (!allowCounterPickup && !allowHomeDelivery) {
        errors.handover = "Choose pickup, delivery, or both.";
      }
    }
    return errors;
  }

  function showErrors(errors: Record<string, string>, index: number) {
    setFormError(null);
    setFieldErrors(errors);
    setStep(index);
  }

  function submit(intent: "continue" | "draft" | "publish") {
    if (uploading) {
      setFormError("Wait for image uploads to finish.");
      return;
    }
    const form = formRef.current;
    if (!form) return;

    if (intent === "publish") {
      const errorsByStep = DATA_STEPS.map((_, index) => validateStep(index));
      const firstBad = errorsByStep.findIndex((errors) => Object.keys(errors).length > 0);
      if (firstBad >= 0) {
        showErrors(errorsByStep[firstBad], firstBad);
        return;
      }
    } else {
      const errors = validateStep(0);
      if (intent === "continue" && dataStep) Object.assign(errors, validateStep(step));
      if (Object.keys(errors).length > 0) {
        const index = errors.name || errors.destinationId || errors.registrationNumber ? 0 : step;
        showErrors(errors, index);
        return;
      }
    }

    const intentInput = form.elements.namedItem("intent");
    if (intentInput instanceof HTMLInputElement) intentInput.value = intent;
    setFormError(null);
    setFieldErrors({});
    setSaveMode(intent);
    pendingContinueRef.current = intent === "continue";
    pendingDraftRef.current = intent === "draft";
    pendingPublishRef.current = intent === "publish";
    startTransition(() => action(new FormData(form)));
  }

  function goBack() {
    setFormError(null);
    setFieldErrors({});
    setStep((currentStep) => Math.max(currentStep - 1, 0));
  }

  function goNextExtra() {
    setFormError(null);
    setFieldErrors({});
    setStep((currentStep) => Math.min(currentStep + 1, steps.length - 1));
  }

  return (
    <div className="flex min-h-0 w-full min-w-0 flex-1 flex-col gap-3 overflow-hidden">
      <ol className="grid w-full min-w-0 shrink-0 grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-7">
        {steps.map((item, index) => {
          const active = index === step;
          return (
            <li key={item.id} className="min-w-0">
              <button
                type="button"
                onClick={() => setStep(index)}
                title={item.description}
                className={[
                  "flex w-full min-w-0 items-center gap-2 rounded-lg border px-2.5 py-2 text-left transition-colors",
                  active ? "border-brand bg-brand-soft" : "border-line bg-white hover:bg-surface",
                ].join(" ")}
              >
                <span
                  className={[
                    "flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold",
                    active ? "bg-brand text-white" : "bg-white text-muted ring-1 ring-line",
                  ].join(" ")}
                >
                  {index + 1}
                </span>
                <span className="min-w-0 truncate text-xs font-semibold text-navy">{item.title}</span>
              </button>
            </li>
          );
        })}
      </ol>

      {formError ? (
        <p role="alert" className="shrink-0 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
          {formError}
        </p>
      ) : null}

      <form
        ref={formRef}
        className={dataStep ? "flex min-h-0 w-full min-w-0 flex-1 flex-col overflow-hidden rounded-lg border border-line bg-white" : "hidden"}
        onSubmit={(event) => event.preventDefault()}
      >
        {vehicleId ? <input type="hidden" name="id" value={vehicleId} /> : null}
        <input type="hidden" name="intent" defaultValue="continue" />
        <input type="hidden" name="imagesJson" value={JSON.stringify(images)} />

        <div className="flex shrink-0 items-center justify-between gap-3 border-b border-line px-4 py-3 sm:px-5">
          <div className="min-w-0">
            <h2 className="text-sm font-semibold text-navy">{current.title}</h2>
            <p className="mt-0.5 truncate text-xs text-muted">{current.description}</p>
          </div>
          {isEdit ? (
            <Button type="button" size="sm" className="shrink-0" onClick={() => submit("publish")} disabled={pending || uploading}>
              {pending && saveMode === "publish" ? "Publishing…" : "Save and publish"}
            </Button>
          ) : null}
        </div>

        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain px-4 py-4 sm:px-5">
          <div className={current.id === "vehicle" ? "grid gap-4 md:grid-cols-2" : "hidden"}>
            <Field label="Name" name="name" required error={fieldErrors.name}>
              <input name="name" defaultValue={values.name} className="!h-10" />
            </Field>
            <Field label="Registration number" name="registrationNumber" required error={fieldErrors.registrationNumber}>
              <input
                name="registrationNumber"
                defaultValue={values.registrationNumber}
                className="!h-10 uppercase"
                autoCapitalize="characters"
                placeholder="JK01AB1234"
              />
            </Field>
            <Field label="Fleet" required>
              <SearchableSelect
                name="kind"
                value={kind}
                onChange={(value) => setKind(value === "bike" ? "bike" : "car")}
                ariaLabel="Fleet"
                searchPlaceholder="Search fleet"
                className="!h-10"
                options={kinds.map((item) => ({ value: item, label: fleetLabel(item) }))}
              />
            </Field>
            <Field label="Brand">
              <input name="brand" defaultValue={values.brand} className="!h-10" />
            </Field>
            <Field label="Model">
              <input name="modelName" defaultValue={values.modelName} className="!h-10" />
            </Field>
            <Field label="Year">
              <input name="year" defaultValue={values.year} inputMode="numeric" className="!h-10" />
            </Field>
            <Field label="Home destination" name="destinationId" required error={fieldErrors.destinationId}>
              <SearchableSelect
                name="destinationId"
                value={destinationId}
                onChange={setDestinationId}
                emptyLabel="Choose"
                ariaLabel="Home destination"
                searchPlaceholder="Search destinations"
                invalid={Boolean(fieldErrors.destinationId)}
                className="!h-10"
                options={destinations.map((destination) => ({
                  value: destination.id,
                  label: destination.name,
                }))}
              />
            </Field>
            <Field label="Summary" hint="Shown on cards and the detail page.">
              <input name="summary" defaultValue={values.summary} className="!h-10" />
            </Field>
            <Field label="Status">
              <SearchableSelect
                name="status"
                value={status}
                onChange={setStatus}
                ariaLabel="Status"
                searchPlaceholder="Search statuses"
                className="!h-10"
                options={vehicleBaseStatuses.map((item) => ({
                  value: item,
                  label: vehicleStatusLabel(item),
                }))}
              />
            </Field>
            <div className="md:col-span-2">
              <Field label="Description">
                <textarea name="description" defaultValue={values.description} rows={4} className="!min-h-0 resize-y" />
              </Field>
            </div>
          </div>

          <div className={current.id === "specs" ? "grid gap-4" : "hidden"}>
            <div className="grid gap-4 md:grid-cols-3">
              <Field label="Vehicle type" name="vehicleTypeId" required error={fieldErrors.vehicleTypeId}>
                <SearchableSelect
                  name="vehicleTypeId"
                  value={vehicleTypeId}
                  onChange={setVehicleTypeId}
                  emptyLabel="Choose"
                  ariaLabel="Vehicle type"
                  searchPlaceholder="Search vehicle types"
                  invalid={Boolean(fieldErrors.vehicleTypeId)}
                  className="!h-10"
                  options={visible.types.map((item) => ({ value: item.id, label: item.name }))}
                />
              </Field>
              <Field label="Fuel" name="fuelTypeId" required error={fieldErrors.fuelTypeId}>
                <SearchableSelect
                  name="fuelTypeId"
                  value={fuelTypeId}
                  onChange={setFuelTypeId}
                  emptyLabel="Choose"
                  ariaLabel="Fuel"
                  searchPlaceholder="Search fuel types"
                  invalid={Boolean(fieldErrors.fuelTypeId)}
                  className="!h-10"
                  options={visible.fuels.map((item) => ({ value: item.id, label: item.name }))}
                />
              </Field>
              <Field label="Transmission" name="transmissionId" required error={fieldErrors.transmissionId}>
                <SearchableSelect
                  name="transmissionId"
                  value={transmissionId}
                  onChange={setTransmissionId}
                  emptyLabel="Choose"
                  ariaLabel="Transmission"
                  searchPlaceholder="Search transmissions"
                  invalid={Boolean(fieldErrors.transmissionId)}
                  className="!h-10"
                  options={visible.transmissions.map((item) => ({ value: item.id, label: item.name }))}
                />
              </Field>
              <Field label="Seats" name="seats" required error={fieldErrors.seats}>
                <input name="seats" type="number" min={1} defaultValue={values.seats} className="!h-10" />
              </Field>
              <Field label="Doors">
                <input name="doors" type="number" min={0} defaultValue={values.doors} className="!h-10" />
              </Field>
              <Field label="Luggage pieces">
                <input name="luggage" type="number" min={0} defaultValue={values.luggage} className="!h-10" />
              </Field>
              <Field label="Included km / day" hint="0 means unlimited.">
                <input name="includedKmPerDay" type="number" min={0} defaultValue={values.includedKmPerDay} className="!h-10" />
              </Field>
            </div>
            <Field label="Features">
              {featureIds.map((id) => (
                <input key={id} type="hidden" name="featureIds" value={id} />
              ))}
              <MultiSearchableSelect
                values={featureIds}
                onChange={setFeatureIds}
                placeholder="Choose features"
                searchPlaceholder="Search features"
                ariaLabel="Features"
                options={visible.features.map((feature) => ({
                  value: feature.id,
                  label: feature.name,
                }))}
              />
            </Field>
          </div>

          <div className={current.id === "pricing" ? "grid gap-4 md:grid-cols-2" : "hidden"}>
            <Field label="Daily price" name="pricePerDay" required error={fieldErrors.pricePerDay}>
              <input name="pricePerDay" type="number" min={0} defaultValue={values.pricePerDay} className="!h-10" />
            </Field>
            <Field label="Weekly price" hint="Used for each full week. Leave 0 to bill those days daily.">
              <input name="pricePerWeek" type="number" min={0} defaultValue={values.pricePerWeek} className="!h-10" />
            </Field>
            <Field label="Monthly price" hint="Used for each full 30 days.">
              <input name="pricePerMonth" type="number" min={0} defaultValue={values.pricePerMonth} className="!h-10" />
            </Field>
            <Field label="Security deposit">
              <input name="securityDeposit" type="number" min={0} defaultValue={values.securityDeposit} className="!h-10" />
            </Field>
            <Field label="Extra km charge">
              <input name="extraKmCharge" type="number" min={0} defaultValue={values.extraKmCharge} className="!h-10" />
            </Field>
            <Field label="Late return / hour">
              <input name="lateReturnCharge" type="number" min={0} defaultValue={values.lateReturnCharge} className="!h-10" />
            </Field>
            <Field label="Discount">
              <SearchableSelect
                name="discountType"
                value={discountType}
                onChange={setDiscountType}
                ariaLabel="Discount"
                searchPlaceholder="Search discounts"
                className="!h-10"
                options={[
                  { value: "none", label: "None" },
                  { value: "percent", label: "Percent off the base rental" },
                  { value: "flat", label: "Flat amount off the base rental" },
                ]}
              />
            </Field>
            <Field label="Discount value">
              <input name="discountValue" type="number" min={0} defaultValue={values.discountValue} className="!h-10" />
            </Field>
            <div className="md:col-span-2">
              <Field label="Add-ons offered with this vehicle">
                {addonIds.map((id) => (
                  <input key={id} type="hidden" name="addonIds" value={id} />
                ))}
                <MultiSearchableSelect
                  values={addonIds}
                  onChange={setAddonIds}
                  placeholder="Choose add-ons"
                  searchPlaceholder="Search add-ons"
                  ariaLabel="Add-ons"
                  options={visible.addons.map((addon) => ({
                    value: addon.id,
                    label: `${addon.name} · ${addon.price} ${addon.priceUnit === "per_day" ? "/ day" : "flat"}`,
                  }))}
                />
              </Field>
            </div>
          </div>

          <div className={current.id === "handover" ? "grid gap-4" : "hidden"}>
            <p className="text-sm text-muted">
              A customer can use an option only when it is on here and in rental settings. Settings currently{" "}
              {systemPickup ? "allow" : "do not allow"} counter pickup and {systemDelivery ? "allow" : "do not allow"} home delivery.
            </p>
            {fieldErrors.handover ? <p className="text-xs text-red-700">{fieldErrors.handover}</p> : null}
            <label className="flex items-center gap-3 rounded-lg border border-line px-3 py-2.5 text-sm">
              <input
                type="checkbox"
                name="allowCounterPickup"
                checked={allowCounterPickup}
                onChange={(event) => setAllowCounterPickup(event.target.checked)}
                className="h-4 w-4 accent-brand"
              />
              Customer can pick up and return at a location
            </label>
            <label className="flex items-center gap-3 rounded-lg border border-line px-3 py-2.5 text-sm">
              <input
                type="checkbox"
                name="allowHomeDelivery"
                checked={allowHomeDelivery}
                onChange={(event) => setAllowHomeDelivery(event.target.checked)}
                className="h-4 w-4 accent-brand"
              />
              Vehicle can be delivered to the customer
            </label>
            <Field label="Pickup locations" hint="Leave none selected to offer every active location.">
              {locationIds.map((id) => (
                <input key={id} type="hidden" name="locationIds" value={id} />
              ))}
              <MultiSearchableSelect
                values={locationIds}
                onChange={setLocationIds}
                placeholder="All active locations"
                searchPlaceholder="Search locations"
                ariaLabel="Pickup locations"
                options={locations.map((location) => ({
                  value: location.id,
                  label: location.address ? `${location.name} · ${location.address}` : location.name,
                }))}
              />
            </Field>
          </div>

          <div className={current.id === "images" ? "grid gap-3" : "hidden"}>
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-medium text-navy">Photos</p>
              <p className="text-xs text-muted">The first photo is the cover.</p>
            </div>
            <ul className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {images.map((image, index) => (
                <li key={image.key || image.url} className="relative overflow-hidden rounded-lg border border-line">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={image.url} alt="" className="aspect-[4/3] w-full object-cover" />
                  <span className="absolute bottom-1 left-1 rounded bg-white/90 px-1.5 py-0.5 text-[11px] font-medium text-navy">
                    {index === 0 ? "Cover" : `Photo ${index + 1}`}
                  </span>
                  <button
                    type="button"
                    aria-label="Remove photo"
                    className="absolute top-1 right-1 flex size-5 items-center justify-center rounded-full bg-white/90 text-xs text-red-700"
                    onClick={() => setImages(images.filter((item) => item !== image))}
                  >
                    ×
                  </button>
                </li>
              ))}
              <li>
                <ImageUploader
                  folder="vehicles"
                  label=""
                  tile
                  multiple
                  frame={tourImageFrames.gallery}
                  value={null}
                  onChange={(value) => {
                    if (!value) return;
                    setImages((currentImages) => [...currentImages, value]);
                  }}
                  onBusyChange={setUploading}
                  withHiddenFields={false}
                />
              </li>
            </ul>
          </div>
        </div>
      </form>

      {!dataStep ? (
        <div className="flex min-h-0 w-full min-w-0 flex-1 flex-col overflow-hidden rounded-lg border border-line bg-white">
          <div className="flex shrink-0 items-center justify-between gap-3 border-b border-line px-4 py-3 sm:px-5">
            <div className="min-w-0">
              <h2 className="text-sm font-semibold text-navy">{current.title}</h2>
              <p className="mt-0.5 truncate text-xs text-muted">{current.description}</p>
            </div>
            <Button type="button" size="sm" className="shrink-0" onClick={() => submit("publish")} disabled={pending || uploading}>
              {pending && saveMode === "publish" ? "Publishing…" : "Save and publish"}
            </Button>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-4 sm:px-5">
            {current.id === "documents" ? documents : calendar}
          </div>
        </div>
      ) : null}

      <div className="shrink-0 rounded-lg border border-line bg-white px-4 py-3 sm:px-5">
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-between">
          <ButtonLink href="/admin/rentals/fleet" variant="secondary" size="sm" className="w-full sm:w-auto">
            Cancel
          </ButtonLink>
          <div className="flex flex-col-reverse gap-2 sm:flex-row">
            {step > 0 ? (
              <Button type="button" variant="secondary" size="sm" className="w-full sm:w-auto" onClick={goBack} disabled={pending}>
                Back
              </Button>
            ) : null}
            {dataStep && step < steps.length - 1 ? (
              <Button type="button" size="sm" className="w-full sm:w-auto" onClick={() => submit("continue")} disabled={pending || uploading}>
                {pending && saveMode === "continue" ? "Saving…" : "Save and continue"}
              </Button>
            ) : null}
            {!dataStep && step < steps.length - 1 ? (
              <Button type="button" size="sm" className="w-full sm:w-auto" onClick={goNextExtra}>
                Continue
              </Button>
            ) : null}
            {isEdit && step === steps.length - 1 ? (
              <Button type="button" variant="secondary" size="sm" className="w-full sm:w-auto" onClick={() => submit("draft")} disabled={pending || uploading}>
                {pending && saveMode === "draft" ? "Saving…" : "Save draft"}
              </Button>
            ) : null}
            {!isEdit && step === steps.length - 1 ? (
              <Button type="button" size="sm" className="w-full sm:w-auto" onClick={() => submit("publish")} disabled={pending || uploading}>
                {pending && saveMode === "publish" ? "Publishing…" : "Publish"}
              </Button>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
