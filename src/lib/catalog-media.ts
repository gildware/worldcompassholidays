/** Seed / broken covers that should never show on product cards. */
const PLACEHOLDER_MARKERS = [
  "seed-kashmir.svg",
  "seed-kashmir-trek.svg",
  "/uploads/destinations/seed-",
];

const STAY_BY_PLACE: Array<{ match: RegExp; cover: string }> = [
  { match: /gulmarg|tangmarg|kunzer/i, cover: "/uploads/hotels/gulmarg-meadow-resort-cover.jpg" },
  { match: /pahalgam|aru|betaab|chandanwari/i, cover: "/uploads/hotels/pahalgam-river-homestay-cover.jpg" },
  { match: /sonamarg/i, cover: "/uploads/hotels/sonamarg-glacier-lodge-cover.jpg" },
  { match: /srinagar|dal|nishat|shankaracharya/i, cover: "/uploads/hotels/dal-lake-house-hotel-cover.jpg" },
  { match: /leh|ladakh/i, cover: "/uploads/hotels/leh-view-hotel-cover.jpg" },
  { match: /nubra/i, cover: "/uploads/hotels/nubra-desert-camp-cover.jpg" },
  { match: /shimla/i, cover: "/uploads/hotels/shimla-ridge-boutique-cover.jpg" },
  { match: /manali/i, cover: "/uploads/hotels/manali-cedar-resort-cover.jpg" },
  { match: /jammu/i, cover: "/uploads/hotels/jammu-ridge-hotel-cover.jpg" },
  { match: /katra|vaishno/i, cover: "/uploads/hotels/katra-yatra-lodge-cover.jpg" },
];

const STAY_ROTATION = [
  "/uploads/hotels/gulmarg-meadow-resort-cover.jpg",
  "/uploads/hotels/dal-lake-house-hotel-cover.jpg",
  "/uploads/hotels/pahalgam-river-homestay-cover.jpg",
  "/uploads/hotels/sonamarg-glacier-lodge-cover.jpg",
  "/img/company/service-hotels.jpg",
];

const RIDE_LOCAL_ALIASES: Record<string, string> = {
  "tvs-ntorq": "tvs-ntorq-125",
  "royal-enfield-himalayan-450": "re-himalayan-450",
  "royal-enfield-himalayan-411": "re-himalayan-450",
  "royal-enfield-hunter-350": "re-meteor-350",
  "re-himalayan-411": "re-himalayan-450",
  "toyota-innova": "toyota-innova-crysta",
};

const RIDE_LOCAL_SLUGS = new Set([
  "ampere-magnus",
  "aprilia-sr-160",
  "ather-450x",
  "ather-rizta",
  "bajaj-chetak",
  "bajaj-freedom-125",
  "bajaj-freedom-125-kerala",
  "bajaj-pulsar-150",
  "bajaj-pulsar-ns200",
  "bmw-3-series",
  "bmw-g310-gs",
  "byd-atto-3",
  "hero-splendor-plus",
  "hero-vida-v2",
  "hero-xpulse-200",
  "honda-activa",
  "honda-amaze",
  "honda-city",
  "honda-city-hybrid",
  "honda-dio",
  "honda-hness-cb350",
  "honda-shine",
  "honda-sp-125",
  "hyundai-aura",
  "hyundai-creta",
  "hyundai-creta-diesel",
  "hyundai-exter",
  "hyundai-i20",
  "jawa-42",
  "jawa-perak",
  "kia-carens",
  "ktm-390-adventure",
  "mahindra-scorpio-n",
  "mahindra-thar",
  "maruti-dzire",
  "maruti-swift",
  "re-bullet-350",
  "re-himalayan-450",
  "re-meteor-350",
  "royal-enfield-classic-350",
  "suzuki-access-125",
  "tork-kratos",
  "toyota-fortuner",
  "toyota-innova-crysta",
  "triumph-scrambler-400x",
  "tvs-iqube",
  "tvs-jupiter",
  "tvs-ntorq-125",
  "tvs-scooty-pep",
  "ultraviolette-f77",
]);

function hashPick(seed: string, options: string[]) {
  let total = 0;
  for (let i = 0; i < seed.length; i += 1) total += seed.charCodeAt(i);
  return options[total % options.length] || options[0];
}

export function isCatalogPlaceholder(url?: string | null) {
  if (!url?.trim()) return true;
  const value = url.trim().toLowerCase();
  return PLACEHOLDER_MARKERS.some((marker) => value.includes(marker));
}

export function resolveStayCover(opts: {
  url?: string | null;
  place?: string | null;
  slug?: string | null;
  fallback?: string;
}) {
  const fallback = opts.fallback || "/img/company/service-hotels.jpg";
  if (!isCatalogPlaceholder(opts.url)) return opts.url!.trim();

  const place = opts.place || "";
  for (const entry of STAY_BY_PLACE) {
    if (entry.match.test(place) || entry.match.test(opts.slug || "")) {
      return entry.cover;
    }
  }

  return hashPick(`${opts.slug || ""}:${place}`, STAY_ROTATION) || fallback;
}

const CAR_FALLBACKS = [
  "/img/cars/1.png",
  "/img/cars/2.png",
  "/img/cars/3.png",
  "/img/cars/4.png",
  "/img/cars/5.png",
  "/img/cars/6.png",
  "/img/cars/car-rental-banner.jpg",
];

const BIKE_FALLBACKS = [
  "/img/bikes/bike-rental-banner.jpg",
  "/uploads/vehicles/photos/royal-enfield-classic-350.jpg",
  "/uploads/vehicles/photos/honda-activa.jpg",
  "/uploads/vehicles/photos/tvs-ntorq-125.jpg",
];

export function resolveRideCover(opts: {
  url?: string | null;
  slug?: string | null;
  kind?: "car" | "bike" | string;
  fallback?: string;
}) {
  const kind = opts.kind === "bike" ? "bike" : "car";
  const pool = kind === "bike" ? BIKE_FALLBACKS : CAR_FALLBACKS;
  const fallback = opts.fallback || hashPick(opts.slug || kind, pool) || pool[0];
  const slug = (opts.slug || "").trim();
  const localSlug = RIDE_LOCAL_ALIASES[slug] || slug;
  const local = localSlug && RIDE_LOCAL_SLUGS.has(localSlug) ? `/uploads/vehicles/photos/${localSlug}.jpg` : "";

  if (local) return local;
  if (!isCatalogPlaceholder(opts.url)) return opts.url!.trim();
  return fallback;
}

export function stayImageList(opts: {
  images: string[];
  place?: string | null;
  slug?: string | null;
}) {
  const resolved = opts.images
    .map((url) => resolveStayCover({ url, place: opts.place, slug: opts.slug }))
    .filter(Boolean);
  return [...new Set(resolved)].slice(0, 4);
}
