"use client";

import { useActionState, useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { saveHotel } from "@/actions/hotels";
import { HtmlEditor } from "@/components/admin/HtmlEditor";
import { LocationMapPicker } from "@/components/admin/LocationMapPicker";
import { Field } from "@/components/forms/Field";
import { FormMessage } from "@/components/forms/FormMessage";
import { Button, ButtonLink } from "@/components/ui/Button";
import { ImageUploader } from "@/components/ui/ImageUploader";
import { MultiSearchableSelect, SearchableSelect } from "@/components/ui/SearchableSelect";
import { packFaqs, type CatalogOption } from "@/lib/catalog";
import type { HotelCatalog } from "@/lib/catalog-query";
import { initialFormState } from "@/lib/forms";
import {
  bedTypes,
  mealPlans,
  propertyTypes,
  type MealPlan,
  type PropertyType,
} from "@/lib/hotels/options";
import { tourImageFrames } from "@/lib/tours/image-frames";
import type { GalleryItem } from "@/lib/tours/json";
import type { UploadedImage } from "@/lib/storage/types";

const STEPS = [
  { id: "general", title: "General", description: "Name, type, and stay times" },
  { id: "location", title: "Location", description: "Address and map" },
  { id: "content", title: "Content", description: "The hotel story" },
  { id: "property", title: "Property", description: "Amenities, rules, and questions" },
  { id: "rooms", title: "Rooms", description: "Price, features, and amenities per room" },
  { id: "images", title: "Images", description: "Banner, cover, and gallery" },
  { id: "seo", title: "SEO", description: "Search title and description" },
] as const;

type StepId = (typeof STEPS)[number]["id"];

export type HotelDestinationOption = {
  id: string;
  name: string;
  mapLat: string;
  mapLng: string;
  mapZoom: number;
};

export type HotelRoomValues = {
  id: string;
  name: string;
  summary: string;
  occupancy: number | null;
  bedType: string;
  sizeSqm: number | null;
  quantity: number | null;
  pricePerNight: number | null;
  extraGuestPrice: number | null;
  mealPlan: MealPlan;
  features: string[];
  amenities: string[];
  image: UploadedImage | null;
  active: boolean;
};

export type HotelFormValues = {
  id: string;
  name: string;
  summary: string;
  description: string;
  propertyType: PropertyType;
  starRating: number;
  checkIn: string;
  checkOut: string;
  currency: string;
  destinationId: string;
  address: string;
  mapLat: string;
  mapLng: string;
  mapZoom: number;
  amenities: string[];
  faqs: string[];
  extraFaqs: { title: string; content: string }[];
  cancellationPolicy: string;
  houseRules: string;
  isFeatured: boolean;
  seoIndex: boolean;
  seoTitle: string;
  seoDescription: string;
  published: boolean;
  cover: UploadedImage | null;
  banner: UploadedImage | null;
  seoImage: UploadedImage | null;
  gallery: GalleryItem[];
  rooms: HotelRoomValues[];
};

type RoomDraft = HotelRoomValues & { clientId: string };

type Draft = Omit<HotelFormValues, "id" | "cover" | "banner" | "seoImage" | "rooms" | "published"> & {
  cover: UploadedImage | null;
  banner: UploadedImage | null;
  seoImage: UploadedImage | null;
  rooms: RoomDraft[];
};

function blankRoom(): RoomDraft {
  return {
    clientId:
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `room-${Date.now()}`,
    id: "",
    name: "",
    summary: "",
    occupancy: 2,
    bedType: "",
    sizeSqm: null,
    quantity: 1,
    pricePerNight: null,
    extraGuestPrice: 0,
    mealPlan: "room_only",
    features: [],
    amenities: [],
    image: null,
    active: true,
  };
}

function roomIsBlank(room: RoomDraft) {
  return (
    !room.name.trim() &&
    !room.summary.trim() &&
    !room.bedType &&
    !room.image &&
    room.features.length === 0 &&
    room.amenities.length === 0 &&
    room.pricePerNight == null &&
    room.sizeSqm == null &&
    (room.extraGuestPrice == null || room.extraGuestPrice === 0) &&
    room.mealPlan === "room_only" &&
    room.active &&
    (room.occupancy == null || room.occupancy === 2) &&
    (room.quantity == null || room.quantity === 1)
  );
}

function optionalNumber(raw: string) {
  if (raw.trim() === "") return null;
  const value = Number(raw);
  return Number.isFinite(value) ? value : null;
}

function emptyDraft(): Draft {
  return {
    name: "",
    summary: "",
    description: "",
    propertyType: "hotel",
    starRating: 0,
    checkIn: "14:00",
    checkOut: "11:00",
    currency: "INR",
    destinationId: "",
    address: "",
    mapLat: "",
    mapLng: "",
    mapZoom: 14,
    amenities: [],
    faqs: [],
    extraFaqs: [],
    cancellationPolicy: "",
    houseRules: "",
    isFeatured: false,
    seoIndex: true,
    seoTitle: "",
    seoDescription: "",
    cover: null,
    banner: null,
    seoImage: null,
    gallery: [],
    rooms: [],
  };
}

function fromHotel(hotel: HotelFormValues): Draft {
  return {
    ...hotel,
    rooms: hotel.rooms.map((room) => ({
      ...room,
      clientId: room.id || blankRoom().clientId,
    })),
  };
}

function Stepper({
  current,
  onJump,
}: {
  current: number;
  onJump: (index: number) => void;
}) {
  return (
    <ol className="grid w-full min-w-0 grid-cols-2 gap-2 sm:grid-cols-4 xl:grid-cols-7">
      {STEPS.map((step, index) => {
        const active = index === current;
        return (
          <li key={step.id} className="min-w-0">
            <button
              type="button"
              onClick={() => onJump(index)}
              title={step.description}
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
              <span className="min-w-0 truncate text-xs font-semibold text-navy">
                {step.title}
              </span>
            </button>
          </li>
        );
      })}
    </ol>
  );
}

function catalogOptions(items: CatalogOption[]) {
  return items.map((item) => ({ value: item.id, label: item.title }));
}

export function HotelTabsForm({
  destinations,
  catalog,
  hotel,
  mapApiKey,
}: {
  destinations: HotelDestinationOption[];
  catalog: HotelCatalog;
  hotel?: HotelFormValues;
  mapApiKey: string;
}) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [draft, setDraft] = useState<Draft>(() =>
    hotel ? fromHotel(hotel) : emptyDraft(),
  );
  const [hotelId, setHotelId] = useState<string | null>(hotel?.id ?? null);
  const [imageBusy, setImageBusy] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [saveMode, setSaveMode] = useState<"continue" | "draft" | "publish" | null>(null);
  const pendingFocusRef = useRef<string | null>(null);
  const pendingContinueRef = useRef(false);
  const pendingDraftRef = useRef(false);
  const pendingPublishRef = useRef(false);
  const [state, action] = useActionState(saveHotel, initialFormState);
  const [pending, startTransition] = useTransition();
  const currentStepId: StepId = STEPS[step].id;

  useEffect(() => {
    if (state.error) {
      pendingContinueRef.current = false;
      pendingDraftRef.current = false;
      pendingPublishRef.current = false;
      setSaveMode(null);
      return;
    }
    if (!state.success) return;
    if (state.hotelId) setHotelId(state.hotelId);
    if (pendingContinueRef.current) {
      pendingContinueRef.current = false;
      setSaveMode(null);
      setStep((current) => Math.min(current + 1, STEPS.length - 1));
      return;
    }
    if (pendingDraftRef.current || pendingPublishRef.current) {
      pendingDraftRef.current = false;
      pendingPublishRef.current = false;
      setSaveMode(null);
      router.push("/admin/hotels?saved=1");
      router.refresh();
    }
  }, [state, router]);

  useEffect(() => {
    const name = pendingFocusRef.current;
    if (!name) return;
    pendingFocusRef.current = null;
    const timer = window.setTimeout(() => {
      const root = document.querySelector(`[data-field="${name}"]`);
      if (!(root instanceof HTMLElement)) return;
      root.scrollIntoView({ behavior: "smooth", block: "center" });
      root
        .querySelector<HTMLElement>(
          'input:not([type="hidden"]):not([type="file"]), textarea, select, button',
        )
        ?.focus({ preventScroll: true });
    }, 40);
    return () => window.clearTimeout(timer);
  }, [step, fieldErrors]);

  function patch<K extends keyof Draft>(key: K, value: Draft[K]) {
    setDraft((current) => ({ ...current, [key]: value }));
  }

  function updateRoom(clientId: string, next: Partial<RoomDraft>) {
    setDraft((current) => ({
      ...current,
      rooms: current.rooms.map((room) =>
        room.clientId === clientId ? { ...room, ...next } : room,
      ),
    }));
  }

  function chooseDestination(destinationId: string) {
    const next = destinations.find((item) => item.id === destinationId);
    setDraft((current) => {
      const previous = destinations.find((item) => item.id === current.destinationId);
      const blank = !current.mapLat.trim() && !current.mapLng.trim();
      const inherited = Boolean(
        previous &&
          current.mapLat.trim() === previous.mapLat &&
          current.mapLng.trim() === previous.mapLng,
      );
      const pin =
        next?.mapLat && next.mapLng && (blank || inherited)
          ? { mapLat: next.mapLat, mapLng: next.mapLng, mapZoom: next.mapZoom || 14 }
          : null;
      return { ...current, destinationId, ...(pin ?? {}) };
    });
    setFieldErrors((current) => {
      const nextErrors = { ...current };
      delete nextErrors.destinationId;
      return nextErrors;
    });
  }

  function collectErrors(publishing: boolean) {
    const errors: Record<string, string> = {};
    if (draft.name.trim().length < 2) errors.name = "Enter a hotel name.";
    if (publishing && draft.summary.trim().length < 10) {
      errors.summary = "Add a short description.";
    }
    if (publishing && !draft.destinationId) errors.destinationId = "Choose a destination.";
    if (publishing && !draft.checkIn) errors.checkIn = "Enter a check-in time.";
    if (publishing && !draft.checkOut) errors.checkOut = "Enter a check-out time.";

    draft.rooms.forEach((room, index) => {
      if (roomIsBlank(room)) return;
      if (room.name.trim().length < 2) errors[`room-${index}-name`] = "Enter a room name.";
      if (room.occupancy == null || room.occupancy < 1) {
        errors[`room-${index}-occupancy`] = "Enter how many guests can sleep here.";
      }
      if (room.quantity == null || room.quantity < 1) {
        errors[`room-${index}-quantity`] = "Enter how many of this room you have.";
      }
      if (room.pricePerNight == null || room.pricePerNight < 0) {
        errors[`room-${index}-price`] = "Enter a nightly price.";
      }
    });
    const sellable = draft.rooms.some(
      (room) => !roomIsBlank(room) && room.active && room.name.trim().length >= 2,
    );
    if (publishing && !sellable) {
      errors.rooms = "Add at least one room you can sell.";
    }

    if (publishing && !draft.banner) errors.banner = "Upload a banner image.";
    if (publishing && !draft.cover) errors.cover = "Upload a cover image for cards.";
    if (publishing && draft.seoTitle.trim().length < 2) errors.seoTitle = "Add an SEO title.";
    if (publishing && draft.seoDescription.trim().length < 10) {
      errors.seoDescription = "Add an SEO description.";
    }

    const stepFor = (key: string): number => {
      if (
        key === "name" ||
        key === "summary" ||
        key === "destinationId" ||
        key === "checkIn" ||
        key === "checkOut"
      ) {
        return 0;
      }
      if (key === "rooms" || key.startsWith("room-")) return 4;
      if (key === "banner" || key === "cover") return 5;
      return 6;
    };
    const first = Object.keys(errors)[0];
    return { errors, step: first ? stepFor(first) : step };
  }

  function showErrors(errors: Record<string, string>, jumpStep: number) {
    const first = Object.keys(errors)[0];
    setFormError(errors.rooms ?? null);
    setFieldErrors(errors);
    if (first) pendingFocusRef.current = first === "rooms" ? "room-0-name" : first;
    if (jumpStep !== step) setStep(jumpStep);
  }

  function buildFormData(publish: boolean) {
    const formData = new FormData();
    if (hotelId) formData.set("hotelId", hotelId);
    formData.set("name", draft.name.trim());
    formData.set("summary", draft.summary.trim());
    formData.set("description", draft.description);
    formData.set("propertyType", draft.propertyType);
    formData.set("starRating", String(draft.starRating));
    formData.set("checkIn", draft.checkIn);
    formData.set("checkOut", draft.checkOut);
    formData.set("currency", draft.currency.trim().toUpperCase() || "INR");
    formData.set("destinationId", draft.destinationId);
    formData.set("address", draft.address.trim());
    formData.set("mapLat", draft.mapLat.trim());
    formData.set("mapLng", draft.mapLng.trim());
    formData.set("mapZoom", String(draft.mapZoom));
    formData.set("amenitiesJson", JSON.stringify(draft.amenities));
    formData.set("faqsJson", JSON.stringify(packFaqs(draft.faqs, draft.extraFaqs)));
    formData.set("cancellationPolicy", draft.cancellationPolicy.trim());
    formData.set("houseRules", draft.houseRules.trim());
    formData.set("seoTitle", draft.seoTitle.trim());
    formData.set("seoDescription", draft.seoDescription.trim());
    formData.set("galleryJson", JSON.stringify(draft.gallery));
    formData.set(
      "roomsJson",
      JSON.stringify(
        draft.rooms.filter((room) => !roomIsBlank(room)).map((room) => ({
          id: room.id,
          name: room.name.trim(),
          summary: room.summary.trim(),
          occupancy: room.occupancy,
          bedType: room.bedType,
          sizeSqm: room.sizeSqm,
          quantity: room.quantity,
          pricePerNight: room.pricePerNight,
          extraGuestPrice: room.extraGuestPrice ?? 0,
          mealPlan: room.mealPlan,
          features: room.features,
          amenities: room.amenities,
          imageUrl: room.image?.url ?? "",
          imageKey: room.image?.key ?? "",
          imageDriver: room.image?.driver ?? "",
          active: room.active,
        })),
      ),
    );
    if (publish) formData.set("published", "on");
    if (draft.isFeatured) formData.set("isFeatured", "on");
    if (draft.seoIndex) formData.set("seoIndex", "on");
    if (draft.cover) {
      formData.set("imageUrl", draft.cover.url);
      formData.set("imageKey", draft.cover.key);
      formData.set("imageDriver", draft.cover.driver);
    }
    if (draft.banner) {
      formData.set("featuredImageUrl", draft.banner.url);
      formData.set("featuredImageKey", draft.banner.key);
      formData.set("featuredImageDriver", draft.banner.driver);
    }
    if (draft.seoImage) {
      formData.set("seoImageUrl", draft.seoImage.url);
      formData.set("seoImageKey", draft.seoImage.key);
      formData.set("seoImageDriver", draft.seoImage.driver);
    }
    return formData;
  }

  function submit(mode: "continue" | "draft" | "publish") {
    const publishing = mode === "publish" || Boolean(hotel?.published);
    const { errors, step: jumpStep } = collectErrors(publishing);
    if (Object.keys(errors).length > 0) {
      showErrors(errors, jumpStep);
      return;
    }
    setFormError(null);
    setFieldErrors({});
    setSaveMode(mode);
    pendingContinueRef.current = mode === "continue";
    pendingDraftRef.current = mode === "draft";
    pendingPublishRef.current = mode === "publish";
    startTransition(() => action(buildFormData(publishing)));
  }

  const keptRooms = draft.rooms.filter((room) => !roomIsBlank(room));

  return (
    <div className="flex min-h-0 w-full min-w-0 flex-1 flex-col gap-3 overflow-hidden">
      <div className="shrink-0">
        <Stepper current={step} onJump={setStep} />
      </div>
      <FormMessage state={state} />
      {formError ? (
        <p role="alert" className="shrink-0 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
          {formError}
        </p>
      ) : null}

      <div className="flex min-h-0 w-full min-w-0 flex-1 flex-col overflow-hidden rounded-lg border border-line bg-white">
        <div className="flex shrink-0 items-center justify-between gap-3 border-b border-line px-4 py-3 sm:px-5">
          <div className="min-w-0">
            <h2 className="text-sm font-semibold text-navy">{STEPS[step].title}</h2>
            <p className="truncate text-xs text-muted">{STEPS[step].description}</p>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 sm:px-5">
          {currentStepId === "general" ? (
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Hotel name" required name="name" error={fieldErrors.name}>
                <input
                  value={draft.name}
                  onChange={(event) => patch("name", event.target.value)}
                  autoComplete="off"
                />
              </Field>
              <Field label="Property type" name="propertyType">
                <select
                  value={draft.propertyType}
                  onChange={(event) =>
                    patch("propertyType", event.target.value as PropertyType)
                  }
                >
                  {propertyTypes.map((item) => (
                    <option key={item.value} value={item.value}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </Field>
              <Field
                label="Destination"
                required
                name="destinationId"
                error={fieldErrors.destinationId}
              >
                <SearchableSelect
                  ariaLabel="Destination"
                  value={draft.destinationId}
                  onChange={chooseDestination}
                  placeholder="Choose a destination"
                  searchPlaceholder="Search destinations"
                  invalid={Boolean(fieldErrors.destinationId)}
                  options={destinations.map((item) => ({
                    value: item.id,
                    label: item.name,
                  }))}
                />
              </Field>
              <Field label="Star rating" hint="Leave unrated if this stay has no official stars.">
                <select
                  value={String(draft.starRating)}
                  onChange={(event) => patch("starRating", Number(event.target.value))}
                >
                  <option value="0">Unrated</option>
                  {[1, 2, 3, 4, 5].map((stars) => (
                    <option key={stars} value={stars}>
                      {stars} star{stars === 1 ? "" : "s"}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Check-in" name="checkIn" error={fieldErrors.checkIn}>
                <input
                  type="time"
                  value={draft.checkIn}
                  onChange={(event) => patch("checkIn", event.target.value)}
                />
              </Field>
              <Field label="Check-out" name="checkOut" error={fieldErrors.checkOut}>
                <input
                  type="time"
                  value={draft.checkOut}
                  onChange={(event) => patch("checkOut", event.target.value)}
                />
              </Field>
              <Field label="Currency">
                <input
                  value={draft.currency}
                  maxLength={3}
                  onChange={(event) => patch("currency", event.target.value.toUpperCase())}
                />
              </Field>
              <label className="flex items-center gap-3 self-end rounded-lg border border-line px-3 py-2.5 text-sm md:mb-0.5">
                <input
                  type="checkbox"
                  checked={draft.isFeatured}
                  onChange={(event) => patch("isFeatured", event.target.checked)}
                />
                Feature this hotel
              </label>
              <div className="md:col-span-2">
                <Field
                  label="Short description"
                  required
                  name="summary"
                  error={fieldErrors.summary}
                  hint="Shown on hotel cards."
                >
                  <textarea
                    value={draft.summary}
                    rows={3}
                    className="!min-h-0"
                    onChange={(event) => patch("summary", event.target.value)}
                  />
                </Field>
              </div>
            </div>
          ) : null}

          {currentStepId === "location" ? (
            <div className="grid gap-4">
              <Field label="Address" name="address">
                <input
                  value={draft.address}
                  onChange={(event) => patch("address", event.target.value)}
                />
              </Field>
              <LocationMapPicker
                apiKey={mapApiKey}
                lat={draft.mapLat}
                lng={draft.mapLng}
                zoom={draft.mapZoom}
                onChange={(next) =>
                  setDraft((current) => ({
                    ...current,
                    mapLat: next.lat,
                    mapLng: next.lng,
                    mapZoom: next.zoom,
                  }))
                }
              />
            </div>
          ) : null}

          {currentStepId === "content" ? (
            <div className="tour-html-editor min-h-80">
              <HtmlEditor
                value={draft.description}
                onChange={(value) => patch("description", value)}
              />
            </div>
          ) : null}

          {currentStepId === "property" ? (
            <div className="grid gap-4">
              <Field
                label="Hotel amenities"
                hint="Shared by the whole property. Add new ones under Configuration → Hotels."
                name="amenities"
              >
                <MultiSearchableSelect
                  ariaLabel="Hotel amenities"
                  values={draft.amenities}
                  onChange={(values) => patch("amenities", values)}
                  placeholder="Choose amenities"
                  searchPlaceholder="Search amenities"
                  options={catalogOptions(catalog.amenities)}
                />
              </Field>
              <Field label="Cancellation policy">
                <textarea
                  value={draft.cancellationPolicy}
                  rows={4}
                  className="!min-h-0"
                  onChange={(event) => patch("cancellationPolicy", event.target.value)}
                />
              </Field>
              <Field label="House rules">
                <textarea
                  value={draft.houseRules}
                  rows={4}
                  className="!min-h-0"
                  onChange={(event) => patch("houseRules", event.target.value)}
                />
              </Field>
              <Field label="FAQs" hint="Reusable questions from Configuration.">
                <MultiSearchableSelect
                  ariaLabel="Hotel FAQs"
                  values={draft.faqs}
                  onChange={(values) => patch("faqs", values)}
                  placeholder="Choose questions"
                  searchPlaceholder="Search questions"
                  options={catalogOptions(catalog.faqs)}
                />
              </Field>
              <div className="grid gap-2">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-medium">Questions only for this hotel</p>
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    onClick={() =>
                      patch("extraFaqs", [...draft.extraFaqs, { title: "", content: "" }])
                    }
                  >
                    Add question
                  </Button>
                </div>
                {draft.extraFaqs.map((item, index) => (
                  <div key={index} className="grid gap-2 rounded-lg border border-line p-3">
                    <input
                      value={item.title}
                      placeholder="Question"
                      onChange={(event) =>
                        patch(
                          "extraFaqs",
                          draft.extraFaqs.map((row, rowIndex) =>
                            rowIndex === index ? { ...row, title: event.target.value } : row,
                          ),
                        )
                      }
                    />
                    <textarea
                      value={item.content}
                      rows={3}
                      placeholder="Answer"
                      className="!min-h-0"
                      onChange={(event) =>
                        patch(
                          "extraFaqs",
                          draft.extraFaqs.map((row, rowIndex) =>
                            rowIndex === index ? { ...row, content: event.target.value } : row,
                          ),
                        )
                      }
                    />
                    <button
                      type="button"
                      className="justify-self-start text-xs font-medium text-red-700"
                      onClick={() =>
                        patch(
                          "extraFaqs",
                          draft.extraFaqs.filter((_, rowIndex) => rowIndex !== index),
                        )
                      }
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          {currentStepId === "rooms" ? (
            <div className="grid gap-4">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <p className="max-w-xl text-sm text-muted">
                  Features are what makes the room different, such as a view or a balcony.
                  Amenities are what is inside it, such as air conditioning or a safe. Each room
                  keeps its own price.
                </p>
                <Button
                  type="button"
                  size="sm"
                  onClick={() => patch("rooms", [...draft.rooms, blankRoom()])}
                >
                  Add room
                </Button>
              </div>
              {fieldErrors.rooms ? (
                <p role="alert" className="text-xs text-red-700">
                  {fieldErrors.rooms}
                </p>
              ) : null}
              {draft.rooms.length === 0 ? (
                <p className="rounded-lg border border-dashed border-line px-4 py-8 text-sm text-muted">
                  No rooms yet. Add one for each room type you sell.
                </p>
              ) : null}
              {draft.rooms.map((room, index) => (
                <section
                  key={room.clientId}
                  className="grid gap-3 rounded-lg border border-line p-3"
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold text-navy">
                      {room.name.trim() || `Room ${index + 1}`}
                    </p>
                    <button
                      type="button"
                      className="text-xs font-medium text-red-700"
                      onClick={() =>
                        patch(
                          "rooms",
                          draft.rooms.filter((item) => item.clientId !== room.clientId),
                        )
                      }
                    >
                      Remove
                    </button>
                  </div>
                  <div className="grid gap-3 md:grid-cols-2">
                    <Field label="Room name" required name={`room-${index}-name`} error={fieldErrors[`room-${index}-name`]}>
                      <input
                        value={room.name}
                        onChange={(event) => updateRoom(room.clientId, { name: event.target.value })}
                      />
                    </Field>
                    <Field label="Nightly price" required name={`room-${index}-price`} error={fieldErrors[`room-${index}-price`]}>
                      <input
                        type="number"
                        min={0}
                        value={room.pricePerNight ?? ""}
                        onChange={(event) =>
                          updateRoom(room.clientId, {
                            pricePerNight: optionalNumber(event.target.value),
                          })
                        }
                      />
                    </Field>
                    <Field
                      label="Sleeps"
                      required
                      name={`room-${index}-occupancy`}
                      error={fieldErrors[`room-${index}-occupancy`]}
                      hint="Maximum guests in this room."
                    >
                      <input
                        type="number"
                        min={1}
                        value={room.occupancy ?? ""}
                        onChange={(event) =>
                          updateRoom(room.clientId, {
                            occupancy: optionalNumber(event.target.value),
                          })
                        }
                      />
                    </Field>
                    <Field
                      label="Rooms of this type"
                      required
                      name={`room-${index}-quantity`}
                      error={fieldErrors[`room-${index}-quantity`]}
                      hint="How many identical rooms you can sell."
                    >
                      <input
                        type="number"
                        min={1}
                        value={room.quantity ?? ""}
                        onChange={(event) =>
                          updateRoom(room.clientId, {
                            quantity: optionalNumber(event.target.value),
                          })
                        }
                      />
                    </Field>
                    <Field label="Extra guest price" hint="Added for each guest after the first two.">
                      <input
                        type="number"
                        min={0}
                        value={room.extraGuestPrice ?? ""}
                        onChange={(event) =>
                          updateRoom(room.clientId, {
                            extraGuestPrice: optionalNumber(event.target.value),
                          })
                        }
                      />
                    </Field>
                    <Field label="Bed">
                      <select
                        value={room.bedType}
                        onChange={(event) => updateRoom(room.clientId, { bedType: event.target.value })}
                      >
                        <option value="">Not set</option>
                        {bedTypes.map((bed) => (
                          <option key={bed} value={bed}>
                            {bed}
                          </option>
                        ))}
                      </select>
                    </Field>
                    <Field label="Size (m²)">
                      <input
                        type="number"
                        min={1}
                        value={room.sizeSqm ?? ""}
                        onChange={(event) =>
                          updateRoom(room.clientId, { sizeSqm: optionalNumber(event.target.value) })
                        }
                      />
                    </Field>
                    <Field label="Meal plan">
                      <select
                        value={room.mealPlan}
                        onChange={(event) =>
                          updateRoom(room.clientId, { mealPlan: event.target.value as MealPlan })
                        }
                      >
                        {mealPlans.map((plan) => (
                          <option key={plan.value} value={plan.value}>
                            {plan.label}
                          </option>
                        ))}
                      </select>
                    </Field>
                  </div>
                  <Field label="Short note">
                    <textarea
                      value={room.summary}
                      rows={2}
                      className="!min-h-0"
                      onChange={(event) => updateRoom(room.clientId, { summary: event.target.value })}
                    />
                  </Field>
                  <Field label="Features" hint="View, balcony, bathtub, and similar selling points.">
                    <MultiSearchableSelect
                      ariaLabel="Room features"
                      values={room.features}
                      onChange={(values) => updateRoom(room.clientId, { features: values })}
                      placeholder="Choose features"
                      searchPlaceholder="Search features"
                      options={catalogOptions(catalog.features)}
                    />
                  </Field>
                  <Field label="Amenities" hint="Items inside the room.">
                    <MultiSearchableSelect
                      ariaLabel="Room amenities"
                      values={room.amenities}
                      onChange={(values) => updateRoom(room.clientId, { amenities: values })}
                      placeholder="Choose amenities"
                      searchPlaceholder="Search amenities"
                      options={catalogOptions(catalog.roomAmenities)}
                    />
                  </Field>
                  <div className="grid gap-3 md:grid-cols-[16rem_1fr] md:items-end">
                    <ImageUploader
                      folder="hotels"
                      label="Room photo"
                      frame={tourImageFrames.cover}
                      value={room.image}
                      onChange={(value) => updateRoom(room.clientId, { image: value })}
                      onBusyChange={setImageBusy}
                      withHiddenFields={false}
                    />
                    <label className="flex items-center gap-3 rounded-lg border border-line px-3 py-2.5 text-sm">
                      <input
                        type="checkbox"
                        checked={room.active}
                        onChange={(event) =>
                          updateRoom(room.clientId, { active: event.target.checked })
                        }
                      />
                      Available to sell
                    </label>
                  </div>
                </section>
              ))}
              {keptRooms.length > 0 ? (
                <p className="text-xs text-muted">
                  The hotel’s “from” price is the lowest nightly rate among rooms you can sell.
                </p>
              ) : null}
            </div>
          ) : null}

          {currentStepId === "images" ? (
            <div className="grid gap-4">
              <div className="grid gap-4 md:grid-cols-2">
                <ImageUploader
                  folder="hotels"
                  label="Banner image"
                  required
                  fieldName="banner"
                  frame={tourImageFrames.banner}
                  value={draft.banner}
                  onChange={(value) => patch("banner", value)}
                  onBusyChange={setImageBusy}
                  withHiddenFields={false}
                  error={fieldErrors.banner}
                  hint="21:9 · 1920×823 px"
                />
                <ImageUploader
                  folder="hotels"
                  label="Cover image"
                  required
                  fieldName="cover"
                  frame={tourImageFrames.cover}
                  value={draft.cover}
                  onChange={(value) => patch("cover", value)}
                  onBusyChange={setImageBusy}
                  withHiddenFields={false}
                  error={fieldErrors.cover}
                  hint="16:10 · 1600×1000 px"
                />
              </div>
              <div className="grid gap-2">
                <p className="text-sm font-medium text-navy">Gallery</p>
                <ul className="grid grid-cols-4 gap-2 sm:grid-cols-6">
                  {draft.gallery.map((item, index) => (
                    <li key={`${item.key}-${index}`} className="relative overflow-hidden rounded-lg border border-line">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={item.url} alt="" className="aspect-[4/3] w-full object-cover" />
                      <button
                        type="button"
                        aria-label="Remove photo"
                        className="absolute top-1 right-1 flex size-5 items-center justify-center rounded-full bg-white/90 text-xs text-red-700"
                        onClick={() =>
                          patch(
                            "gallery",
                            draft.gallery.filter((_, imageIndex) => imageIndex !== index),
                          )
                        }
                      >
                        ×
                      </button>
                    </li>
                  ))}
                  <li>
                    <ImageUploader
                      folder="hotels"
                      label=""
                      tile
                      multiple
                      frame={tourImageFrames.gallery}
                      value={null}
                      onChange={(value) => {
                        if (!value) return;
                        patch("gallery", [
                          ...draft.gallery,
                          { url: value.url, key: value.key, driver: value.driver },
                        ]);
                      }}
                      onBusyChange={setImageBusy}
                      withHiddenFields={false}
                    />
                  </li>
                </ul>
              </div>
            </div>
          ) : null}

          {currentStepId === "seo" ? (
            <div className="grid gap-4">
              <label className="flex items-center gap-3 rounded-lg border border-line px-3 py-2.5 text-sm">
                <input
                  type="checkbox"
                  checked={draft.seoIndex}
                  onChange={(event) => patch("seoIndex", event.target.checked)}
                />
                Allow search engines to show this hotel
              </label>
              <Field label="SEO title" required name="seoTitle" error={fieldErrors.seoTitle}>
                <input
                  value={draft.seoTitle}
                  onChange={(event) => patch("seoTitle", event.target.value)}
                />
              </Field>
              <Field
                label="SEO description"
                required
                name="seoDescription"
                error={fieldErrors.seoDescription}
              >
                <textarea
                  value={draft.seoDescription}
                  rows={3}
                  className="!min-h-0"
                  onChange={(event) => patch("seoDescription", event.target.value)}
                />
              </Field>
              <ImageUploader
                folder="hotels"
                label="Social image"
                frame={tourImageFrames.cover}
                value={draft.seoImage}
                onChange={(value) => patch("seoImage", value)}
                onBusyChange={setImageBusy}
                withHiddenFields={false}
                hint="Used when this hotel is shared. Optional."
              />
            </div>
          ) : null}
        </div>

        <div className="shrink-0 border-t border-line bg-white px-4 py-3 sm:px-5">
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-between">
            <ButtonLink href="/admin/hotels" variant="secondary" size="sm" className="w-full sm:w-auto">
              Cancel
            </ButtonLink>
            <div className="flex flex-col-reverse gap-2 sm:flex-row">
              {step > 0 ? (
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  className="w-full sm:w-auto"
                  onClick={() => setStep((current) => Math.max(current - 1, 0))}
                  disabled={pending}
                >
                  Back
                </Button>
              ) : null}
              {step < STEPS.length - 1 ? (
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  className="w-full sm:w-auto"
                  onClick={() => submit("continue")}
                  disabled={pending || imageBusy}
                >
                  {pending && saveMode === "continue" ? "Saving…" : "Save and continue"}
                </Button>
              ) : null}
              <Button
                type="button"
                variant="secondary"
                size="sm"
                className="w-full sm:w-auto"
                onClick={() => submit("draft")}
                disabled={pending || imageBusy}
              >
                {pending && saveMode === "draft" ? "Saving…" : hotel?.published ? "Save" : "Save draft"}
              </Button>
              <Button
                type="button"
                size="sm"
                className="w-full sm:w-auto"
                onClick={() => submit("publish")}
                disabled={pending || imageBusy}
              >
                {pending && saveMode === "publish"
                  ? "Publishing…"
                  : hotel?.published
                    ? "Update published"
                    : "Publish"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
