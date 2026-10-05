"use client";

import {
  useActionState,
  useEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
} from "react";
import { useRouter } from "next/navigation";
import { saveTour } from "@/actions/tours";
import {
  imageFromFields,
  type TourFormValues,
} from "@/components/admin/TourForm";
import { Field } from "@/components/forms/Field";
import { FieldHelp } from "@/components/forms/FieldHelp";
import { FormMessage } from "@/components/forms/FormMessage";
import { Button, ButtonLink } from "@/components/ui/Button";
import { ImageUploader } from "@/components/ui/ImageUploader";
import { SearchableSelect } from "@/components/ui/SearchableSelect";
import {
  defaultStateOptions,
  tourCategories,
  tourFacilities,
  travelStyles,
} from "@/lib/data/tour-options";
import { initialFormState } from "@/lib/forms";
import type {
  GalleryItem,
  SurroundingItem,
  Surroundings,
} from "@/lib/tours/json";
import type { UploadedImage } from "@/lib/storage/types";

const STEPS = [
  {
    id: "general",
    title: "General",
    description: "Content, FAQs, and itinerary",
  },
  {
    id: "images",
    title: "Images",
    description: "Banner, cover, and gallery",
  },
  {
    id: "location",
    title: "Location",
    description: "Destination, address, and map",
  },
  {
    id: "pricing",
    title: "Pricing",
    description: "Price, currency, and difficulty",
  },
  {
    id: "availability",
    title: "Availability",
    description: "Default state and calendar import",
  },
  {
    id: "status",
    title: "Status",
    description: "Featured and attributes",
  },
  {
    id: "seo",
    title: "SEO",
    description: "Search and social sharing",
  },
] as const;

type StepId = (typeof STEPS)[number]["id"];

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
  "id" | "imageUrl" | "imageKey" | "imageDriver" | "featuredImageUrl" | "featuredImageKey" | "featuredImageDriver" | "seoImageUrl" | "seoImageKey" | "seoImageDriver" | "gallery"
> & {
  /** Full-width top banner on the tour page → featuredImage* */
  banner: UploadedImage | null;
  /** Card / listing image → imageUrl* */
  cover: UploadedImage | null;
  seoImage: UploadedImage | null;
  gallery: GalleryItem[];
};

function emptySurroundings(): Surroundings {
  return { education: [], health: [], transportation: [] };
}

function buildDraft(tour?: TourFormValues): Draft {
  if (!tour) {
    return {
      title: "",
      summary: "",
      description: "",
      category: "",
      youtubeUrl: "",
      minDayBeforeBooking: null,
      durationDays: 5,
      durationLabel: "5",
      difficulty: "moderate",
      minPeople: 1,
      maxGroupSize: 12,
      priceFrom: 0,
      currency: "INR",
      faqs: [],
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
    category: tour.category,
    youtubeUrl: tour.youtubeUrl,
    minDayBeforeBooking: tour.minDayBeforeBooking,
    durationDays: tour.durationDays,
    durationLabel: tour.durationLabel || String(tour.durationDays),
    difficulty: tour.difficulty,
    minPeople: tour.minPeople,
    maxGroupSize: tour.maxGroupSize,
    priceFrom: tour.priceFrom,
    currency: tour.currency,
    faqs: tour.faqs,
    includes: tour.includes,
    excludes: tour.excludes,
    itinerary: tour.itinerary,
    surroundings: tour.surroundings,
    address: tour.address,
    mapLat: tour.mapLat,
    mapLng: tour.mapLng,
    mapZoom: tour.mapZoom,
    isFeatured: tour.isFeatured,
    defaultState: tour.defaultState,
    travelStyles: tour.travelStyles,
    facilities: tour.facilities,
    icalImportUrl: tour.icalImportUrl,
    seoIndex: tour.seoIndex,
    seoTitle: tour.seoTitle,
    seoDescription: tour.seoDescription,
    facebookTitle: tour.facebookTitle,
    facebookDescription: tour.facebookDescription,
    twitterTitle: tour.twitterTitle,
    twitterDescription: tour.twitterDescription,
    published: tour.published,
    destinationId: tour.destinationId,
    banner:
      imageFromFields(
        tour.featuredImageUrl,
        tour.featuredImageKey,
        tour.featuredImageDriver,
      ) ?? imageFromFields(tour.imageUrl, tour.imageKey, tour.imageDriver),
    cover: imageFromFields(tour.imageUrl, tour.imageKey, tour.imageDriver),
    seoImage: imageFromFields(
      tour.seoImageUrl,
      tour.seoImageKey,
      tour.seoImageDriver,
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

export function TourTabsForm({
  tour,
  destinations,
}: {
  tour?: TourFormValues;
  destinations: { id: string; name: string }[];
}) {
  const isEdit = Boolean(tour);
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [draft, setDraft] = useState<Draft>(() => buildDraft(tour));
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

  const destinationName = useMemo(
    () =>
      destinations.find((item) => item.id === draft.destinationId)?.name ?? "—",
    [destinations, draft.destinationId],
  );

  function clearFieldError(name: string) {
    setFieldErrors((current) => {
      if (!current[name]) return current;
      const next = { ...current };
      delete next[name];
      return next;
    });
  }

  function patch<K extends keyof Draft>(key: K, value: Draft[K]) {
    setDraft((current) => ({ ...current, [key]: value }));
    clearFieldError(String(key));
  }

  function toggleList(key: "travelStyles" | "facilities", value: string) {
    setDraft((current) => {
      const list = current[key];
      return {
        ...current,
        [key]: list.includes(value)
          ? list.filter((item) => item !== value)
          : [...list, value],
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
      if (!Number.isInteger(draft.durationDays) || draft.durationDays < 1) {
        errors.durationDays = "Duration days must be at least 1.";
      }
      if (!Number.isInteger(draft.minPeople) || draft.minPeople < 1) {
        errors.minPeople = "Minimum people must be at least 1.";
      }
      if (!Number.isInteger(draft.maxGroupSize) || draft.maxGroupSize < 1) {
        errors.maxGroupSize = "Max people must be at least 1.";
      }
      if (
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

    if (id === "location") {
      if (!draft.destinationId) {
        errors.destinationId = "Choose a destination.";
      }
    }

    if (id === "pricing") {
      if (!Number.isInteger(draft.priceFrom) || draft.priceFrom < 0) {
        errors.priceFrom = "Price must be zero or more.";
      }
      if (!draft.currency.trim()) errors.currency = "Choose a currency.";
      if (!draft.difficulty.trim()) {
        errors.difficulty = "Choose a difficulty.";
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
    formData.set("durationDays", String(draft.durationDays));
    formData.set("durationLabel", draft.durationLabel.trim());
    formData.set("difficulty", draft.difficulty);
    formData.set("minPeople", String(draft.minPeople));
    formData.set("maxGroupSize", String(draft.maxGroupSize));
    formData.set("priceFrom", String(draft.priceFrom));
    formData.set("currency", draft.currency);
    formData.set("destinationId", draft.destinationId);
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
    formData.set("faqsJson", JSON.stringify(draft.faqs));
    formData.set("includesJson", JSON.stringify(draft.includes));
    formData.set("excludesJson", JSON.stringify(draft.excludes));
    formData.set("itineraryJson", JSON.stringify(draft.itinerary));
    formData.set("surroundingsJson", JSON.stringify(draft.surroundings));
    formData.set("galleryJson", JSON.stringify(draft.gallery));
    formData.set("travelStylesJson", JSON.stringify(draft.travelStyles));
    formData.set("facilitiesJson", JSON.stringify(draft.facilities));
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

  function saveAndContinue() {
    if (imageBusy) {
      setFormError("Wait for image uploads to finish.");
      return;
    }
    const errors = validateDraftFields();
    if (Object.keys(errors).length > 0) {
      showFieldErrors(errors, 0);
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

  function updateSurrounding(
    group: keyof Surroundings,
    index: number,
    key: keyof SurroundingItem,
    value: string,
  ) {
    setDraft((current) => {
      const next = current.surroundings[group].map((item, i) =>
        i === index ? { ...item, [key]: value } : item,
      );
      return {
        ...current,
        surroundings: { ...current.surroundings, [group]: next },
      };
    });
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

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-4 sm:px-5">
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
                  onChange={(e) => patch("title", e.target.value)}
                  className="!h-10"
                  placeholder="Title"
                  aria-invalid={Boolean(fieldErrors.title)}
                />
              </Field>
              <Field label="Content" hint="Longer tour description.">
                <textarea
                  value={draft.description}
                  onChange={(e) => patch("description", e.target.value)}
                  rows={8}
                  className="!min-h-0 resize-y"
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
                  onChange={(e) => patch("summary", e.target.value)}
                  rows={3}
                  className="!min-h-0 resize-y"
                  aria-invalid={Boolean(fieldErrors.summary)}
                />
              </Field>
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Category">
                  <SearchableSelect
                    value={draft.category}
                    onChange={(value) => patch("category", value)}
                    emptyLabel="Choose a category"
                    searchPlaceholder="Search categories"
                    options={tourCategories.map((item) => ({
                      value: item,
                      label: item,
                    }))}
                    className="!h-10"
                  />
                </Field>
                <Field label="Youtube video">
                  <input
                    value={draft.youtubeUrl}
                    onChange={(e) => patch("youtubeUrl", e.target.value)}
                    className="!h-10"
                    placeholder="Youtube link video"
                  />
                </Field>
                <Field
                  label="Minimum advance reservations"
                  hint="Leave blank if not needed."
                >
                  <input
                    type="number"
                    min={0}
                    value={draft.minDayBeforeBooking ?? ""}
                    onChange={(e) =>
                      patch(
                        "minDayBeforeBooking",
                        e.target.value === ""
                          ? null
                          : Number(e.target.value),
                      )
                    }
                    className="!h-10"
                    placeholder="Ex: 3"
                  />
                </Field>
                <Field label="Duration (hours / label)">
                  <input
                    value={draft.durationLabel}
                    onChange={(e) => patch("durationLabel", e.target.value)}
                    className="!h-10"
                    placeholder="Duration"
                  />
                </Field>
                <Field
                  label="Duration days"
                  name="durationDays"
                  required
                  error={fieldErrors.durationDays}
                >
                  <input
                    type="number"
                    min={1}
                    value={draft.durationDays}
                    onChange={(e) =>
                      patch("durationDays", Number(e.target.value))
                    }
                    className="!h-10"
                    aria-invalid={Boolean(fieldErrors.durationDays)}
                  />
                </Field>
                <Field
                  label="Tour min people"
                  name="minPeople"
                  required
                  error={fieldErrors.minPeople}
                >
                  <input
                    type="number"
                    min={1}
                    value={draft.minPeople}
                    onChange={(e) => patch("minPeople", Number(e.target.value))}
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
                    value={draft.maxGroupSize}
                    onChange={(e) =>
                      patch("maxGroupSize", Number(e.target.value))
                    }
                    className="!h-10"
                    aria-invalid={Boolean(fieldErrors.maxGroupSize)}
                  />
                </Field>
              </div>

              <RepeaterCard
                title="FAQs"
                onAdd={() =>
                  patch("faqs", [...draft.faqs, { title: "", content: "" }])
                }
              >
                {draft.faqs.length === 0 ? (
                  <p className="text-xs text-muted">No FAQ items yet.</p>
                ) : (
                  draft.faqs.map((item, index) => (
                    <div key={index} className="grid gap-3 rounded-md border border-line p-3">
                      <Field label="Question" help="tour.faq.question">
                        <input
                          value={item.title}
                          placeholder="Eg: When and where does the tour end?"
                          className="!h-10"
                          onChange={(e) => {
                            const faqs = draft.faqs.map((row, i) =>
                              i === index ? { ...row, title: e.target.value } : row,
                            );
                            patch("faqs", faqs);
                          }}
                        />
                      </Field>
                      <Field label="Answer" help="tour.faq.answer">
                        <textarea
                          value={item.content}
                          rows={3}
                          className="!min-h-0 resize-y"
                          onChange={(e) => {
                            const faqs = draft.faqs.map((row, i) =>
                              i === index
                                ? { ...row, content: e.target.value }
                                : row,
                            );
                            patch("faqs", faqs);
                          }}
                        />
                      </Field>
                      <button
                        type="button"
                        className="justify-self-start text-xs text-red-700"
                        onClick={() =>
                          patch(
                            "faqs",
                            draft.faqs.filter((_, i) => i !== index),
                          )
                        }
                      >
                        Remove
                      </button>
                    </div>
                  ))
                )}
              </RepeaterCard>

              <div className="grid gap-4 lg:grid-cols-2">
                <RepeaterCard
                  title="Include"
                  onAdd={() =>
                    patch("includes", [...draft.includes, { title: "" }])
                  }
                >
                  {draft.includes.map((item, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <FieldHelp label="Included item" help="Include" />
                      <input
                        value={item.title}
                        placeholder="Eg: Specialized bilingual guide"
                        className="!h-10"
                        onChange={(e) => {
                          const includes = draft.includes.map((row, i) =>
                            i === index ? { title: e.target.value } : row,
                          );
                          patch("includes", includes);
                        }}
                      />
                      <Button
                        type="button"
                        size="sm"
                        variant="dangerOutline"
                        onClick={() =>
                          patch(
                            "includes",
                            draft.includes.filter((_, i) => i !== index),
                          )
                        }
                      >
                        ✕
                      </Button>
                    </div>
                  ))}
                </RepeaterCard>
                <RepeaterCard
                  title="Exclude"
                  onAdd={() =>
                    patch("excludes", [...draft.excludes, { title: "" }])
                  }
                >
                  {draft.excludes.map((item, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <FieldHelp label="Excluded item" help="Exclude" />
                      <input
                        value={item.title}
                        placeholder="Eg: Additional services"
                        className="!h-10"
                        onChange={(e) => {
                          const excludes = draft.excludes.map((row, i) =>
                            i === index ? { title: e.target.value } : row,
                          );
                          patch("excludes", excludes);
                        }}
                      />
                      <Button
                        type="button"
                        size="sm"
                        variant="dangerOutline"
                        onClick={() =>
                          patch(
                            "excludes",
                            draft.excludes.filter((_, i) => i !== index),
                          )
                        }
                      >
                        ✕
                      </Button>
                    </div>
                  ))}
                </RepeaterCard>
              </div>

              <RepeaterCard
                title="Itinerary"
                onAdd={() =>
                  patch("itinerary", [
                    ...draft.itinerary,
                    {
                      dayNumber: draft.itinerary.length + 1,
                      title: "",
                      description: "",
                    },
                  ])
                }
              >
                {draft.itinerary.map((item, index) => (
                  <div key={index} className="grid gap-3 rounded-md border border-line p-3">
                    <div className="grid gap-3 sm:grid-cols-[8rem_1fr]">
                      <Field label="Day" help="tour.day.number">
                        <input
                          type="number"
                          min={1}
                          value={item.dayNumber}
                          className="!h-10"
                          onChange={(e) => {
                            const itinerary = draft.itinerary.map((row, i) =>
                              i === index
                                ? { ...row, dayNumber: Number(e.target.value) }
                                : row,
                            );
                            patch("itinerary", itinerary);
                          }}
                        />
                      </Field>
                      <Field label="Day title" help="tour.day.title">
                        <input
                          value={item.title}
                          placeholder="Title: Day 1"
                          className="!h-10"
                          onChange={(e) => {
                            const itinerary = draft.itinerary.map((row, i) =>
                              i === index ? { ...row, title: e.target.value } : row,
                            );
                            patch("itinerary", itinerary);
                          }}
                        />
                      </Field>
                    </div>
                    <Field label="Day description" help="tour.day.description">
                      <textarea
                        value={item.description}
                        rows={3}
                        placeholder="Day description"
                        className="!min-h-0 resize-y"
                        onChange={(e) => {
                          const itinerary = draft.itinerary.map((row, i) =>
                            i === index
                              ? { ...row, description: e.target.value }
                              : row,
                          );
                          patch("itinerary", itinerary);
                        }}
                      />
                    </Field>
                    <button
                      type="button"
                      className="justify-self-start text-xs text-red-700"
                      onClick={() =>
                        patch(
                          "itinerary",
                          draft.itinerary.filter((_, i) => i !== index),
                        )
                      }
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </RepeaterCard>

              {(["education", "health", "transportation"] as const).map(
                (group) => (
                  <RepeaterCard
                    key={group}
                    title={`Surroundings · ${group[0].toUpperCase()}${group.slice(1)}`}
                    help="tour.surroundings"
                    onAdd={() =>
                      patch("surroundings", {
                        ...draft.surroundings,
                        [group]: [
                          ...draft.surroundings[group],
                          { name: "", content: "", distance: "" },
                        ],
                      })
                    }
                  >
                    {draft.surroundings[group].map((item, index) => (
                      <div
                        key={index}
                        className="grid gap-3 rounded-md border border-line p-3 sm:grid-cols-3"
                      >
                        <Field label="Name" help="tour.surroundings.name">
                          <input
                            value={item.name}
                            placeholder="Name"
                            className="!h-10"
                            onChange={(e) =>
                              updateSurrounding(group, index, "name", e.target.value)
                            }
                          />
                        </Field>
                        <Field label="Detail" help="tour.surroundings.content">
                          <input
                            value={item.content}
                            placeholder="Content"
                            className="!h-10"
                            onChange={(e) =>
                              updateSurrounding(
                                group,
                                index,
                                "content",
                                e.target.value,
                              )
                            }
                          />
                        </Field>
                        <div className="flex items-end gap-2">
                          <div className="min-w-0 flex-1">
                            <Field label="Distance" help="tour.surroundings.distance">
                              <input
                                value={item.distance}
                                placeholder="Distance"
                                className="!h-10"
                                onChange={(e) =>
                                  updateSurrounding(
                                    group,
                                    index,
                                    "distance",
                                    e.target.value,
                                  )
                                }
                              />
                            </Field>
                          </div>
                          <Button
                            type="button"
                            size="sm"
                            variant="dangerOutline"
                            onClick={() =>
                              patch("surroundings", {
                                ...draft.surroundings,
                                [group]: draft.surroundings[group].filter(
                                  (_, i) => i !== index,
                                ),
                              })
                            }
                          >
                            ✕
                          </Button>
                        </div>
                      </div>
                    ))}
                  </RepeaterCard>
                ),
              )}
            </div>
          ) : null}

          {currentStepId === "images" ? (
            <div className="grid max-w-3xl gap-6">
              <ImageUploader
                folder="tours"
                label="Banner image"
                required
                fieldName="banner"
                value={draft.banner}
                initialValue={draft.banner}
                onChange={(value) => patch("banner", value)}
                onBusyChange={setImageBusy}
                withHiddenFields={false}
                error={fieldErrors.banner}
                hint="Full-width photo at the top of the tour page. Prefer a wide landscape shot."
              />

              <ImageUploader
                folder="tours"
                label="Cover image"
                required
                fieldName="cover"
                value={draft.cover}
                initialValue={draft.cover}
                onChange={(value) => patch("cover", value)}
                onBusyChange={setImageBusy}
                withHiddenFields={false}
                error={fieldErrors.cover}
                hint="Shown on tour cards in listings and destination pages."
              />

              <div className="grid gap-2">
                <div className="flex items-center justify-between gap-3">
                  <p className="inline-flex items-center gap-1.5 text-sm font-medium text-navy">
                    Gallery
                    <FieldHelp label="Gallery" />
                  </p>
                  <p className="text-xs text-muted">Upload images one by one</p>
                </div>
                <ImageUploader
                  folder="tours"
                  label="Add gallery image"
                  value={null}
                  onChange={(value) => {
                    if (!value) return;
                    patch("gallery", [...draft.gallery, value]);
                  }}
                  onBusyChange={setImageBusy}
                  withHiddenFields={false}
                />
                {draft.gallery.length > 0 ? (
                  <ul className="grid gap-2 sm:grid-cols-3">
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
                          className="absolute top-2 right-2 rounded bg-white/90 px-2 py-1 text-[11px] text-red-700"
                          onClick={() =>
                            patch(
                              "gallery",
                              draft.gallery.filter((_, i) => i !== index),
                            )
                          }
                        >
                          Remove
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>
            </div>
          ) : null}

          {currentStepId === "location" ? (
            <div className="grid max-w-xl gap-3">
              <Field
                label="Destination"
                name="destinationId"
                required
                error={fieldErrors.destinationId}
              >
                <SearchableSelect
                  value={draft.destinationId}
                  onChange={(value) => patch("destinationId", value)}
                  emptyLabel="Choose a destination"
                  searchPlaceholder="Search destinations"
                  required
                  invalid={Boolean(fieldErrors.destinationId)}
                  options={destinations.map((destination) => ({
                    value: destination.id,
                    label: destination.name,
                  }))}
                  className="!h-10"
                />
              </Field>
              <Field label="Real tour address">
                <input
                  value={draft.address}
                  onChange={(e) => patch("address", e.target.value)}
                  className="!h-10"
                  placeholder="Real tour address"
                />
              </Field>
              <p className="text-xs text-muted">
                Geographic coordinates for map display.
              </p>
              <div className="grid gap-3 sm:grid-cols-3">
                <Field label="Map latitude">
                  <input
                    value={draft.mapLat}
                    onChange={(e) => patch("mapLat", e.target.value)}
                    className="!h-10"
                  />
                </Field>
                <Field label="Map longitude">
                  <input
                    value={draft.mapLng}
                    onChange={(e) => patch("mapLng", e.target.value)}
                    className="!h-10"
                  />
                </Field>
                <Field label="Map zoom">
                  <input
                    type="number"
                    min={1}
                    max={20}
                    value={draft.mapZoom}
                    onChange={(e) => patch("mapZoom", Number(e.target.value))}
                    className="!h-10"
                  />
                </Field>
              </div>
              {destinationName !== "—" ? (
                <p className="text-xs text-muted">
                  Linked destination: {destinationName}
                </p>
              ) : null}
            </div>
          ) : null}

          {currentStepId === "pricing" ? (
            <div className="grid max-w-xl gap-3">
              <div className="grid gap-3 sm:grid-cols-2">
                <Field
                  label="Price from"
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
                <Field
                  label="Difficulty"
                  name="difficulty"
                  required
                  error={fieldErrors.difficulty}
                >
                  <SearchableSelect
                    value={draft.difficulty}
                    onChange={(value) => patch("difficulty", value)}
                    searchPlaceholder="Search difficulty"
                    required
                    invalid={Boolean(fieldErrors.difficulty)}
                    options={[
                      { value: "easy", label: "Easy" },
                      { value: "moderate", label: "Moderate" },
                      { value: "challenging", label: "Challenging" },
                    ]}
                    className="!h-10"
                  />
                </Field>
              </div>
            </div>
          ) : null}

          {currentStepId === "availability" ? (
            <div className="grid max-w-xl gap-3">
              <Field label="Default state">
                <SearchableSelect
                  value={draft.defaultState}
                  onChange={(value) => patch("defaultState", value)}
                  searchPlaceholder="Search states"
                  options={defaultStateOptions}
                  className="!h-10"
                />
              </Field>
              <Field label="iCal import URL">
                <input
                  value={draft.icalImportUrl}
                  onChange={(e) => patch("icalImportUrl", e.target.value)}
                  className="!h-10"
                  placeholder="Import url"
                />
              </Field>
              <p className="rounded-lg border border-line bg-surface px-3 py-2 text-xs text-muted">
                Departure dates and seat inventory can be managed next from the
                tour departures calendar.
              </p>
            </div>
          ) : null}

          {currentStepId === "status" ? (
            <div className="grid max-w-2xl gap-4">
              <p className="rounded-lg border border-line bg-surface px-3 py-2 text-xs text-muted">
                <span className="font-medium text-navy">Save and continue</span>{" "}
                stores progress. When every required field is complete,{" "}
                <span className="font-medium text-navy">Save and publish</span>{" "}
                makes the tour live.
              </p>
              <label className="flex items-center gap-3 rounded-lg border border-line px-3 py-2.5 text-sm">
                <input
                  type="checkbox"
                  checked={draft.isFeatured}
                  onChange={(e) => patch("isFeatured", e.target.checked)}
                  className="h-4 w-4 accent-brand"
                />
                <span>
                  <span className="inline-flex items-center gap-1.5 font-medium text-navy">
                    Featured tour
                    <FieldHelp label="Featured tour" />
                  </span>
                  <span className="mt-0.5 block text-xs text-muted">
                    Highlight this tour on listing pages.
                  </span>
                </span>
              </label>

              <div>
                <p className="mb-2 inline-flex items-center gap-1.5 text-sm font-medium text-navy">
                  Travel styles
                  <FieldHelp label="Travel styles" />
                </p>
                <div className="grid gap-2 sm:grid-cols-2">
                  {travelStyles.map((item) => (
                    <label key={item} className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={draft.travelStyles.includes(item)}
                        onChange={() => toggleList("travelStyles", item)}
                        className="accent-brand"
                      />
                      {item}
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <p className="mb-2 inline-flex items-center gap-1.5 text-sm font-medium text-navy">
                  Facilities
                  <FieldHelp label="Facilities" />
                </p>
                <div className="grid gap-2 sm:grid-cols-2">
                  {tourFacilities.map((item) => (
                    <label key={item} className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={draft.facilities.includes(item)}
                        onChange={() => toggleList("facilities", item)}
                        className="accent-brand"
                      />
                      {item}
                    </label>
                  ))}
                </div>
              </div>

            </div>
          ) : null}

          {currentStepId === "seo" ? (
            <div className="grid max-w-xl gap-3">
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
              <Field label="SEO title">
                <input
                  value={draft.seoTitle}
                  onChange={(e) => patch("seoTitle", e.target.value)}
                  className="!h-10"
                  placeholder="Leave blank to use tour title"
                />
              </Field>
              <Field label="SEO description">
                <textarea
                  value={draft.seoDescription}
                  onChange={(e) => patch("seoDescription", e.target.value)}
                  rows={3}
                  className="!min-h-0 resize-y"
                />
              </Field>
              <ImageUploader
                folder="tours"
                label="Featured SEO image"
                value={draft.seoImage}
                initialValue={draft.seoImage}
                onChange={(value) => patch("seoImage", value)}
                onBusyChange={setImageBusy}
                withHiddenFields={false}
              />
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
