/**
 * LOCKED tour format — approved against Classic Kashmir Triangle.
 * Do not invent alternate admin tabs, public sections, or image slots.
 * Canonical example: `src/lib/demo/sample-tour-classic-kashmir.ts`
 * Live reference: `/tours/classic-kashmir-triangle`
 */

export const TOUR_FORMAT_STATUS = "locked" as const;
export const TOUR_FORMAT_REFERENCE_SLUG = "classic-kashmir-triangle";

/** Admin TourTabsForm steps — order is fixed. */
export const TOUR_ADMIN_STEPS = [
  "general",
  "itinerary",
  "content",
  "pricing",
  "details",
  "images",
  "seo",
] as const;

export type TourAdminStep = (typeof TOUR_ADMIN_STEPS)[number];

/** Shared catalog kinds tours may link (icon + title; content where needed). */
export const TOUR_CATALOG_KINDS = [
  "category",
  "style",
  "facility",
  "faq",
  "include",
  "exclude",
  "before_you_go",
] as const;

export type TourCatalogKind = (typeof TOUR_CATALOG_KINDS)[number];

/** Public tour page section anchors (TourStay). Empty data → hide section. */
export const TOUR_PUBLIC_SECTIONS = [
  "overview",
  "departures",
  "itinerary",
  "included",
  "excluded",
  "trip",
  "meeting",
  "before",
  "faq",
  "book",
] as const;

/** Each itinerary day uses Morning / Afternoon / Evening (not a single blob). */
export const TOUR_ITINERARY_PERIODS = ["morning", "afternoon", "evening"] as const;

/**
 * Required media for a publishable tour.
 * Keys relative to `public/uploads/`. Day photos are place-matched to that day’s stops.
 */
export const TOUR_IMAGE_REQUIREMENTS = {
  cover: { required: true, file: "{slug}-cover.jpg", frame: "16:10" },
  gallery: { required: true, minCount: 4, file: "{slug}-g{n}.jpg", frame: "4:3" },
  day: { required: true, file: "{slug}-d{dayNumber}.jpg", note: "One photo per itinerary day" },
  seo: { required: false, file: "{slug}-cover.jpg", note: "Defaults to cover" },
} as const;

/** Checklist used when adding or seeding any new tour. */
export const TOUR_FORMAT_CHECKLIST = [
  "Fill all 7 admin tabs (general → seo)",
  "Itinerary days: title + morning/afternoon/evening; original copy only",
  "Link destinations; set pickup address + map pin",
  "Catalog: category, styles, facilities, FAQs, includes, excludes, before_you_go",
  "Images: cover + ≥4 gallery + one place-matched photo per day (not random stock)",
  "SEO title/description + publish only when media is complete",
  "Public page: Before you go and FAQ as separate sections",
] as const;

export {
  sampleTourClassicKashmir as lockedTourFormatExample,
  type TourFormat,
} from "@/lib/demo/sample-tour-classic-kashmir";
