/** Seed / broken covers that should never show on product cards. */
const PLACEHOLDER_MARKERS = [
  "seed-kashmir.svg",
  "seed-kashmir-trek.svg",
  "/uploads/destinations/seed-",
];

/** Packaged /img assets only — /uploads is gitignored and missing from the live Docker image. */
const STAY_BY_PLACE: Array<{ match: RegExp; cover: string }> = [
  { match: /gulmarg|tangmarg|kunzer/i, cover: "/img/company/service-hotels.jpg" },
  { match: /pahalgam|aru|betaab|chandanwari/i, cover: "/img/company/service-hotels.jpg" },
  { match: /sonamarg/i, cover: "/img/company/service-hotels.jpg" },
  { match: /srinagar|dal|nishat|shankaracharya/i, cover: "/img/company/service-hotels.jpg" },
  { match: /leh|ladakh/i, cover: "/img/company/service-hotels.jpg" },
  { match: /nubra/i, cover: "/img/company/service-hotels.jpg" },
  { match: /shimla/i, cover: "/img/company/service-hotels.jpg" },
  { match: /manali/i, cover: "/img/company/service-hotels.jpg" },
  { match: /jammu/i, cover: "/img/company/service-hotels.jpg" },
  { match: /katra|vaishno/i, cover: "/img/company/service-hotels.jpg" },
];

const STAY_ROTATION = [
  "/img/company/service-hotels.jpg",
  "/img/company/service-packages.jpg",
  "/img/company/service-transfers.jpg",
  "/img/company/about-fleet.jpg",
];

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
  const url = opts.url?.trim() || "";
  if (url && !isCatalogPlaceholder(url) && !url.startsWith("/uploads/")) {
    return url;
  }

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
  "/img/cars/1.png",
  "/img/cars/2.png",
  "/img/cars/3.png",
];

/** Trim letterbox borders and fit fleet photos so the whole vehicle shows in cards. */
export function fleetPhotoUrl(url?: string | null) {
  const value = url?.trim() || "";
  if (!value.startsWith("https://res.cloudinary.com/") || !value.includes("/image/upload/")) {
    return value;
  }
  if (/\/upload\/(?:[^/]*e_trim|e_trim)/.test(value)) return value;
  return value.replace(
    "/image/upload/",
    "/image/upload/e_trim:50,c_fit,w_1200,h_750,b_auto/",
  );
}

export function resolveRideCover(opts: {
  url?: string | null;
  slug?: string | null;
  kind?: "car" | "bike" | string;
  fallback?: string;
}) {
  const kind = opts.kind === "bike" ? "bike" : "car";
  const pool = kind === "bike" ? BIKE_FALLBACKS : CAR_FALLBACKS;
  const fallback = opts.fallback || hashPick(opts.slug || kind, pool) || pool[0];
  const url = opts.url?.trim() || "";

  // Prefer stored Cloudinary/CDN URLs. Never invent /uploads paths — those files are
  // gitignored and missing from the production container, so they 404 on live.
  if (url && !isCatalogPlaceholder(url) && !url.startsWith("/uploads/")) {
    return fleetPhotoUrl(url);
  }

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
