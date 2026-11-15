/**
 * Delete all tours and load the production Kashmir tour set with full itineraries.
 *
 *   npx tsx scripts/seed-kashmir-tours.ts
 *   npx tsx scripts/seed-kashmir-tours.ts --allow-remote
 *   npx tsx scripts/seed-kashmir-tours.ts --allow-remote --upsert-imaged
 *     → no wipe; upsert only tours that have cover+g1–g4 on disk; unpublish the rest
 */
import { existsSync } from "node:fs";
import path from "node:path";
import { loadEnvConfig } from "@next/env";
import { PrismaClient } from "@prisma/client";
import { indiaPhase1Tours } from "../src/lib/demo/india-phase1-tours";
import { indiaPhase2Tours } from "../src/lib/demo/india-phase2-tours";
import { indiaPhase3Tours } from "../src/lib/demo/india-phase3-tours";
import { kashmirTours, type KashmirTour } from "../src/lib/demo/kashmir-tours";

loadEnvConfig(process.cwd());

const allTours: KashmirTour[] = [
  ...kashmirTours,
  ...indiaPhase1Tours,
  ...indiaPhase2Tours,
  ...indiaPhase3Tours,
];

const prisma = new PrismaClient();
const uploads = path.join(process.cwd(), "public", "uploads");
const fallbackImage = "/uploads/destinations/kashmir.jpg";
const fallbackKey = "destinations/kashmir.jpg";

function assertDatabaseTarget() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is not configured; refusing to seed.");
  }

  let hostname: string;
  try {
    hostname = new URL(connectionString).hostname;
  } catch {
    throw new Error("DATABASE_URL is not a valid URL; refusing to seed.");
  }

  const isLocal = ["localhost", "127.0.0.1", "::1"].includes(hostname);
  if (!isLocal && !process.argv.includes("--allow-remote")) {
    throw new Error(
      `DATABASE_URL points to remote host "${hostname}". Re-run with --allow-remote only if this target is intended.`,
    );
  }

  console.log(`Seeding tours on ${hostname || "unknown-host"}…`);
}

function localAsset(rel: string) {
  const file = path.join(uploads, rel);
  if (!existsSync(file)) return null;
  return { url: `/uploads/${rel}`, key: rel, driver: "local" as const };
}

type LocalImage = NonNullable<ReturnType<typeof localAsset>>;

function destinationPhotos(slug: string) {
  const variants = ["", "-2", "-3", "-4", "-5"];
  return variants
    .map((suffix) => localAsset(`destinations/${slug}${suffix}.jpg`))
    .filter((item): item is LocalImage => Boolean(item));
}

/** One distinctive cover per tour so listing cards do not all show Srinagar. */
const TOUR_COVER_KEYS: Record<string, string[]> = {
  "classic-kashmir-triangle": [
    "tours/dal-lake-mughal-gardens-cover.jpg",
    "destinations/betaab-valley.jpg",
    "destinations/gulmarg.jpg",
  ],
  "best-of-kashmir-sonamarg": [
    "destinations/sonamarg.jpg",
    "destinations/sonamarg-2.jpg",
    "tours/srinagar-leh-road-trip-cover.jpg",
  ],
  "budget-express-kashmir": [
    "destinations/srinagar-3.jpg",
    "destinations/gulmarg-2.jpg",
    "destinations/pahalgam-2.jpg",
  ],
  "valley-day-trip-circuit": [
    "destinations/pampore.jpg",
    "destinations/sonamarg-3.jpg",
    "destinations/gulmarg-3.jpg",
  ],
  "romantic-kashmir-honeymoon": [
    "tours/honeymoon-tours-cover.jpg",
    "destinations/srinagar-4.jpg",
    "destinations/pahalgam-3.jpg",
  ],
  "luxury-houseboat-escape": [
    "destinations/srinagar-5.jpg",
    "tours/dal-lake-mughal-gardens-g1.jpg",
    "destinations/manasbal.jpg",
  ],
  "family-album-kashmir": [
    "tours/gulmarg-pahalgam-family-cover.jpg",
    "destinations/pahalgam.jpg",
    "destinations/gulmarg-4.jpg",
  ],
  "family-grand-circuit": [
    "tours/gulmarg-pahalgam-family-g1.jpg",
    "destinations/yusmarg.jpg",
    "destinations/sonamarg-4.jpg",
  ],
  "premium-relaxed-kashmir": [
    "destinations/gulmarg-5.jpg",
    "tours/gulmarg-gondola-meadows-cover.jpg",
    "destinations/pahalgam-4.jpg",
  ],
  "winter-white-gulmarg": [
    "tours/gulmarg-gondola-meadows-g1.jpg",
    "destinations/gulmarg.jpg",
    "destinations/tangmarg.jpg",
  ],
  "kashmir-snow-tour": [
    "destinations/gulmarg-2.jpg",
    "destinations/sonamarg-5.jpg",
    "destinations/tangmarg-2.jpg",
  ],
  "winter-sports-week": [
    "tours/gulmarg-gondola-meadows-g2.jpg",
    "destinations/gulmarg-3.jpg",
    "destinations/tangmarg-3.jpg",
  ],
  "winter-adventure-mini": [
    "destinations/doodhpathri.jpg",
    "destinations/gulmarg-4.jpg",
    "destinations/pahalgam-5.jpg",
  ],
  "winter-honeymoon-circuit": [
    "tours/honeymoon-tours-cover.jpg",
    "destinations/gulmarg-5.jpg",
    "destinations/srinagar-2.jpg",
  ],
  "offbeat-meadows-doodhpathri-yusmarg": [
    "destinations/doodhpathri-2.jpg",
    "destinations/yusmarg-2.jpg",
    "destinations/manasbal-2.jpg",
  ],
  "south-kashmir-springs": [
    "destinations/aharbal.jpg",
    "destinations/kokernag.jpg",
    "destinations/verinag.jpg",
  ],
  "gurez-valley-discovery": [
    "destinations/gurez.jpg",
    "destinations/gurez-2.jpg",
    "destinations/wular-lake.jpg",
  ],
  "offbeat-north-gurez-lolab": [
    "destinations/lolab.jpg",
    "destinations/gurez-3.jpg",
    "destinations/wular-lake-2.jpg",
  ],
  "hidden-valleys-gurez-bangus": [
    "destinations/bangus.jpg",
    "destinations/gurez-4.jpg",
    "destinations/doodhpathri-3.jpg",
  ],
  "deep-gurez-immersion": [
    "destinations/gurez-5.jpg",
    "destinations/bangus-2.jpg",
    "destinations/naranag.jpg",
  ],
  "grand-kashmir-circuit": [
    "destinations/kashmir.jpg",
    "destinations/gurez-2.jpg",
    "destinations/betaab-valley-2.jpg",
  ],
  "amarnath-yatra-group": [
    "tours/amarnath-yatra-cover.jpg",
    "tours/amarnath-yatra-group-g1.jpg",
    "tours/amarnath-yatra-group-g2.jpg",
    "tours/amarnath-yatra-group-g3.jpg",
    "tours/amarnath-yatra-group-g4.jpg",
  ],
  "kashmir-vaishno-devi": [
    "tours/vaishno-devi-yatra-cover.jpg",
    "destinations/kashmir-2.jpg",
    "tours/vaishno-devi-yatra-g1.jpg",
  ],
  "classic-doodhpathri-yusmarg-addon": [
    "destinations/yusmarg-3.jpg",
    "destinations/doodhpathri-4.jpg",
    "destinations/aru-valley.jpg",
  ],
  "kedarnath-yatra-package": [
    "tours/kedarnath-yatra-package-cover.jpg",
    "destinations/kedarnath.jpg",
    "tours/kedarnath-yatra-package-g1.jpg",
  ],
  "do-dham-yatra-kedarnath-badrinath": [
    "tours/do-dham-yatra-kedarnath-badrinath-cover.jpg",
    "destinations/badrinath.jpg",
    "destinations/kedarnath.jpg",
  ],
  "char-dham-yatra-from-haridwar": [
    "tours/char-dham-yatra-from-haridwar-cover.jpg",
    "destinations/yamunotri.jpg",
    "destinations/gangotri.jpg",
  ],
  "char-dham-yatra-by-helicopter": [
    "tours/char-dham-yatra-by-helicopter-cover.jpg",
    "destinations/kedarnath.jpg",
    "destinations/dehradun.jpg",
  ],
  "kashmir-great-lakes-trek": [
    "tours/kashmir-great-lakes-trek-cover.jpg",
    "tours/kashmir-great-lakes-trek-g1.jpg",
    "destinations/sonamarg.jpg",
  ],
  "tarsar-marsar-trek": [
    "tours/tarsar-marsar-trek-cover.jpg",
    "tours/tarsar-marsar-trek-g1.jpg",
    "destinations/aru-valley.jpg",
  ],
  "hampta-pass-chandratal-trek": [
    "tours/hampta-pass-chandratal-trek-cover.jpg",
    "tours/hampta-pass-chandratal-trek-g1.jpg",
    "destinations/manali.jpg",
  ],
  "chopta-chandrashila-deoriatal-trek": [
    "tours/chopta-chandrashila-deoriatal-trek-cover.jpg",
    "tours/chopta-chandrashila-deoriatal-trek-g1.jpg",
    "destinations/chopta.jpg",
  ],
  "valley-of-flowers-hemkund-trek": [
    "tours/valley-of-flowers-hemkund-trek-cover.jpg",
    "tours/valley-of-flowers-hemkund-trek-g1.jpg",
    "destinations/uttarakhand.jpg",
  ],
};

/** Gallery place order — one shot per place so cards/detail feel varied. */
const TOUR_GALLERY_PLACES: Record<string, string[]> = {
  "classic-kashmir-triangle": ["gulmarg", "pahalgam", "betaab-valley", "aru-valley"],
  "best-of-kashmir-sonamarg": ["gulmarg", "pahalgam", "srinagar", "betaab-valley"],
  "budget-express-kashmir": ["gulmarg", "pahalgam", "srinagar", "pampore"],
  "valley-day-trip-circuit": ["sonamarg", "gulmarg", "pahalgam", "srinagar"],
  "romantic-kashmir-honeymoon": ["gulmarg", "pahalgam", "betaab-valley", "sonamarg"],
  "luxury-houseboat-escape": ["srinagar", "manasbal", "gulmarg", "kashmir"],
  "family-album-kashmir": ["gulmarg", "pahalgam", "betaab-valley", "srinagar"],
  "family-grand-circuit": ["gulmarg", "pahalgam", "sonamarg", "yusmarg"],
  "premium-relaxed-kashmir": ["gulmarg", "pahalgam", "srinagar", "betaab-valley"],
  "winter-white-gulmarg": ["gulmarg", "tangmarg", "srinagar", "gulmarg"],
  "kashmir-snow-tour": ["gulmarg", "sonamarg", "pahalgam", "srinagar"],
  "winter-sports-week": ["gulmarg", "pahalgam", "tangmarg", "srinagar"],
  "winter-adventure-mini": ["gulmarg", "doodhpathri", "pahalgam", "srinagar"],
  "winter-honeymoon-circuit": ["gulmarg", "pahalgam", "srinagar", "sonamarg"],
  "offbeat-meadows-doodhpathri-yusmarg": ["doodhpathri", "yusmarg", "manasbal", "sonamarg"],
  "south-kashmir-springs": ["aharbal", "kokernag", "daksum", "verinag"],
  "gurez-valley-discovery": ["gurez", "wular-lake", "srinagar", "naranag"],
  "offbeat-north-gurez-lolab": ["gurez", "lolab", "wular-lake", "doodhpathri"],
  "hidden-valleys-gurez-bangus": ["bangus", "gurez", "doodhpathri", "lolab"],
  "deep-gurez-immersion": ["gurez", "bangus", "sonamarg", "naranag"],
  "grand-kashmir-circuit": ["gulmarg", "pahalgam", "sonamarg", "gurez"],
  // Dedicated Amarnath route photos only — never fill from Srinagar/Pahalgam leisure stock.
  "amarnath-yatra-group": [],
  "kashmir-vaishno-devi": ["srinagar", "gulmarg", "pahalgam", "sonamarg"],
  "classic-doodhpathri-yusmarg-addon": ["doodhpathri", "yusmarg", "gulmarg", "pahalgam"],
  "kedarnath-yatra-package": ["kedarnath", "guptkashi", "haridwar", "rishikesh"],
  "do-dham-yatra-kedarnath-badrinath": ["kedarnath", "badrinath", "haridwar", "guptkashi"],
  "char-dham-yatra-from-haridwar": ["haridwar", "kedarnath", "badrinath", "yamunotri"],
  "char-dham-yatra-by-helicopter": ["dehradun", "kedarnath", "badrinath", "gangotri"],
  "kashmir-great-lakes-trek": ["sonamarg", "naranag", "gurez", "kashmir"],
  "tarsar-marsar-trek": ["aru-valley", "pahalgam", "betaab-valley", "sonamarg"],
  "hampta-pass-chandratal-trek": ["manali", "himachal", "himachal", "manali"],
  "chopta-chandrashila-deoriatal-trek": ["chopta", "uttarakhand", "rishikesh", "haridwar"],
  "valley-of-flowers-hemkund-trek": ["uttarakhand", "haridwar", "rishikesh", "chopta"],
};

function firstExisting(keys: string[]): LocalImage | null {
  for (const key of keys) {
    const asset = localAsset(key);
    if (asset) return asset;
  }
  return null;
}

function pickPlaceHero(slug: string, preferVariant: number): LocalImage | null {
  const photos = destinationPhotos(slug);
  if (photos.length === 0) return null;
  return photos[Math.min(preferVariant, photos.length - 1)] ?? photos[0];
}

function resolveTourMedia(tour: KashmirTour, coverUsage: Map<string, number>) {
  const dedicatedCover =
    localAsset(`tours/${tour.slug}-cover.jpg`) ?? localAsset(`tours/${tour.slug}.jpg`);
  const dedicatedGallery = ["g1", "g2", "g3", "g4"]
    .map((suffix) => localAsset(`tours/${tour.slug}-${suffix}.jpg`))
    .filter((item): item is LocalImage => Boolean(item));

  const preferredCovers = TOUR_COVER_KEYS[tour.slug] ?? [];
  let cover =
    dedicatedCover ??
    firstExisting(preferredCovers) ??
    pickPlaceHero(
      (tour.imageSlugs ?? tour.destinationSlugs).find((slug) => slug !== "kashmir" && slug !== "srinagar") ??
        tour.destinationSlug,
      0,
    ) ??
    localAsset("destinations/kashmir.jpg") ?? {
      url: fallbackImage,
      key: fallbackKey,
      driver: "local" as const,
    };

  // If this cover is already used by another tour, try the next preferred key.
  const used = coverUsage.get(cover.key) ?? 0;
  if (used > 0) {
    for (const key of preferredCovers) {
      const candidate = localAsset(key);
      if (candidate && (coverUsage.get(candidate.key) ?? 0) === 0) {
        cover = candidate;
        break;
      }
    }
  }
  coverUsage.set(cover.key, (coverUsage.get(cover.key) ?? 0) + 1);

  const placeOrder =
    TOUR_GALLERY_PLACES[tour.slug] ??
    (tour.imageSlugs?.length
      ? tour.imageSlugs
      : tour.destinationSlugs.filter((slug) => slug !== "kashmir"));

  const gallery: LocalImage[] = [...dedicatedGallery];
  let variant = 1;
  for (const place of placeOrder) {
    if (gallery.length >= 4) break;
    const shot = pickPlaceHero(place, variant);
    variant += 1;
    if (!shot) continue;
    if (shot.key === cover.key) continue;
    if (gallery.some((item) => item.key === shot.key)) continue;
    gallery.push(shot);
  }

  // Fill remaining slots from other destination variants if needed.
  if (gallery.length < 4) {
    for (const place of placeOrder) {
      for (const shot of destinationPhotos(place)) {
        if (gallery.length >= 4) break;
        if (shot.key === cover.key) continue;
        if (gallery.some((item) => item.key === shot.key)) continue;
        gallery.push(shot);
      }
    }
  }

  return {
    cover,
    galleryItems: gallery.slice(0, 4).map((item) => ({
      url: item.url,
      key: item.key,
      driver: item.driver,
    })),
  };
}

function upcomingDepartures(tour: KashmirTour, count: number) {
  const nights = Math.max(1, tour.durationNights || tour.durationDays - 1);
  const seats = Math.min(tour.maxGroupSize, tour.category === "Honeymoon" ? 4 : 10);
  const start = new Date();
  start.setUTCHours(0, 0, 0, 0);
  // First departure ~10 days out, then weekly.
  start.setUTCDate(start.getUTCDate() + 10);

  return Array.from({ length: count }, (_, index) => {
    const begin = new Date(start);
    begin.setUTCDate(start.getUTCDate() + index * 7);
    const end = new Date(begin);
    end.setUTCDate(begin.getUTCDate() + nights);
    const seasonalBump = tour.category === "Winter" || tour.category === "Honeymoon" ? 1500 : 0;
    return {
      startDate: begin,
      endDate: end,
      seatsTotal: seats,
      price: tour.priceFrom + seasonalBump + index * 500,
      status: "open",
    };
  });
}

function hasDedicatedImages(slug: string) {
  const cover = localAsset(`tours/${slug}-cover.jpg`);
  if (!cover) return false;
  return ["g1", "g2", "g3", "g4"].every((suffix) =>
    Boolean(localAsset(`tours/${slug}-${suffix}.jpg`)),
  );
}

async function main() {
  assertDatabaseTarget();

  if (allTours.length === 0) {
    throw new Error("Tour catalog is empty.");
  }

  const upsertImaged = process.argv.includes("--upsert-imaged");
  const toursToSeed = upsertImaged
    ? allTours.filter((tour) => hasDedicatedImages(tour.slug))
    : allTours;

  if (upsertImaged && toursToSeed.length === 0) {
    throw new Error("No catalog tours have dedicated cover+gallery images on disk.");
  }

  const neededSlugs = [
    ...new Set(toursToSeed.flatMap((tour) => [tour.destinationSlug, ...tour.destinationSlugs])),
  ];
  const destinations = await prisma.destination.findMany({
    where: { slug: { in: neededSlugs } },
    select: { id: true, slug: true },
  });
  const destinationBySlug = new Map(destinations.map((row) => [row.slug, row.id]));

  for (const tour of toursToSeed) {
    if (!destinationBySlug.has(tour.destinationSlug)) {
      throw new Error(`Missing destination for tour ${tour.slug}: ${tour.destinationSlug}`);
    }
  }

  if (!upsertImaged) {
    const deletedDays = await prisma.itineraryDay.deleteMany({});
    const deletedDepartures = await prisma.tourDeparture.deleteMany({});
    const deletedLinks = await prisma.tourDestination.deleteMany({});
    const deletedTours = await prisma.tour.deleteMany({});
    console.log(
      `Deleted ${deletedTours.count} tours, ${deletedDays.count} itinerary days, ${deletedDepartures.count} departures, ${deletedLinks.count} destination links.`,
    );
  } else {
    console.log(
      `Upsert-imaged mode: seeding ${toursToSeed.length}/${allTours.length} catalog tours with disk photos (no wipe).`,
    );
  }

  let withPhotos = 0;
  let withDepartures = 0;
  const coverUsage = new Map<string, number>();
  const seededSlugs: string[] = [];

  for (const tour of toursToSeed) {
    const { cover, galleryItems } = resolveTourMedia(tour, coverUsage);
    if (!cover.key.includes("seed-kashmir")) withPhotos += 1;

    const primaryDestinationId = destinationBySlug.get(tour.destinationSlug)!;
    const linkIds = [
      ...new Set(
        tour.destinationSlugs
          .map((slug) => destinationBySlug.get(slug))
          .filter((id): id is string => Boolean(id)),
      ),
    ];

    const stayLine =
      tour.stays && tour.stays.length > 0
        ? `<p><strong>Stays in this quote:</strong> ${tour.stays.join("; ")}.</p>`
        : "";
    const description = tour.description.includes("Stays in this quote")
      ? tour.description
      : `${tour.description}${stayLine}`;

    const faqs = [...tour.faqs];
    if (tour.stays?.length) {
      faqs.push({
        title: "Which hotels are included?",
        content: `${tour.stays.join(". ")}. Same-category substitutes are confirmed in writing if a date is sold out.`,
      });
    }

    const faqsJson = JSON.stringify(
      faqs.map((item) => ({
        local: true,
        title: item.title,
        content: item.content,
      })),
    );

    const departureCount = tour.openDepartures ?? (tour.isFeatured ? 3 : 0);
    const departures = departureCount > 0 ? upcomingDepartures(tour, departureCount) : [];
    if (departures.length) withDepartures += 1;

    const defaultSeo =
      tour.category === "Religious"
        ? `${tour.title} | Pilgrimage tour package India`
        : tour.category === "Trekking"
          ? `${tour.title} | Himalayan trek package`
          : `${tour.title} | Kashmir tour packages`;

    const tourData = {
      title: tour.title,
      summary: tour.summary,
      description,
      category: tour.category,
      durationDays: tour.durationDays,
      durationUnit: "days",
      durationLabel: tour.durationLabel,
      difficulty: tour.difficulty,
      maxGroupSize: tour.maxGroupSize,
      minPeople: tour.category === "Honeymoon" ? 2 : 1,
      priceFrom: tour.priceFrom,
      currency: "INR",
      published: true,
      isFeatured: Boolean(tour.isFeatured),
      destinationId: primaryDestinationId,
      destinationIdsJson: JSON.stringify(linkIds),
      mapLat: tour.mapLat,
      mapLng: tour.mapLng,
      mapZoom: 9,
      imageUrl: cover.url,
      imageKey: cover.key,
      imageDriver: cover.driver,
      featuredImageUrl: cover.url,
      featuredImageKey: cover.key,
      featuredImageDriver: cover.driver,
      galleryJson: JSON.stringify(galleryItems),
      includesJson: JSON.stringify(tour.includes),
      excludesJson: JSON.stringify(tour.excludes),
      faqsJson,
      seoIndex: true,
      seoTitle: tour.seoTitle || defaultSeo,
      seoDescription: tour.seoDescription || tour.summary,
    };

    const existing = upsertImaged
      ? await prisma.tour.findUnique({ where: { slug: tour.slug }, select: { id: true } })
      : null;

    let saved: {
      slug: string;
      _count: { days: number; destinationLinks: number; departures: number };
    };

    if (existing) {
      await prisma.itineraryDay.deleteMany({ where: { tourId: existing.id } });
      await prisma.tourDeparture.deleteMany({ where: { tourId: existing.id } });
      await prisma.tourDestination.deleteMany({ where: { tourId: existing.id } });
      saved = await prisma.tour.update({
        where: { id: existing.id },
        data: {
          ...tourData,
          days: {
            create: tour.days.map((day) => {
              const dayPhoto =
                localAsset(`tours/${tour.slug}-d${day.dayNumber}.jpg`) ??
                localAsset(`tours/${tour.slug}-day${day.dayNumber}.jpg`);
              return {
                dayNumber: day.dayNumber,
                title: day.title,
                description: day.description,
                imageUrl: dayPhoto?.url ?? "",
                imageKey: dayPhoto?.key ?? "",
                imageDriver: dayPhoto?.driver ?? "local",
              };
            }),
          },
          destinationLinks: {
            create: linkIds.map((destinationId) => ({ destinationId })),
          },
          departures: departures.length ? { create: departures } : undefined,
        },
        select: {
          slug: true,
          _count: { select: { days: true, destinationLinks: true, departures: true } },
        },
      });
    } else {
      saved = await prisma.tour.create({
        data: {
          slug: tour.slug,
          ...tourData,
          days: {
            create: tour.days.map((day) => {
              const dayPhoto =
                localAsset(`tours/${tour.slug}-d${day.dayNumber}.jpg`) ??
                localAsset(`tours/${tour.slug}-day${day.dayNumber}.jpg`);
              return {
                dayNumber: day.dayNumber,
                title: day.title,
                description: day.description,
                imageUrl: dayPhoto?.url ?? "",
                imageKey: dayPhoto?.key ?? "",
                imageDriver: dayPhoto?.driver ?? "local",
              };
            }),
          },
          destinationLinks: {
            create: linkIds.map((destinationId) => ({ destinationId })),
          },
          departures: departures.length
            ? {
                create: departures,
              }
            : undefined,
        },
        select: {
          slug: true,
          _count: { select: { days: true, destinationLinks: true, departures: true } },
        },
      });
    }

    seededSlugs.push(saved.slug);
    console.log(
      `  + ${saved.slug} (${saved._count.days} days, ${saved._count.departures} departures, ${galleryItems.length + 1} photos)`,
    );
  }

  if (upsertImaged) {
    // Unpublish any DB tour that lacks dedicated cover+4 gallery on disk
    const allDb = await prisma.tour.findMany({ select: { id: true, slug: true, published: true } });
    let unpublished = 0;
    for (const row of allDb) {
      if (hasDedicatedImages(row.slug)) continue;
      if (!row.published) continue;
      await prisma.tour.update({
        where: { id: row.id },
        data: { published: false, isFeatured: false },
      });
      unpublished += 1;
    }
    const published = await prisma.tour.count({ where: { published: true } });
    console.log(
      `Upserted ${seededSlugs.length} imaged catalog tours. Unpublished ${unpublished} without images. Live published=${published}.`,
    );
    return;
  }

  const total = await prisma.tour.count();
  const days = await prisma.itineraryDay.count();
  const deps = await prisma.tourDeparture.count();
  if (total !== allTours.length) {
    throw new Error(`Expected ${allTours.length} tours; found ${total}.`);
  }

  console.log(
    `Verified ${total} tours / ${days} itinerary days / ${deps} departures. Photos on ${withPhotos}, dated inventory on ${withDepartures}.`,
  );
}

main()
  .catch((error: unknown) => {
    console.error(error instanceof Error ? error.message : "Tour seed failed.");
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
