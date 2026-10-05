"use client";

import {
  useActionState,
  useEffect,
  useRef,
  useState,
  useTransition,
} from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { saveTour } from "@/actions/tours";
import { HtmlEditor } from "@/components/admin/HtmlEditor";
import {
  imageFromFields,
  type TourFormValues,
} from "@/components/admin/TourForm";
import { Field } from "@/components/forms/Field";
import { FieldHelp } from "@/components/forms/FieldHelp";
import { FormMessage } from "@/components/forms/FormMessage";
import { Button, ButtonLink } from "@/components/ui/Button";
import { ImageUploader } from "@/components/ui/ImageUploader";
import { tourImageFrames } from "@/lib/tours/image-frames";
import { MultiSearchableSelect, SearchableSelect } from "@/components/ui/SearchableSelect";
import {
  packFaqs,
  resolveCatalogId,
  resolveCatalogIds,
  type CatalogOption,
} from "@/lib/catalog";
import type { TourCatalog } from "@/lib/catalog-query";
import { initialFormState } from "@/lib/forms";
import {
  formatTourDuration,
  type DurationUnit,
  type GalleryItem,
  type ItineraryItem,
  type PriceDiscount,
  type Surroundings,
} from "@/lib/tours/json";
import type { UploadedImage } from "@/lib/storage/types";

const STEPS = [
  {
    id: "general",
    title: "General",
    description: "Title, duration, and group size",
  },
  {
    id: "itinerary",
    title: "Itinerary",
    description: "Destinations and the day or week plan",
  },
  {
    id: "content",
    title: "Content",
    description: "Rich story, including pasted HTML",
  },
  {
    id: "pricing",
    title: "Pricing",
    description: "Price per person and discounts",
  },
  {
    id: "details",
    title: "Tour details",
    description: "FAQs, includes, styles, and facilities",
  },
  {
    id: "images",
    title: "Images",
    description: "Banner, cover, and gallery",
  },
  {
    id: "seo",
    title: "SEO",
    description: "Required search details",
  },
] as const;

const DURATION_UNITS: { value: DurationUnit; label: string }[] = [
  { value: "hours", label: "Hours" },
  { value: "days", label: "Days" },
  { value: "weeks", label: "Weeks" },
];

type StepId = (typeof STEPS)[number]["id"];

export type TourDestinationOption = {
  id: string;
  name: string;
  mapLat: string;
  mapLng: string;
  mapZoom: number;
};

function destinationPin(
  current: { mapLat: string; mapLng: string; mapZoom: number; destinationId: string },
  destinationId: string,
  destinations: TourDestinationOption[],
) {
  const next = destinations.find((item) => item.id === destinationId);
  if (!next?.mapLat || !next.mapLng) return null;
  const previous = destinations.find((item) => item.id === current.destinationId);
  const blank = !current.mapLat.trim() && !current.mapLng.trim();
  const inherited = Boolean(
    previous &&
      current.mapLat.trim() === previous.mapLat &&
      current.mapLng.trim() === previous.mapLng,
  );
  if (!blank && !inherited) return null;
  return {
    mapLat: next.mapLat,
    mapLng: next.mapLng,
    mapZoom: next.mapZoom || current.mapZoom,
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
                active
                  ? "border-brand bg-brand-soft"
                  : "border-line bg-white hover:bg-surface",
              ].join(" ")}
            >
              <span
                className={[
                  "flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold",
                  active
                    ? "bg-brand text-white"
                    : "bg-white text-muted ring-1 ring-line",
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

type Draft = Omit<
  TourFormValues,
  | "id"
  | "categoryId"
  | "imageUrl"
  | "imageKey"
  | "imageDriver"
  | "featuredImageUrl"
  | "featuredImageKey"
  | "featuredImageDriver"
  | "seoImageUrl"
  | "seoImageKey"
  | "seoImageDriver"
  | "gallery"
  | "durationDays"
  | "durationUnit"
  | "minPeople"
  | "maxGroupSize"
> & {
  /** Full-width top banner on the tour page → featuredImage* */
  banner: UploadedImage | null;
  /** Card / listing image → imageUrl* */
  cover: UploadedImage | null;
  seoImage: UploadedImage | null;
  gallery: GalleryItem[];
  durationDays: number | null;
  durationUnit: DurationUnit | "";
  minPeople: number | null;
  maxGroupSize: number | null;
};

function optionalCount(raw: string): number | null {
  if (raw.trim() === "") return null;
  const value = Number(raw);
  return Number.isFinite(value) ? value : null;
}

function emptySurroundings(): Surroundings {
  return { education: [], health: [], transportation: [] };
}

function linkedText(value: string, source: string) {
  return value.trim() === source.trim();
}

function sameImage(left: UploadedImage | null, right: UploadedImage | null) {
  if (!left || !right) return false;
  return left.key === right.key && left.url === right.url;
}

function buildDraft(tour: TourFormValues | undefined, catalog: TourCatalog): Draft {
  if (!tour) {
    return {
      title: "",
      summary: "",
      description: "",
      category: "",
      youtubeUrl: "",
      minDayBeforeBooking: null,
      durationDays: null,
      durationUnit: "",
      durationLabel: "",
      discounts: [],
      destinationIds: [],
      difficulty: "moderate",
      minPeople: null,
      maxGroupSize: null,
      priceFrom: 0,
      currency: "INR",
      faqs: [],
      extraFaqs: [],
      includes: [],
      excludes: [],
      itinerary: [],
      surroundings: emptySurroundings(),
      address: "",
      mapLat: "",
      mapLng: "",
      mapZoom: 8,
      isFeatured: false,
      defaultState: "always",
      travelStyles: [],
      facilities: [],
      icalImportUrl: "",
      seoIndex: true,
      seoTitle: "",
      seoDescription: "",
      facebookTitle: "",
      facebookDescription: "",
      twitterTitle: "",
      twitterDescription: "",
      published: false,
      destinationId: "",
      banner: null,
      cover: null,
      seoImage: null,
      gallery: [],
    };
  }

  return {
    title: tour.title,
    summary: tour.summary,
    description: tour.description,
    category: resolveCatalogId(tour.categoryId || tour.category, catalog.categories),
    youtubeUrl: tour.youtubeUrl,
    minDayBeforeBooking: tour.minDayBeforeBooking,
    durationDays: tour.durationDays,
    durationUnit: tour.durationUnit,
    durationLabel:
      tour.durationLabel ||
      formatTourDuration(tour.durationDays, tour.durationUnit),
    discounts: tour.discounts,
    destinationIds: tour.destinationIds,
    difficulty: tour.difficulty,
    minPeople: tour.minPeople,
    maxGroupSize: tour.maxGroupSize,
    priceFrom: tour.priceFrom,
    currency: tour.currency,
    faqs: resolveCatalogIds(tour.faqs, catalog.faqs),
    extraFaqs: tour.extraFaqs,
    includes: resolveCatalogIds(tour.includes, catalog.includes),
    excludes: resolveCatalogIds(tour.excludes, catalog.excludes),
    itinerary: tour.itinerary,
    surroundings: tour.surroundings,
    address: tour.address,
    mapLat: tour.mapLat,
    mapLng: tour.mapLng,
    mapZoom: tour.mapZoom,
    isFeatured: tour.isFeatured,
    defaultState: tour.defaultState,
    travelStyles: resolveCatalogIds(tour.travelStyles, catalog.styles),
    facilities: resolveCatalogIds(tour.facilities, catalog.facilities),
    icalImportUrl: tour.icalImportUrl,
    seoIndex: tour.seoIndex,
    seoTitle: tour.seoTitle.trim() || tour.title,
    seoDescription: tour.seoDescription.trim() || tour.summary,
    facebookTitle: tour.facebookTitle.trim() || tour.title,
    facebookDescription: tour.facebookDescription.trim() || tour.summary,
    twitterTitle: tour.twitterTitle.trim() || tour.title,
    twitterDescription: tour.twitterDescription.trim() || tour.summary,
    published: tour.published,
    destinationId: tour.destinationId,
    banner:
      imageFromFields(
        tour.featuredImageUrl,
        tour.featuredImageKey,
        tour.featuredImageDriver,
      ) ?? imageFromFields(tour.imageUrl, tour.imageKey, tour.imageDriver),
    cover: imageFromFields(tour.imageUrl, tour.imageKey, tour.imageDriver),
    seoImage:
      imageFromFields(tour.seoImageUrl, tour.seoImageKey, tour.seoImageDriver) ??
      imageFromFields(tour.imageUrl, tour.imageKey, tour.imageDriver) ??
      imageFromFields(
        tour.featuredImageUrl,
        tour.featuredImageKey,
        tour.featuredImageDriver,
      ),
    gallery: tour.gallery,
  };
}

function RepeaterCard({
  title,
  help,
  onAdd,
  children,
}: {
  title: string;
  help?: string;
  onAdd: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border border-line">
      <div className="flex items-center justify-between border-b border-line px-3 py-2">
        <p className="inline-flex items-center gap-1.5 text-sm font-semibold text-navy">
          {title}
          <FieldHelp label={title} help={help} />
        </p>
        <Button type="button" size="sm" variant="secondary" onClick={onAdd}>
          Add item
        </Button>
      </div>
      <div className="grid gap-3 p-3">{children}</div>
    </div>
  );
}

function CatalogMultiSelect({
  items,
  values,
  placeholder,
  searchPlaceholder,
  emptyLabel,
  onChange,
}: {
  items: CatalogOption[];
  values: string[];
  placeholder: string;
  searchPlaceholder: string;
  emptyLabel: string;
  onChange: (values: string[]) => void;
}) {
  if (items.length === 0) {
    return (
      <p className="text-xs font-normal text-muted">
        {emptyLabel}{" "}
        <Link href="/admin/configuration" className="font-medium text-brand hover:underline">
          Add them in Configuration
        </Link>
      </p>
    );
  }

  return (
    <MultiSearchableSelect
      values={values}
      onChange={onChange}
      placeholder={placeholder}
      searchPlaceholder={searchPlaceholder}
      ariaLabel={placeholder}
      options={items.map((item) => ({
        value: item.id,
        label: item.title,
        iconUrl: item.iconUrl,
      }))}
    />
  );
}

export function TourTabsForm({
  tour,
  destinations,
  catalog,
}: {
  tour?: TourFormValues;
  destinations: TourDestinationOption[];
  catalog: TourCatalog;
}) {
  const isEdit = Boolean(tour);
  const seoImageEdited = useRef(
    Boolean(
      tour?.seoImageKey &&
        tour.seoImageKey !== tour.imageKey &&
        tour.seoImageKey !== tour.featuredImageKey,
    ),
  );
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [draft, setDraft] = useState<Draft>(() => {
    const initial = buildDraft(tour, catalog);
    const pin = destinationPin(initial, initial.destinationId, destinations);
    return pin ? { ...initial, ...pin } : initial;
  });
  const [tourId, setTourId] = useState<string | null>(tour?.id ?? null);
  const [imageBusy, setImageBusy] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [saveMode, setSaveMode] = useState<
    "continue" | "draft" | "publish" | null
  >(null);
  const pendingFocusRef = useRef<string | null>(null);
  const pendingContinueRef = useRef(false);
  const pendingDraftRef = useRef(false);
  const pendingPublishRef = useRef(false);
  const currentStepId: StepId = STEPS[step].id;
  const [state, action] = useActionState(saveTour, initialFormState);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    if (state.error) {
      pendingContinueRef.current = false;
      pendingDraftRef.current = false;
      pendingPublishRef.current = false;
      setSaveMode(null);
      return;
    }
    if (!state.success) return;

    if (state.tourId) setTourId(state.tourId);

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
      router.push("/admin/tours?saved=1");
      router.refresh();
    }
  }, [state, router]);

  useEffect(() => {
    const name = pendingFocusRef.current;
    if (!name) return;
    pendingFocusRef.current = null;
    const timer = window.setTimeout(() => focusField(name), 40);
    return () => window.clearTimeout(timer);
  }, [step, fieldErrors]);

  function clearFieldError(name: string) {
    setFieldErrors((current) => {
      if (!current[name]) return current;
      const next = { ...current };
      delete next[name];
      return next;
    });
  }

  function applyDuration(count: number | null, unit: DurationUnit | "") {
    setDraft((current) => ({
      ...current,
      durationDays: count,
      durationUnit: unit,
      durationLabel:
        count != null && unit ? formatTourDuration(count, unit) : "",
    }));
    clearFieldError("durationDays");
  }

  function patch<K extends keyof Draft>(key: K, value: Draft[K]) {
    setDraft((current) => ({ ...current, [key]: value }));
    clearFieldError(String(key));
  }

  function patchTitle(value: string) {
    setDraft((current) => ({
      ...current,
      title: value,
      seoTitle: linkedText(current.seoTitle, current.title) ? value : current.seoTitle,
      facebookTitle: linkedText(current.facebookTitle, current.title)
        ? value
        : current.facebookTitle,
      twitterTitle: linkedText(current.twitterTitle, current.title)
        ? value
        : current.twitterTitle,
    }));
    clearFieldError("title");
  }

  function patchSummary(value: string) {
    setDraft((current) => ({
      ...current,
      summary: value,
      seoDescription: linkedText(current.seoDescription, current.summary)
        ? value
        : current.seoDescription,
      facebookDescription: linkedText(current.facebookDescription, current.summary)
        ? value
        : current.facebookDescription,
      twitterDescription: linkedText(current.twitterDescription, current.summary)
        ? value
        : current.twitterDescription,
    }));
    clearFieldError("summary");
  }

  function patchTourImage(slot: "banner" | "cover", value: UploadedImage | null) {
    setDraft((current) => {
      const next = { ...current, [slot]: value };
      if (seoImageEdited.current) return next;
      const previous = current.cover ?? current.banner;
      const upcoming = slot === "cover" ? (value ?? current.banner) : (current.cover ?? value);
      if (!current.seoImage || sameImage(current.seoImage, previous)) {
        next.seoImage = upcoming;
      }
      return next;
    });
    clearFieldError(slot);
  }

  function appendGallery(value: UploadedImage) {
    setDraft((current) => ({
      ...current,
      gallery: [...current.gallery, value],
    }));
  }

  function addDestination(destinationId: string) {
    setDraft((current) => {
      if (!destinationId || current.destinationIds.includes(destinationId)) {
        return current;
      }
      const destinationIds = [...current.destinationIds, destinationId];
      const pin =
        current.destinationIds.length === 0
          ? destinationPin(
              { ...current, destinationId: "" },
              destinationId,
              destinations,
            )
          : null;
      return {
        ...current,
        destinationIds,
        destinationId: destinationIds[0] ?? "",
        ...(pin ?? {}),
      };
    });
    clearFieldError("destinationIds");
  }

  function removeDestination(destinationId: string) {
    setDraft((current) => {
      const destinationIds = current.destinationIds.filter(
        (id) => id !== destinationId,
      );
      return {
        ...current,
        destinationIds,
        destinationId: destinationIds[0] ?? "",
      };
    });
  }

  function validateStepFields(index: number): Record<string, string> {
    const id = STEPS[index].id;
    const errors: Record<string, string> = {};

    if (id === "general") {
      if (draft.title.trim().length < 2) {
        errors.title = "Enter a title.";
      }
      if (draft.summary.trim().length < 10) {
        errors.summary = "Add a short description (at least 10 characters).";
      }
      if (draft.durationDays == null || !Number.isInteger(draft.durationDays) || draft.durationDays < 1) {
        errors.durationDays = "Enter a duration.";
      } else if (!draft.durationUnit) {
        errors.durationDays = "Choose hours, days, or weeks.";
      } else if (draft.durationUnit === "hours" && draft.durationDays > 240) {
        errors.durationDays = "Hours cannot be more than 240.";
      } else if (draft.durationUnit === "days" && draft.durationDays > 60) {
        errors.durationDays = "Days cannot be more than 60.";
      } else if (draft.durationUnit === "weeks" && draft.durationDays > 52) {
        errors.durationDays = "Weeks cannot be more than 52.";
      }
      if (draft.minPeople == null || !Number.isInteger(draft.minPeople) || draft.minPeople < 1) {
        errors.minPeople = "Enter the minimum number of people.";
      }
      if (draft.maxGroupSize == null || !Number.isInteger(draft.maxGroupSize) || draft.maxGroupSize < 1) {
        errors.maxGroupSize = "Enter the maximum number of people.";
      }
      if (
        draft.minPeople != null &&
        draft.maxGroupSize != null &&
        Number.isInteger(draft.minPeople) &&
        Number.isInteger(draft.maxGroupSize) &&
        draft.maxGroupSize < draft.minPeople
      ) {
        errors.maxGroupSize = "Max people must be at least the minimum.";
      }
    }

    if (id === "images") {
      if (!draft.banner) errors.banner = "Upload a banner image.";
      if (!draft.cover) errors.cover = "Upload a cover image for cards.";
    }

    if (id === "itinerary") {
      if (draft.destinationIds.length === 0) {
        errors.destinationIds = "Choose at least one destination.";
      }
    }

    if (id === "pricing") {
      if (!Number.isInteger(draft.priceFrom) || draft.priceFrom < 0) {
        errors.priceFrom = "Price per person must be zero or more.";
      }
      if (!draft.currency.trim()) errors.currency = "Choose a currency.";
      draft.discounts.forEach((discount, index) => {
        if (discount.mode === "percent" && discount.value > 100) {
          errors[`discount-${index}`] = "Percent cannot be more than 100.";
        }
        if (discount.kind === "group" && discount.minPeople < 2) {
          errors[`discount-${index}`] =
            "A group discount needs at least 2 people.";
        }
        if (!Number.isFinite(discount.value) || discount.value < 0) {
          errors[`discount-${index}`] = "Enter a discount of zero or more.";
        }
      });
    }

    if (id === "seo") {
      if (draft.seoTitle.trim().length < 2) {
        errors.seoTitle = "Add an SEO title.";
      }
      if (draft.seoDescription.trim().length < 10) {
        errors.seoDescription = "Add an SEO description (at least 10 characters).";
      }
    }

    return errors;
  }

  function focusField(name: string) {
    const root = document.querySelector(`[data-field="${name}"]`);
    if (!(root instanceof HTMLElement)) return;
    root.scrollIntoView({ behavior: "smooth", block: "center" });
    const target = root.querySelector<HTMLElement>(
      'input:not([type="hidden"]):not([type="file"]), textarea, button[aria-haspopup="listbox"], [role="button"]',
    );
    target?.focus({ preventScroll: true });
  }

  function showFieldErrors(errors: Record<string, string>, jumpStep?: number) {
    const first = Object.keys(errors)[0];
    if (!first) return;
    setFormError(null);
    setFieldErrors(errors);
    if (typeof jumpStep === "number" && jumpStep !== step) {
      pendingFocusRef.current = first;
      setStep(jumpStep);
      return;
    }
    window.setTimeout(() => focusField(first), 0);
  }

  function goBack() {
    setFormError(null);
    setFieldErrors({});
    setStep((current) => Math.max(current - 1, 0));
  }

  function jumpTo(index: number) {
    if (index < 0 || index >= STEPS.length) return;
    setFormError(null);
    setFieldErrors({});
    setStep(index);
  }

  function validateDraftFields(): Record<string, string> {
    const errors: Record<string, string> = {};
    if (draft.title.trim().length < 2) {
      errors.title = "Enter a title to save and continue.";
    }
    Object.assign(errors, validateStepFields(0));
    return errors;
  }

  function collectStepErrors() {
    return STEPS.map((_, index) => validateStepFields(index));
  }

  function findFirstStepWithErrors(
    errorsByStep: Record<string, string>[],
  ): number {
    return errorsByStep.findIndex((errors) => Object.keys(errors).length > 0);
  }

  const isPublishable = collectStepErrors().every(
    (errors) => Object.keys(errors).length === 0,
  );

  function buildFormData(publish: boolean) {
    const formData = new FormData();
    if (tourId) formData.set("tourId", tourId);
    formData.set("title", draft.title.trim());
    formData.set("summary", draft.summary.trim());
    formData.set("description", draft.description.trim());
    formData.set("category", draft.category);
    formData.set("youtubeUrl", draft.youtubeUrl.trim());
    if (draft.minDayBeforeBooking != null) {
      formData.set("minDayBeforeBooking", String(draft.minDayBeforeBooking));
    }
    if (draft.durationDays != null && draft.durationUnit) {
      formData.set("durationDays", String(draft.durationDays));
      formData.set("durationUnit", draft.durationUnit);
      formData.set(
        "durationLabel",
        formatTourDuration(draft.durationDays, draft.durationUnit),
      );
    }
    formData.set("difficulty", draft.difficulty);
    if (draft.minPeople != null) {
      formData.set("minPeople", String(draft.minPeople));
    }
    if (draft.maxGroupSize != null) {
      formData.set("maxGroupSize", String(draft.maxGroupSize));
    }
    formData.set("priceFrom", String(draft.priceFrom));
    formData.set("currency", draft.currency);
    formData.set("destinationId", draft.destinationIds[0] ?? "");
    formData.set("destinationIdsJson", JSON.stringify(draft.destinationIds));
    formData.set("discountsJson", JSON.stringify(draft.discounts));
    formData.set("address", draft.address.trim());
    formData.set("mapLat", draft.mapLat.trim());
    formData.set("mapLng", draft.mapLng.trim());
    formData.set("mapZoom", String(draft.mapZoom));
    formData.set("defaultState", draft.defaultState);
    formData.set("icalImportUrl", draft.icalImportUrl.trim());
    formData.set("seoTitle", draft.seoTitle.trim());
    formData.set("seoDescription", draft.seoDescription.trim());
    formData.set("facebookTitle", draft.facebookTitle.trim());
    formData.set("facebookDescription", draft.facebookDescription.trim());
    formData.set("twitterTitle", draft.twitterTitle.trim());
    formData.set("twitterDescription", draft.twitterDescription.trim());
    formData.set("faqsJson", JSON.stringify(packFaqs(draft.faqs, draft.extraFaqs)));
    formData.set("includesJson", JSON.stringify(draft.includes));
    formData.set("excludesJson", JSON.stringify(draft.excludes));
    formData.set("itineraryJson", JSON.stringify(draft.itinerary));
    formData.set("surroundingsJson", JSON.stringify(draft.surroundings));
    formData.set("galleryJson", JSON.stringify(draft.gallery));
    formData.set("travelStylesJson", JSON.stringify(draft.travelStyles));
    formData.set("facilitiesJson", JSON.stringify(draft.facilities));
    if (publish) formData.set("published", "on");
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

  function saveAndContinue() {
    if (imageBusy) {
      setFormError("Wait for image uploads to finish.");
      return;
    }
    const errors = validateDraftFields();
    if (Object.keys(errors).length > 0) {
      setFormError(null);
      setFieldErrors({});
      setStep((current) => Math.min(current + 1, STEPS.length - 1));
      return;
    }

    // Keep a live tour published when it is still complete.
    const keepPublished =
      isEdit && Boolean(tour?.published) && isPublishable;

    setFormError(null);
    setFieldErrors({});
    setSaveMode("continue");
    pendingContinueRef.current = true;
    pendingDraftRef.current = false;
    pendingPublishRef.current = false;
    startTransition(() => action(buildFormData(keepPublished)));
  }

  function saveDraft() {
    if (imageBusy) {
      setFormError("Wait for image uploads to finish.");
      return;
    }
    const errors = validateDraftFields();
    if (Object.keys(errors).length > 0) {
      showFieldErrors(errors, 0);
      return;
    }

    setFormError(null);
    setFieldErrors({});
    setSaveMode("draft");
    pendingContinueRef.current = false;
    pendingDraftRef.current = true;
    pendingPublishRef.current = false;
    startTransition(() => action(buildFormData(false)));
  }

  function publish() {
    if (imageBusy) {
      setFormError("Wait for image uploads to finish.");
      return;
    }

    const errorsByStep = collectStepErrors();
    const firstBad = findFirstStepWithErrors(errorsByStep);
    if (firstBad >= 0) {
      showFieldErrors(errorsByStep[firstBad], firstBad);
      return;
    }

    setFormError(null);
    setFieldErrors({});
    setSaveMode("publish");
    pendingContinueRef.current = false;
    pendingDraftRef.current = false;
    pendingPublishRef.current = true;
    startTransition(() => action(buildFormData(true)));
  }

  function updateItinerary(index: number, next: Partial<ItineraryItem>) {
    patch(
      "itinerary",
      draft.itinerary.map((row, i) => (i === index ? { ...row, ...next } : row)),
    );
  }

  function addItineraryItem() {
    patch(
      "itinerary",
      [
        {
          dayNumber: 1,
          title: "",
          description: "",
          clientId: crypto.randomUUID(),
        },
        ...draft.itinerary,
      ].map((row, index) => ({
        ...row,
        dayNumber: index + 1,
        clientId: row.clientId ?? `saved-${index}`,
      })),
    );
  }

  function removeItineraryItem(index: number) {
    patch(
      "itinerary",
      draft.itinerary
        .filter((_, i) => i !== index)
        .map((row, i) => ({ ...row, dayNumber: i + 1 })),
    );
  }

  function updateDiscount(index: number, next: PriceDiscount) {
    patch(
      "discounts",
      draft.discounts.map((row, i) => (i === index ? next : row)),
    );
    clearFieldError(`discount-${index}`);
  }

  return (
    <div className="flex min-h-0 w-full min-w-0 flex-1 flex-col gap-3 overflow-hidden">
      <div className="shrink-0">
        <Stepper current={step} onJump={jumpTo} />
      </div>

      <FormMessage state={state} />
      {formError ? (
        <p
          role="alert"
          className="shrink-0 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700"
        >
          {formError}
        </p>
      ) : null}

      <div className="flex min-h-0 w-full min-w-0 flex-1 flex-col overflow-hidden rounded-lg border border-line bg-white">
        <div className="flex shrink-0 items-center justify-between gap-3 border-b border-line px-4 py-3 sm:px-5">
          <div className="min-w-0">
            <h2 className="text-sm font-semibold text-navy">
              {STEPS[step].title}
            </h2>
            <p className="mt-0.5 truncate text-xs text-muted">
              {STEPS[step].description}
            </p>
          </div>
          {isEdit ? (
            <Button
              type="button"
              size="sm"
              className="shrink-0"
              onClick={publish}
              disabled={pending || imageBusy}
            >
              {pending && saveMode === "publish"
                ? "Publishing…"
                : "Save and publish"}
            </Button>
          ) : null}
        </div>

        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain px-4 py-4 sm:px-5">
        {currentStepId === "general" ? (
            <div className="grid gap-4">
              <Field
                label="Title"
                name="title"
                required
                error={fieldErrors.title}
              >
                <input
                  value={draft.title}
                  onChange={(e) => patchTitle(e.target.value)}
                  className="!h-10"
                  placeholder="Title"
                  aria-invalid={Boolean(fieldErrors.title)}
                />
              </Field>
              <Field
                label="Short description"
                name="summary"
                required
                hint="Shown on cards."
                error={fieldErrors.summary}
              >
                <textarea
                  value={draft.summary}
                  onChange={(e) => patchSummary(e.target.value)}
                  rows={3}
                  className="!min-h-0 resize-y"
                  aria-invalid={Boolean(fieldErrors.summary)}
                />
              </Field>
              <Field label="Category">
                {catalog.categories.length === 0 ? (
                  <p className="text-xs text-muted">
                    No tour categories yet.{" "}
                    <Link href="/admin/configuration" className="font-medium text-brand hover:underline">
                      Add them in Configuration
                    </Link>
                  </p>
                ) : (
                  <SearchableSelect
                    value={draft.category}
                    onChange={(value) => patch("category", value)}
                    emptyLabel="Choose a category"
                    searchPlaceholder="Search categories"
                    ariaLabel="Category"
                    className="!h-10"
                    options={catalog.categories.map((item) => ({
                      value: item.id,
                      label: item.title,
                      iconUrl: item.iconUrl,
                    }))}
                  />
                )}
              </Field>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="sm:col-span-2">
                <Field
                  label="Duration"
                  name="durationDays"
                  required
                  error={fieldErrors.durationDays}
                >
                  <div className="grid grid-cols-[minmax(0,1fr)_8.5rem] gap-2">
                    <input
                      type="number"
                      min={1}
                      value={draft.durationDays ?? ""}
                      onChange={(e) =>
                        applyDuration(optionalCount(e.target.value), draft.durationUnit)
                      }
                      className="!h-10"
                      placeholder="Duration"
                      aria-invalid={Boolean(fieldErrors.durationDays)}
                    />
                    <SearchableSelect
                      value={draft.durationUnit}
                      onChange={(value) =>
                        applyDuration(
                          draft.durationDays,
                          value === "hours" || value === "days" || value === "weeks"
                            ? value
                            : "",
                        )
                      }
                      emptyLabel="Unit"
                      searchPlaceholder="Search units"
                      options={DURATION_UNITS}
                      className="!h-10"
                      ariaLabel="Duration unit"
                      invalid={Boolean(fieldErrors.durationDays)}
                    />
                  </div>
                </Field>
                </div>
                <Field
                  label="Tour min people"
                  name="minPeople"
                  required
                  error={fieldErrors.minPeople}
                >
                  <input
                    type="number"
                    min={1}
                    value={draft.minPeople ?? ""}
                    onChange={(e) => patch("minPeople", optionalCount(e.target.value))}
                    className="!h-10"
                    aria-invalid={Boolean(fieldErrors.minPeople)}
                  />
                </Field>
                <Field
                  label="Tour max people"
                  name="maxGroupSize"
                  required
                  error={fieldErrors.maxGroupSize}
                >
                  <input
                    type="number"
                    min={1}
                    value={draft.maxGroupSize ?? ""}
                    onChange={(e) =>
                      patch("maxGroupSize", optionalCount(e.target.value))
                    }
                    className="!h-10"
                    aria-invalid={Boolean(fieldErrors.maxGroupSize)}
                  />
                </Field>
              </div>
            </div>
          ) : null}

          {currentStepId === "itinerary" ? (
            <div className="grid gap-4">
              <Field
                label="Destinations"
                name="destinationIds"
                required
                hint="Add every place this tour visits."
                error={fieldErrors.destinationIds}
              >
                <div className="grid gap-2">
                  {draft.destinationIds.length > 0 ? (
                    <ul className="flex flex-wrap gap-2">
                      {draft.destinationIds.map((id) => (
                        <li key={id}>
                          <button
                            type="button"
                            className="inline-flex items-center gap-1 rounded-full border border-line bg-surface px-2.5 py-1 text-xs font-medium text-navy"
                            onClick={() => removeDestination(id)}
                          >
                            {destinations.find((item) => item.id === id)?.name ??
                              "Destination"}
                            <span aria-hidden="true">×</span>
                            <span className="sr-only">Remove</span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-xs text-muted">No destinations yet.</p>
                  )}
                  <SearchableSelect
                    value=""
                    onChange={(value) => {
                      if (value) addDestination(value);
                    }}
                    emptyLabel="Add a destination"
                    searchPlaceholder="Search destinations"
                    invalid={Boolean(fieldErrors.destinationIds)}
                    options={destinations
                      .filter((item) => !draft.destinationIds.includes(item.id))
                      .map((destination) => ({
                        value: destination.id,
                        label: destination.name,
                      }))}
                    className="!h-10"
                  />
                </div>
              </Field>

              <div className="grid gap-3">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-xs text-muted">
                    Add as many stops as you need. The number does not have to match the duration.
                  </p>
                  <Button type="button" size="sm" variant="secondary" onClick={addItineraryItem}>
                    Add new itinerary item
                  </Button>
                </div>
                {draft.itinerary.length === 0 ? (
                  <p className="rounded-md border border-dashed border-line px-3 py-6 text-center text-xs text-muted">
                    No itinerary items yet.
                  </p>
                ) : (
                  draft.itinerary.map((item, index) => {
                    const image =
                      item.imageUrl && item.imageKey
                        ? {
                            url: item.imageUrl,
                            key: item.imageKey,
                            driver:
                              item.imageDriver === "cloudinary"
                                ? ("cloudinary" as const)
                                : ("local" as const),
                          }
                        : null;
                    return (
                      <div
                        key={item.clientId ?? item.dayNumber}
                        className="rounded-md border border-line"
                      >
                        <div className="flex justify-end px-3 pt-3">
                          <button
                            type="button"
                            className="inline-flex items-center gap-1.5 rounded-full border border-red-200 bg-red-50 px-2.5 py-1 text-xs font-medium text-red-700 hover:bg-red-100"
                            onClick={() => removeItineraryItem(index)}
                          >
                            <svg
                              viewBox="0 0 16 16"
                              className="h-3.5 w-3.5"
                              fill="none"
                              aria-hidden
                            >
                              <path
                                d="M3 4.5h10M6.2 4.5V3.2h3.6v1.3M4.2 4.5l.5 8.2h6.6l.5-8.2"
                                stroke="currentColor"
                                strokeWidth="1.3"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                            Remove itinerary item
                          </button>
                        </div>
                        <div className="grid items-start gap-4 p-3 sm:grid-cols-[11rem_minmax(0,1fr)]">
                        <ImageUploader
                          folder="tours"
                          label=""
                          compact
                          value={image}
                          onChange={(value) =>
                            updateItinerary(index, {
                              imageUrl: value?.url ?? "",
                              imageKey: value?.key ?? "",
                              imageDriver: value?.driver ?? "",
                            })
                          }
                          onBusyChange={setImageBusy}
                          withHiddenFields={false}
                        />
                        <div className="grid content-start gap-3">
                          <Field label="Title">
                            <input
                              value={item.title}
                              placeholder="Title"
                              className="!h-10"
                              onChange={(e) =>
                                updateItinerary(index, { title: e.target.value })
                              }
                            />
                          </Field>
                          <Field label="Description">
                            <textarea
                              value={item.description}
                              rows={4}
                              placeholder="What happens on this part of the tour"
                              className="!min-h-0 resize-y"
                              onChange={(e) =>
                                updateItinerary(index, {
                                  description: e.target.value,
                                })
                              }
                            />
                          </Field>
                        </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          ) : null}

          {currentStepId === "content" ? (
            <div className="flex min-h-full flex-1 flex-col gap-3">
              <p className="shrink-0 text-xs text-muted">
                Format the story with the editor, or use Source to paste HTML and styles.
              </p>
              <HtmlEditor
                value={draft.description}
                onChange={(html) => patch("description", html)}
              />
            </div>
          ) : null}

          {currentStepId === "pricing" ? (
            <div className="grid gap-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <Field
                  label="Price per person"
                  name="priceFrom"
                  required
                  error={fieldErrors.priceFrom}
                >
                  <input
                    type="number"
                    min={0}
                    value={draft.priceFrom}
                    onChange={(e) => patch("priceFrom", Number(e.target.value))}
                    className="!h-10"
                    aria-invalid={Boolean(fieldErrors.priceFrom)}
                  />
                </Field>
                <Field
                  label="Currency"
                  name="currency"
                  required
                  error={fieldErrors.currency}
                >
                  <SearchableSelect
                    value={draft.currency}
                    onChange={(value) => patch("currency", value)}
                    searchPlaceholder="Search currencies"
                    required
                    invalid={Boolean(fieldErrors.currency)}
                    options={[
                      { value: "INR", label: "INR" },
                      { value: "USD", label: "USD" },
                      { value: "EUR", label: "EUR" },
                    ]}
                    className="!h-10"
                  />
                </Field>
              </div>

              <RepeaterCard
                title="Discounts"
                help="Optional. A solo traveler discount, or a lower price when more people book."
                onAdd={() =>
                  patch("discounts", [
                    ...draft.discounts,
                    {
                      kind: "single",
                      minPeople: 1,
                      mode: "percent",
                      value: 10,
                    },
                  ])
                }
              >
                {draft.discounts.length === 0 ? (
                  <p className="text-xs text-muted">
                    No discounts. Everyone pays the price per person.
                  </p>
                ) : (
                  draft.discounts.map((discount, index) => (
                    <div
                      key={index}
                      className="grid gap-3 rounded-md border border-line p-3"
                    >
                      <div className="grid gap-3 sm:grid-cols-2">
                        <Field label="Applies when">
                          <SearchableSelect
                            value={discount.kind}
                            onChange={(value) =>
                              updateDiscount(index, {
                                ...discount,
                                kind: value === "group" ? "group" : "single",
                                minPeople:
                                  value === "group"
                                    ? Math.max(2, discount.minPeople)
                                    : 1,
                              })
                            }
                            searchPlaceholder="Search"
                            options={[
                              { value: "single", label: "Single person" },
                              { value: "group", label: "More people" },
                            ]}
                            className="!h-10"
                          />
                        </Field>
                        {discount.kind === "group" ? (
                          <Field label="From this many people">
                            <input
                              type="number"
                              min={2}
                              value={discount.minPeople}
                              className="!h-10"
                              onChange={(e) =>
                                updateDiscount(index, {
                                  ...discount,
                                  minPeople: Number(e.target.value),
                                })
                              }
                            />
                          </Field>
                        ) : (
                          <Field label="Discount type">
                            <SearchableSelect
                              value={discount.mode}
                              onChange={(value) =>
                                updateDiscount(index, {
                                  ...discount,
                                  mode: value === "amount" ? "amount" : "percent",
                                })
                              }
                              searchPlaceholder="Search"
                              options={[
                                { value: "percent", label: "Percent off" },
                                { value: "amount", label: "Fixed amount off" },
                              ]}
                              className="!h-10"
                            />
                          </Field>
                        )}
                        {discount.kind === "group" ? (
                          <Field label="Discount type">
                            <SearchableSelect
                              value={discount.mode}
                              onChange={(value) =>
                                updateDiscount(index, {
                                  ...discount,
                                  mode: value === "amount" ? "amount" : "percent",
                                })
                              }
                              searchPlaceholder="Search"
                              options={[
                                { value: "percent", label: "Percent off" },
                                { value: "amount", label: "Fixed amount off" },
                              ]}
                              className="!h-10"
                            />
                          </Field>
                        ) : null}
                        <Field
                          label={
                            discount.mode === "percent"
                              ? "Percent off"
                              : `Amount off (${draft.currency})`
                          }
                          name={`discount-${index}`}
                          error={fieldErrors[`discount-${index}`]}
                        >
                          <input
                            type="number"
                            min={0}
                            max={discount.mode === "percent" ? 100 : undefined}
                            value={discount.value}
                            className="!h-10"
                            onChange={(e) =>
                              updateDiscount(index, {
                                ...discount,
                                value: Number(e.target.value),
                              })
                            }
                          />
                        </Field>
                      </div>
                      <button
                        type="button"
                        className="justify-self-start text-xs text-red-700"
                        onClick={() =>
                          patch(
                            "discounts",
                            draft.discounts.filter((_, i) => i !== index),
                          )
                        }
                      >
                        Remove
                      </button>
                    </div>
                  ))
                )}
              </RepeaterCard>
            </div>
          ) : null}

          {currentStepId === "details" ? (
            <div className="grid gap-4">
              <Field label="FAQs">
                <CatalogMultiSelect
                  items={catalog.faqs}
                  values={draft.faqs}
                  placeholder="Choose FAQs"
                  searchPlaceholder="Search FAQs"
                  emptyLabel="No shared FAQs yet."
                  onChange={(values) => patch("faqs", values)}
                />
              </Field>
              <div className="grid gap-3">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-medium text-navy">FAQs for this tour</p>
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    onClick={() =>
                      patch("extraFaqs", [
                        { title: "", content: "" },
                        ...draft.extraFaqs,
                      ])
                    }
                  >
                    Add FAQ
                  </Button>
                </div>
                {draft.extraFaqs.length === 0 ? (
                  <p className="text-xs text-muted">
                    Shared FAQs come from the list above. Add a question here when it only applies to this tour.
                  </p>
                ) : (
                  draft.extraFaqs.map((item, index) => (
                    <div key={index} className="grid gap-3 rounded-lg border border-line p-3">
                      <div className="flex justify-end">
                        <button
                          type="button"
                          className="text-xs font-medium text-red-700"
                          onClick={() =>
                            patch(
                              "extraFaqs",
                              draft.extraFaqs.filter((_, itemIndex) => itemIndex !== index),
                            )
                          }
                        >
                          Remove
                        </button>
                      </div>
                      <Field label="Question">
                        <input
                          value={item.title}
                          onChange={(event) =>
                            patch(
                              "extraFaqs",
                              draft.extraFaqs.map((faq, itemIndex) =>
                                itemIndex === index
                                  ? { ...faq, title: event.target.value }
                                  : faq,
                              ),
                            )
                          }
                          className="!h-10"
                          placeholder="Question"
                        />
                      </Field>
                      <Field label="Answer">
                        <textarea
                          value={item.content}
                          onChange={(event) =>
                            patch(
                              "extraFaqs",
                              draft.extraFaqs.map((faq, itemIndex) =>
                                itemIndex === index
                                  ? { ...faq, content: event.target.value }
                                  : faq,
                              ),
                            )
                          }
                          rows={3}
                          className="!min-h-0 resize-y"
                          placeholder="Answer"
                        />
                      </Field>
                    </div>
                  ))
                )}
              </div>
              <div className="grid gap-4 lg:grid-cols-2">
                <Field label="Include">
                  <CatalogMultiSelect
                    items={catalog.includes}
                    values={draft.includes}
                    placeholder="Choose included items"
                    searchPlaceholder="Search included items"
                    emptyLabel="No included items yet."
                    onChange={(values) => patch("includes", values)}
                  />
                </Field>
                <Field label="Exclude">
                  <CatalogMultiSelect
                    items={catalog.excludes}
                    values={draft.excludes}
                    placeholder="Choose excluded items"
                    searchPlaceholder="Search excluded items"
                    emptyLabel="No excluded items yet."
                    onChange={(values) => patch("excludes", values)}
                  />
                </Field>
              </div>

              <Field label="Travel styles">
                <CatalogMultiSelect
                  items={catalog.styles}
                  values={draft.travelStyles}
                  placeholder="Choose travel styles"
                  searchPlaceholder="Search travel styles"
                  emptyLabel="No travel styles yet."
                  onChange={(values) => patch("travelStyles", values)}
                />
              </Field>

              <Field label="Facilities">
                <CatalogMultiSelect
                  items={catalog.facilities}
                  values={draft.facilities}
                  placeholder="Choose facilities"
                  searchPlaceholder="Search facilities"
                  emptyLabel="No facilities yet."
                  onChange={(values) => patch("facilities", values)}
                />
              </Field>
            </div>
          ) : null}


          {currentStepId === "images" ? (
            <div className="grid gap-4">
              <div className="grid grid-cols-[minmax(0,1.46fr)_minmax(0,1fr)] items-start gap-3">
                <ImageUploader
                  folder="tours"
                  label="Banner image"
                  required
                  fieldName="banner"
                  frame={tourImageFrames.banner}
                  value={draft.banner}
                  initialValue={draft.banner}
                  onChange={(value) => patchTourImage("banner", value)}
                  onBusyChange={setImageBusy}
                  withHiddenFields={false}
                  error={fieldErrors.banner}
                  hint="21:9 · 1920×823 px"
                />
                <ImageUploader
                  folder="tours"
                  label="Cover image"
                  required
                  fieldName="cover"
                  frame={tourImageFrames.cover}
                  value={draft.cover}
                  initialValue={draft.cover}
                  onChange={(value) => patchTourImage("cover", value)}
                  onBusyChange={setImageBusy}
                  withHiddenFields={false}
                  error={fieldErrors.cover}
                  hint="16:10 · 1600×1000 px"
                />
              </div>

              <div className="grid gap-2">
                <div className="flex items-center justify-between gap-3">
                  <p className="inline-flex items-center gap-1.5 text-sm font-medium text-navy">
                    Gallery
                    <FieldHelp label="Gallery" />
                  </p>
                  <p className="text-xs text-muted">4:3 · 1200×900 px</p>
                </div>
                <ul className="grid grid-cols-4 gap-2 sm:grid-cols-6">
                  {draft.gallery.map((item, index) => (
                    <li
                      key={`${item.key}-${index}`}
                      className="relative overflow-hidden rounded-lg border border-line"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={item.url}
                        alt=""
                        className="aspect-[4/3] w-full object-cover"
                      />
                      <button
                        type="button"
                        aria-label="Remove photo"
                        className="absolute top-1 right-1 flex size-5 items-center justify-center rounded-full bg-white/90 text-xs text-red-700"
                        onClick={() =>
                          patch(
                            "gallery",
                            draft.gallery.filter((_, i) => i !== index),
                          )
                        }
                      >
                        ×
                      </button>
                    </li>
                  ))}
                  <li>
                    <ImageUploader
                      folder="tours"
                      label=""
                      tile
                      multiple
                      frame={tourImageFrames.gallery}
                      value={null}
                      onChange={(value) => {
                        if (!value) return;
                        appendGallery(value);
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
            <div className="grid gap-3">
              <label className="flex items-center gap-3 rounded-lg border border-line px-3 py-2.5 text-sm">
                <input
                  type="checkbox"
                  checked={draft.seoIndex}
                  onChange={(e) => patch("seoIndex", e.target.checked)}
                  className="h-4 w-4 accent-brand"
                />
                <span className="inline-flex items-center gap-1.5">
                  Allow search engines to show this tour in results
                  <FieldHelp
                    label="Allow search engines to show this tour in results"
                    help="seo.index"
                  />
                </span>
              </label>
              <div className="flex items-start gap-4">
                <ImageUploader
                  folder="tours"
                  label="Featured SEO image"
                  compact
                  value={draft.seoImage}
                  initialValue={draft.seoImage}
                  onChange={(value) => {
                    seoImageEdited.current = true;
                    patch("seoImage", value);
                  }}
                  onBusyChange={setImageBusy}
                  withHiddenFields={false}
                />
                <div className="grid min-w-0 flex-1 gap-3">
                  <Field
                    label="SEO title"
                    name="seoTitle"
                    required
                    error={fieldErrors.seoTitle}
                  >
                    <input
                      value={draft.seoTitle}
                      onChange={(e) => patch("seoTitle", e.target.value)}
                      className="!h-10"
                      placeholder="Title shown in search results"
                      aria-invalid={Boolean(fieldErrors.seoTitle)}
                    />
                  </Field>
                  <Field
                    label="SEO description"
                    name="seoDescription"
                    required
                    error={fieldErrors.seoDescription}
                  >
                    <textarea
                      value={draft.seoDescription}
                      onChange={(e) => patch("seoDescription", e.target.value)}
                      rows={3}
                      className="!min-h-0 resize-y"
                      aria-invalid={Boolean(fieldErrors.seoDescription)}
                    />
                  </Field>
                </div>
              </div>
              <Field label="Facebook title">
                <input
                  value={draft.facebookTitle}
                  onChange={(e) => patch("facebookTitle", e.target.value)}
                  className="!h-10"
                />
              </Field>
              <Field label="Facebook description">
                <textarea
                  value={draft.facebookDescription}
                  onChange={(e) =>
                    patch("facebookDescription", e.target.value)
                  }
                  rows={2}
                  className="!min-h-0 resize-y"
                />
              </Field>
              <Field label="X title">
                <input
                  value={draft.twitterTitle}
                  onChange={(e) => patch("twitterTitle", e.target.value)}
                  className="!h-10"
                />
              </Field>
              <Field label="X description">
                <textarea
                  value={draft.twitterDescription}
                  onChange={(e) =>
                    patch("twitterDescription", e.target.value)
                  }
                  rows={2}
                  className="!min-h-0 resize-y"
                />
              </Field>
            </div>
          ) : null}
        </div>

        <div className="shrink-0 border-t border-line bg-white px-4 py-3 sm:px-5">
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-between">
            <ButtonLink
              href="/admin/tours"
              variant="secondary"
              size="sm"
              className="w-full sm:w-auto"
            >
              Cancel
            </ButtonLink>
            <div className="flex flex-col-reverse gap-2 sm:flex-row">
              {step > 0 ? (
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  className="w-full sm:w-auto"
                  onClick={goBack}
                  disabled={pending}
                >
                  Back
                </Button>
              ) : null}
              {step < STEPS.length - 1 ? (
                <Button
                  type="button"
                  variant={isEdit && isPublishable ? "secondary" : "primary"}
                  size="sm"
                  className="w-full sm:w-auto"
                  onClick={saveAndContinue}
                  disabled={pending || imageBusy}
                >
                  {pending && saveMode === "continue"
                    ? "Saving…"
                    : "Save and continue"}
                </Button>
              ) : isEdit ? (
                <Button
                  type="button"
                  variant={isPublishable ? "secondary" : "primary"}
                  size="sm"
                  className="w-full sm:w-auto"
                  onClick={saveDraft}
                  disabled={pending || imageBusy}
                >
                  {pending && saveMode === "draft" ? "Saving…" : "Save draft"}
                </Button>
              ) : null}
              {!isEdit && step === STEPS.length - 1 ? (
                <Button
                  type="button"
                  size="sm"
                  className="w-full sm:w-auto"
                  onClick={publish}
                  disabled={pending || imageBusy}
                >
                  {pending && saveMode === "publish"
                    ? "Publishing…"
                    : "Publish"}
                </Button>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
