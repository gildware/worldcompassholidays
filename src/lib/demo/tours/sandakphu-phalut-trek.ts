/**
 * Locked-format tour — sandakphu-phalut-trek (Batch 4 media-ready).
 * Copy from pending-tours; media wired to public/uploads/tours.
 */
import type { SampleCatalogRef, TourFormat } from "../sample-tour-classic-kashmir";
import {
  indiaTrekAdventureCatalogExtras,
  indiaTrekAdventurePendingTours,
} from "../pending-tours/india-trek-adventure";
import { withLocalTourImages } from "./with-local-tour-images";

const SLUG = "sandakphu-phalut-trek";

const base = indiaTrekAdventurePendingTours.find((t) => t.slug === SLUG);
if (!base) {
  throw new Error(`Missing pending tour ${SLUG}`);
}

const FAQ_TITLES = [
  'What camping gear is provided?',
] as const;

const BEFORE_TITLES = [
  'Trek kit list',
  'Altitude readiness',
] as const;

export const sandakphuPhalutTrekCatalogExtras: SampleCatalogRef[] = [
  { kind: "category", title: "Trekking" },
  { kind: "style", title: "Trekking & Camping" },
  { kind: "style", title: "Adventure" },
  { kind: "facility", title: "Trek guide and cook team" },
  { kind: "facility", title: "Licensed trek guide" },
  { kind: "facility", title: "Camping equipment" },
  { kind: "include", title: "Camping equipment (tent, sleeping bag, mat)" },
  { kind: "include", title: "Trek guide and camp meals on trail" },
  { kind: "include", title: "Licensed trek guide & camp support crew" },
  { kind: "include", title: "Meals on trek days (B/L/D as per itinerary)" },
  ...indiaTrekAdventureCatalogExtras.filter(
    (row) =>
      (row.kind === "faq" && (FAQ_TITLES as readonly string[]).includes(row.title)) ||
      (row.kind === "before_you_go" &&
        (BEFORE_TITLES as readonly string[]).includes(row.title)) ||
      (row.kind === "include" &&
        [
          "Inner-line permit assistance (Gurez / Warwan sector)",
          "Pony for communal kitchen & camp gear",
          "Forest / trek permit assistance (Uttarakhand & Sikkim sectors)",
          "Singalila National Park entry",
          "Lodge bed nights on ridge as listed",
        ].includes(row.title)) ||
      (row.kind === "exclude" &&
        [
          "Personal trekking poles, gaiters, or mountaineering kit",
          "Pony hire for personal baggage",
          "Pony / porter for personal baggage",
          "Gulmarg Gondola tickets (Alpather add-on)",
          "Personal sleeping bag liner (recommended)",
        ].includes(row.title)),
  ),
];

export const tourSandakphuPhalutTrek: TourFormat = withLocalTourImages(base);
