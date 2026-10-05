"use client";

import { useActionState, useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createTour, updateTour } from "@/actions/tours";
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
    description: "Content, media, FAQs, and itinerary",
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
    description: "Publish, attributes, and feature image",
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
    <ol className="grid w-full min-w-0 grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
      {STEPS.map((step, index) => {
        const active = index === current;
        const done = index < current;
        return (
          <li key={step.id} className="min-w-0">
            <button
              type="button"
              onClick={() => onJump(index)}
              disabled={index > current}
              title={step.description}
              className={[
                "flex w-full min-w-0 items-center gap-2 rounded-lg border px-2.5 py-2 text-left transition-colors",
                active
                  ? "border-brand bg-brand-soft"
                  : done
                    ? "border-line bg-white hover:bg-surface"
                    : "border-line bg-surface text-muted",
                index > current ? "cursor-not-allowed opacity-60" : "",
              ]
                .filter(Boolean)
                .join(" ")}
            >
              <span
                className={[
                  "flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold",
                  active || done
                    ? "bg-brand text-white"
                    : "bg-white text-muted ring-1 ring-line",
                ].join(" ")}
              >
                {done ? "✓" : index + 1}
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
  banner: UploadedImage | null;
  featured: UploadedImage | null;
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
      published: true,
      destinationId: "",
      banner: null,
      featured: null,
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
    banner: imageFromFields(tour.imageUrl, tour.imageKey, tour.imageDriver),
    featured: imageFromFields(
      tour.featuredImageUrl,
      tour.featuredImageKey,
      tour.featuredImageDriver,
    ),
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
  const [imageBusy, setImageBusy] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const currentStepId: StepId = STEPS[step].id;
  const [state, action] = useActionState(
    isEdit ? updateTour : createTour,
    initialFormState,
  );
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    if (state.success) {
      router.push("/admin/tours?saved=1");
      router.refresh();
    }
  }, [state.success, router]);

  const destinationName = useMemo(
    () =>
      destinations.find((item) => item.id === draft.destinationId)?.name ?? "—",
    [destinations, draft.destinationId],
  );

  function patch<K extends keyof Draft>(key: K, value: Draft[K]) {
    setDraft((current) => ({ ...current, [key]: value }));
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

  function validateStep(index: number): string | null {
    const id = STEPS[index].id;
    if (id === "general") {
      if (!draft.banner) return "Upload a banner image.";
      if (draft.title.trim().length < 2) return "Enter a title.";
      if (draft.summary.trim().length < 10) {
        return "Add a short description (at least 10 characters).";
      }
      return null;
    }
    if (id === "location") {
      if (!draft.destinationId) return "Choose a destination.";
      return null;
    }
    if (id === "pricing") {
      if (!Number.isInteger(draft.durationDays) || draft.durationDays < 1) {
        return "Duration days must be at least 1.";
      }
      if (!Number.isInteger(draft.maxGroupSize) || draft.maxGroupSize < 1) {
        return "Max people must be at least 1.";
      }
      if (!Number.isInteger(draft.priceFrom) || draft.priceFrom < 0) {
        return "Price must be zero or more.";
      }
      return null;
    }
    return null;
  }

  function goNext() {
    if (imageBusy) {
      setFormError("Wait for image uploads to finish.");
      return;
    }
    const error = validateStep(step);
    if (error) {
      setFormError(error);
      return;
    }
    setFormError(null);
    setStep((current) => Math.min(current + 1, STEPS.length - 1));
  }

  function goBack() {
    setFormError(null);
    setStep((current) => Math.max(current - 1, 0));
  }

  function jumpTo(index: number) {
    if (index > step) return;
    setFormError(null);
    setStep(index);
  }

  function save() {
    if (imageBusy) {
      setFormError("Wait for image uploads to finish.");
      return;
    }
    for (let index = 0; index < STEPS.length; index += 1) {
      const error = validateStep(index);
      if (error) {
        setStep(index);
        setFormError(error);
        return;
      }
    }

    const formData = new FormData();
    if (tour) formData.set("tourId", tour.id);
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
    if (draft.published) formData.set("published", "on");
    if (draft.isFeatured) formData.set("isFeatured", "on");
    if (draft.seoIndex) formData.set("seoIndex", "on");

    if (draft.banner) {
      formData.set("imageUrl", draft.banner.url);
      formData.set("imageKey", draft.banner.key);
      formData.set("imageDriver", draft.banner.driver);
    }
    if (draft.featured) {
      formData.set("featuredImageUrl", draft.featured.url);
      formData.set("featuredImageKey", draft.featured.key);
      formData.set("featuredImageDriver", draft.featured.driver);
    }
    if (draft.seoImage) {
      formData.set("seoImageUrl", draft.seoImage.url);
      formData.set("seoImageKey", draft.seoImage.key);
      formData.set("seoImageDriver", draft.seoImage.driver);
    }

    setFormError(null);
    startTransition(() => action(formData));
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
        <div className="shrink-0 border-b border-line px-4 py-3 sm:px-5">
          <h2 className="text-sm font-semibold text-navy">
            {STEPS[step].title}
          </h2>
          <p className="mt-0.5 text-xs text-muted">{STEPS[step].description}</p>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-4 sm:px-5">
        {currentStepId === "general" ? (
            <div className="grid gap-4">
              <Field label="Title">
                <input
                  value={draft.title}
                  onChange={(e) => patch("title", e.target.value)}
                  className="!h-10"
                  placeholder="Title"
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
              <Field label="Short description" hint="Shown on cards.">
                <textarea
                  value={draft.summary}
                  onChange={(e) => patch("summary", e.target.value)}
                  rows={3}
                  className="!min-h-0 resize-y"
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
                <Field label="Duration days">
                  <input
                    type="number"
                    min={1}
                    value={draft.durationDays}
                    onChange={(e) =>
                      patch("durationDays", Number(e.target.value))
                    }
                    className="!h-10"
                  />
                </Field>
                <Field label="Tour min people">
                  <input
                    type="number"
                    min={1}
                    value={draft.minPeople}
                    onChange={(e) => patch("minPeople", Number(e.target.value))}
                    className="!h-10"
                  />
                </Field>
                <Field label="Tour max people">
                  <input
                    type="number"
                    min={1}
                    value={draft.maxGroupSize}
                    onChange={(e) =>
                      patch("maxGroupSize", Number(e.target.value))
                    }
                    className="!h-10"
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

              <ImageUploader
                folder="tours"
                label="Banner image"
                required
                value={draft.banner}
                initialValue={draft.banner}
                onChange={(value) => patch("banner", value)}
                onBusyChange={setImageBusy}
                withHiddenFields={false}
              />

              <div className="grid gap-2">
                <div className="flex items-center justify-between">
                  <p className="inline-flex items-center gap-1.5 text-sm font-medium text-navy">
                    Gallery
                    <FieldHelp label="Gallery" />
                  </p>
                  <p className="text-xs text-muted">
                    Upload images one by one
                  </p>
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

          {currentStepId === "location" ? (
            <div className="grid max-w-xl gap-3">
              <Field label="Destination">
                <SearchableSelect
                  value={draft.destinationId}
                  onChange={(value) => patch("destinationId", value)}
                  emptyLabel="Choose a destination"
                  searchPlaceholder="Search destinations"
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
                <Field label="Price from">
                  <input
                    type="number"
                    min={0}
                    value={draft.priceFrom}
                    onChange={(e) => patch("priceFrom", Number(e.target.value))}
                    className="!h-10"
                  />
                </Field>
                <Field label="Currency">
                  <SearchableSelect
                    value={draft.currency}
                    onChange={(value) => patch("currency", value)}
                    searchPlaceholder="Search currencies"
                    options={[
                      { value: "INR", label: "INR" },
                      { value: "USD", label: "USD" },
                      { value: "EUR", label: "EUR" },
                    ]}
                    className="!h-10"
                  />
                </Field>
                <Field label="Difficulty">
                  <SearchableSelect
                    value={draft.difficulty}
                    onChange={(value) => patch("difficulty", value)}
                    searchPlaceholder="Search difficulty"
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
              <div className="grid gap-2">
                <p className="inline-flex items-center gap-1.5 text-sm font-medium text-navy">
                  Visibility
                  <FieldHelp label="Visibility" />
                </p>
              <div className="flex flex-wrap gap-4">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="radio"
                    checked={draft.published}
                    onChange={() => patch("published", true)}
                    className="accent-brand"
                  />
                  Publish
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="radio"
                    checked={!draft.published}
                    onChange={() => patch("published", false)}
                    className="accent-brand"
                  />
                  Draft
                </label>
              </div>
              </div>
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

              <ImageUploader
                folder="tours"
                label="Feature image"
                value={draft.featured}
                initialValue={draft.featured}
                onChange={(value) => patch("featured", value)}
                onBusyChange={setImageBusy}
                withHiddenFields={false}
              />
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
                  size="sm"
                  className="w-full sm:w-auto"
                  onClick={goNext}
                  disabled={imageBusy}
                >
                  Continue
                </Button>
              ) : (
                <Button
                  type="button"
                  size="sm"
                  className="w-full sm:w-auto"
                  onClick={save}
                  disabled={pending || imageBusy}
                >
                  {pending
                    ? isEdit
                      ? "Saving…"
                      : "Creating…"
                    : isEdit
                      ? "Save changes"
                      : "Create tour"}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
