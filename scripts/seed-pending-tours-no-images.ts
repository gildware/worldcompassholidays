/**
 * Seed all pending locked-format tours with full data and NO images.
 *
 *   npx tsx scripts/seed-pending-tours-no-images.ts
 */
import { loadEnvConfig } from "@next/env";
import { PrismaClient } from "@prisma/client";
import type { SampleCatalogRef, TourFormat } from "../src/lib/demo/sample-tour-classic-kashmir";
import {
  pendingToursCatalogSeed,
  pendingToursNoImages,
} from "../src/lib/demo/pending-tours";

loadEnvConfig(process.cwd());

const prisma = new PrismaClient();

type DestSeed = {
  slug: string;
  name: string;
  region: string;
  country: string;
  summary: string;
  mapLat: string;
  mapLng: string;
  mapZoom: number;
};

const EXTRA_DESTINATIONS: DestSeed[] = [
  { slug: "amritsar", name: "Amritsar", region: "Punjab", country: "India", summary: "Golden Temple city and Wagah border gateway.", mapLat: "31.6340", mapLng: "74.8723", mapZoom: 11 },
  { slug: "andaman", name: "Andaman", region: "Andaman & Nicobar", country: "India", summary: "Bay of Bengal island chain — Port Blair hub.", mapLat: "11.6234", mapLng: "92.7265", mapZoom: 8 },
  { slug: "havelock", name: "Havelock Island", region: "Andaman & Nicobar", country: "India", summary: "Beach and dive island also known as Swaraj Dweep.", mapLat: "12.0041", mapLng: "92.9500", mapZoom: 11 },
  { slug: "shirdi", name: "Shirdi", region: "Maharashtra", country: "India", summary: "Sai Baba pilgrimage town in Ahmednagar district.", mapLat: "19.7660", mapLng: "74.4770", mapZoom: 12 },
  { slug: "dwarka", name: "Dwarka", region: "Gujarat", country: "India", summary: "Krishna temple city on Gujarat’s western tip.", mapLat: "22.2394", mapLng: "68.9678", mapZoom: 11 },
  { slug: "somnath", name: "Somnath", region: "Gujarat", country: "India", summary: "Jyotirlinga temple town on the Saurashtra coast.", mapLat: "20.8880", mapLng: "70.4010", mapZoom: 12 },
  { slug: "gujarat", name: "Gujarat", region: "Gujarat", country: "India", summary: "Western state — temples, lions, and white desert.", mapLat: "22.2587", mapLng: "71.1924", mapZoom: 6 },
  { slug: "bodh-gaya", name: "Bodh Gaya", region: "Bihar", country: "India", summary: "Mahabodhi Temple and Buddhist pilgrimage centre.", mapLat: "24.6951", mapLng: "84.9913", mapZoom: 12 },
  { slug: "puri", name: "Puri", region: "Odisha", country: "India", summary: "Jagannath temple city on the Bay of Bengal.", mapLat: "19.8135", mapLng: "85.8312", mapZoom: 11 },
  { slug: "rameswaram", name: "Rameswaram", region: "Tamil Nadu", country: "India", summary: "Island temple town linked to the Ramayana.", mapLat: "9.2876", mapLng: "79.3129", mapZoom: 12 },
  { slug: "mathura", name: "Mathura", region: "Uttar Pradesh", country: "India", summary: "Krishna janmabhoomi city on the Yamuna.", mapLat: "27.4924", mapLng: "77.6737", mapZoom: 11 },
  { slug: "vrindavan", name: "Vrindavan", region: "Uttar Pradesh", country: "India", summary: "Temple town of Krishna leela sites near Mathura.", mapLat: "27.5650", mapLng: "77.6593", mapZoom: 12 },
  { slug: "ajmer", name: "Ajmer", region: "Rajasthan", country: "India", summary: "Ajmer Sharif dargah city in central Rajasthan.", mapLat: "26.4499", mapLng: "74.6399", mapZoom: 11 },
  { slug: "pushkar", name: "Pushkar", region: "Rajasthan", country: "India", summary: "Sacred lake town and camel fair venue.", mapLat: "26.4899", mapLng: "74.5511", mapZoom: 12 },
  { slug: "ujjain", name: "Ujjain", region: "Madhya Pradesh", country: "India", summary: "Mahakaleshwar Jyotirlinga city on the Shipra.", mapLat: "23.1765", mapLng: "75.7885", mapZoom: 11 },
  { slug: "uttar-pradesh", name: "Uttar Pradesh", region: "Uttar Pradesh", country: "India", summary: "North Indian plains — faith cities and Agra.", mapLat: "26.8467", mapLng: "80.9462", mapZoom: 6 },
  { slug: "madhya-pradesh", name: "Madhya Pradesh", region: "Madhya Pradesh", country: "India", summary: "Central India — tiger parks and temple towns.", mapLat: "22.9734", mapLng: "78.6569", mapZoom: 6 },
  { slug: "maharashtra", name: "Maharashtra", region: "Maharashtra", country: "India", summary: "Western state — Shirdi, beaches, and Western Ghats.", mapLat: "19.7515", mapLng: "75.7139", mapZoom: 6 },
  { slug: "west-bengal", name: "West Bengal", region: "West Bengal", country: "India", summary: "East India — Darjeeling hills and Sundarbans.", mapLat: "22.9868", mapLng: "87.8550", mapZoom: 6 },
  { slug: "assam", name: "Assam", region: "Assam", country: "India", summary: "Northeast gateway — Kaziranga and Brahmaputra.", mapLat: "26.2006", mapLng: "92.9376", mapZoom: 7 },
  { slug: "sikkim", name: "Sikkim", region: "Sikkim", country: "India", summary: "Himalayan state — Gangtok and Kanchenjunga views.", mapLat: "27.5330", mapLng: "88.5122", mapZoom: 8 },
  { slug: "darjeeling", name: "Darjeeling", region: "West Bengal", country: "India", summary: "Tea hills and Kanchenjunga viewpoints.", mapLat: "27.0360", mapLng: "88.2627", mapZoom: 11 },
  { slug: "gangtok", name: "Gangtok", region: "Sikkim", country: "India", summary: "Sikkim capital — Tsomgo Lake gateway.", mapLat: "27.3389", mapLng: "88.6065", mapZoom: 11 },
  { slug: "coorg", name: "Coorg", region: "Karnataka", country: "India", summary: "Coffee hills of Kodagu in Karnataka.", mapLat: "12.3375", mapLng: "75.8069", mapZoom: 10 },
  { slug: "mysore", name: "Mysore", region: "Karnataka", country: "India", summary: "Palace city of southern Karnataka.", mapLat: "12.2958", mapLng: "76.6394", mapZoom: 11 },
  { slug: "ooty", name: "Ooty", region: "Tamil Nadu", country: "India", summary: "Nilgiris hill station — botanical gardens and lake.", mapLat: "11.4102", mapLng: "76.6950", mapZoom: 11 },
  { slug: "coonoor", name: "Coonoor", region: "Tamil Nadu", country: "India", summary: "Quiet Nilgiris town below Ooty.", mapLat: "11.3500", mapLng: "76.8200", mapZoom: 12 },
  { slug: "kodaikanal", name: "Kodaikanal", region: "Tamil Nadu", country: "India", summary: "Palani Hills lake station in Tamil Nadu.", mapLat: "10.2381", mapLng: "77.4892", mapZoom: 11 },
  { slug: "thekkady", name: "Thekkady", region: "Kerala", country: "India", summary: "Periyar tiger reserve gateway in Kerala.", mapLat: "9.6030", mapLng: "77.1615", mapZoom: 11 },
  { slug: "nainital", name: "Nainital", region: "Uttarakhand", country: "India", summary: "Kumaon lake town near Corbett.", mapLat: "29.3803", mapLng: "79.4636", mapZoom: 12 },
  { slug: "bir-billing", name: "Bir Billing", region: "Himachal Pradesh", country: "India", summary: "Paragliding hub in Kangra valley.", mapLat: "32.0500", mapLng: "76.7000", mapZoom: 11 },
  { slug: "auli", name: "Auli", region: "Uttarakhand", country: "India", summary: "Ski slopes above Joshimath.", mapLat: "30.5270", mapLng: "79.5690", mapZoom: 12 },
  { slug: "bandhavgarh", name: "Bandhavgarh", region: "Madhya Pradesh", country: "India", summary: "High-density tiger reserve in MP.", mapLat: "23.7167", mapLng: "81.0333", mapZoom: 11 },
  { slug: "kaziranga", name: "Kaziranga", region: "Assam", country: "India", summary: "UNESCO one-horned rhino park.", mapLat: "26.5775", mapLng: "93.1711", mapZoom: 10 },
  { slug: "kanha", name: "Kanha", region: "Madhya Pradesh", country: "India", summary: "Jungle Book country tiger reserve.", mapLat: "22.3333", mapLng: "80.6333", mapZoom: 10 },
  { slug: "gir", name: "Gir", region: "Gujarat", country: "India", summary: "Last wild Asiatic lion habitat.", mapLat: "21.1240", mapLng: "70.8242", mapZoom: 10 },
  { slug: "sundarbans", name: "Sundarbans", region: "West Bengal", country: "India", summary: "Mangrove tiger reserve on the delta.", mapLat: "21.9497", mapLng: "89.1833", mapZoom: 9 },
  { slug: "rann-of-kutch", name: "Rann of Kutch", region: "Gujarat", country: "India", summary: "White salt desert and Rann Utsav camps.", mapLat: "23.7337", mapLng: "69.8597", mapZoom: 8 },
  { slug: "pawna", name: "Pawna Lake", region: "Maharashtra", country: "India", summary: "Weekend lakeside camping near Lonavala.", mapLat: "18.6667", mapLng: "73.4833", mapZoom: 12 },
  { slug: "wayanad", name: "Wayanad", region: "Kerala", country: "India", summary: "Green district of forests and plantations.", mapLat: "11.6854", mapLng: "76.1320", mapZoom: 10 },
  { slug: "pondicherry", name: "Pondicherry", region: "Puducherry", country: "India", summary: "French Quarter coastal town.", mapLat: "11.9416", mapLng: "79.8083", mapZoom: 12 },
  { slug: "neil", name: "Neil Island", region: "Andaman & Nicobar", country: "India", summary: "Quiet Andaman island also called Shaheed Dweep.", mapLat: "11.8340", mapLng: "93.0410", mapZoom: 12 },
];

async function ensureDestinations(slugs: string[]) {
  const fallback = "/uploads/destinations/seed-kashmir.svg";
  const existing = await prisma.destination.findMany({
    where: { slug: { in: slugs } },
    select: { slug: true },
  });
  const have = new Set(existing.map((d) => d.slug));
  const missing = slugs.filter((s) => !have.has(s));
  const bySlug = new Map(EXTRA_DESTINATIONS.map((d) => [d.slug, d]));

  for (const slug of missing) {
    const known = bySlug.get(slug);
    const name = known?.name ?? slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
    await prisma.destination.create({
      data: {
        slug,
        name,
        region: known?.region ?? "India",
        country: known?.country ?? "India",
        summary: known?.summary ?? `${name} travel destination.`,
        mapLat: known?.mapLat ?? "20.5937",
        mapLng: known?.mapLng ?? "78.9629",
        mapZoom: known?.mapZoom ?? 8,
        published: true,
        popular: false,
        imageUrl: fallback,
        imageKey: "destinations/seed-kashmir.svg",
        imageDriver: "local",
      },
    });
    console.log("destination created:", slug);
  }

  // Also upsert known extras that may already exist with thin data
  for (const dest of EXTRA_DESTINATIONS) {
    if (!slugs.includes(dest.slug)) continue;
    await prisma.destination.upsert({
      where: { slug: dest.slug },
      update: {
        name: dest.name,
        region: dest.region,
        country: dest.country,
        summary: dest.summary,
        mapLat: dest.mapLat,
        mapLng: dest.mapLng,
        mapZoom: dest.mapZoom,
        published: true,
      },
      create: {
        ...dest,
        published: true,
        popular: false,
        imageUrl: fallback,
        imageKey: "destinations/seed-kashmir.svg",
        imageDriver: "local",
      },
    });
  }
}

async function upsertCatalog(rows: SampleCatalogRef[]) {
  const idByKindTitle = new Map<string, string>();
  for (const [index, row] of rows.entries()) {
    const saved = await prisma.catalogItem.upsert({
      where: { kind_title: { kind: row.kind, title: row.title } },
      update: {
        content: row.content ?? "",
        sortOrder: index,
      },
      create: {
        kind: row.kind,
        title: row.title,
        content: row.content ?? "",
        sortOrder: index,
      },
      select: { id: true, kind: true, title: true },
    });
    idByKindTitle.set(`${saved.kind}::${saved.title}`, saved.id);
  }
  return idByKindTitle;
}

function idsFor(map: Map<string, string>, kind: string, titles: string[]) {
  return titles.map((title) => {
    const id = map.get(`${kind}::${title}`);
    if (!id) throw new Error(`Missing catalog ${kind}: ${title}`);
    return id;
  });
}

async function seedOne(tour: TourFormat, catalogMap: Map<string, string>) {
  const destinations = await prisma.destination.findMany({
    where: { slug: { in: tour.itinerary.destinationSlugs } },
    select: { id: true, slug: true },
  });
  const destinationBySlug = new Map(destinations.map((d) => [d.slug, d.id]));
  const primaryId = destinationBySlug.get(tour.itinerary.primaryDestinationSlug);
  if (!primaryId) {
    throw new Error(
      `Missing destination "${tour.itinerary.primaryDestinationSlug}" for ${tour.slug}`,
    );
  }
  const linkIds = tour.itinerary.destinationSlugs
    .map((s) => destinationBySlug.get(s))
    .filter((id): id is string => Boolean(id));

  const categoryId = catalogMap.get(`category::${tour.general.category}`);
  if (!categoryId) {
    throw new Error(`Missing category ${tour.general.category} for ${tour.slug}`);
  }

  const data = {
    title: tour.general.title,
    summary: tour.general.summary,
    description: tour.content.descriptionHtml,
    category: tour.general.category,
    categoryId,
    youtubeUrl: tour.general.youtubeUrl,
    minDayBeforeBooking: tour.general.minDayBeforeBooking,
    durationDays: tour.general.durationDays,
    durationUnit: tour.general.durationUnit,
    durationLabel: tour.general.durationLabel,
    difficulty: tour.general.difficulty,
    minPeople: tour.general.minPeople,
    maxGroupSize: tour.general.maxGroupSize,
    priceFrom: tour.pricing.priceFrom,
    currency: tour.pricing.currency,
    discountsJson: JSON.stringify(tour.pricing.discounts),
    destinationId: primaryId,
    destinationIdsJson: JSON.stringify(linkIds),
    address: tour.itinerary.address,
    mapLat: tour.itinerary.mapLat,
    mapLng: tour.itinerary.mapLng,
    mapZoom: tour.itinerary.mapZoom,
    isFeatured: tour.general.isFeatured,
    defaultState: tour.general.availability,
    availabilityFrom: null as Date | null,
    availabilityTo: null as Date | null,
    // Explicitly empty — no images
    imageUrl: "",
    imageKey: "",
    imageDriver: "local",
    featuredImageUrl: "",
    featuredImageKey: "",
    featuredImageDriver: "local",
    galleryJson: "[]",
    seoImageUrl: "",
    seoImageKey: "",
    seoImageDriver: "local",
    faqsJson: JSON.stringify([
      ...idsFor(catalogMap, "faq", tour.details.sharedFaqTitles),
      ...tour.details.extraFaqs.map((item) => ({
        local: true as const,
        title: item.title,
        content: item.content,
      })),
    ]),
    includesJson: JSON.stringify(idsFor(catalogMap, "include", tour.details.includeTitles)),
    excludesJson: JSON.stringify(idsFor(catalogMap, "exclude", tour.details.excludeTitles)),
    beforeYouGoJson: JSON.stringify(
      idsFor(catalogMap, "before_you_go", tour.details.beforeYouGoTitles),
    ),
    travelStylesJson: JSON.stringify(
      idsFor(catalogMap, "style", tour.details.travelStyleTitles),
    ),
    facilitiesJson: JSON.stringify(
      idsFor(catalogMap, "facility", tour.details.facilityTitles),
    ),
    seoIndex: tour.seo.seoIndex,
    seoTitle: tour.seo.seoTitle,
    seoDescription: tour.seo.seoDescription,
    facebookTitle: tour.seo.facebookTitle,
    facebookDescription: tour.seo.facebookDescription,
    twitterTitle: tour.seo.twitterTitle,
    twitterDescription: tour.seo.twitterDescription,
    published: tour.seo.published,
  };

  const existing = await prisma.tour.findUnique({
    where: { slug: tour.slug },
    select: { id: true },
  });
  // Never overwrite tours that were seeded earlier (protects image-complete tours).
  if (existing) {
    return `skip:${tour.slug}`;
  }

  const saved = await prisma.tour.create({
    data: { slug: tour.slug, ...data },
    select: { id: true, slug: true },
  });

  await prisma.itineraryDay.createMany({
    data: tour.itinerary.days.map((day) => {
      const morning = day.morning?.trim() ?? "";
      const afternoon = day.afternoon?.trim() ?? "";
      const evening = day.evening?.trim() ?? "";
      const description =
        [
          morning && `Morning: ${morning}`,
          afternoon && `Afternoon: ${afternoon}`,
          evening && `Evening: ${evening}`,
        ]
          .filter(Boolean)
          .join("\n\n") ||
        day.description?.trim() ||
        "";
      return {
        tourId: saved.id,
        dayNumber: day.dayNumber,
        title: day.title,
        description,
        morning,
        afternoon,
        evening,
        imageUrl: "",
        imageKey: "",
        imageDriver: "local",
      };
    }),
  });
  await prisma.tourDestination.createMany({
    data: linkIds.map((destinationId) => ({ tourId: saved.id, destinationId })),
  });
  return saved.slug;
}

async function main() {
  const tours = pendingToursNoImages;
  console.log(`Seeding ${tours.length} tours with no images…`);

  const allDestSlugs = [
    ...new Set(
      tours.flatMap((t) => [
        ...t.itinerary.destinationSlugs,
        t.itinerary.primaryDestinationSlug,
      ]),
    ),
  ];
  await ensureDestinations(allDestSlugs);

  // Ensure every catalog title referenced by any tour exists.
  const categoryTitles = [...new Set(tours.map((t) => t.general.category))];
  const harvested: SampleCatalogRef[] = [
    ...pendingToursCatalogSeed,
    ...categoryTitles.map((title) => ({ kind: "category" as const, title })),
  ];
  const harvestKey = new Set(harvested.map((r) => `${r.kind}::${r.title}`));
  const pushHarvest = (kind: SampleCatalogRef["kind"], title: string, content = "") => {
    const key = `${kind}::${title}`;
    if (harvestKey.has(key)) return;
    harvestKey.add(key);
    harvested.push({ kind, title, content });
  };
  for (const tour of tours) {
    pushHarvest("category", tour.general.category);
    for (const title of tour.details.sharedFaqTitles) {
      pushHarvest(
        "faq",
        title,
        "Details confirmed on your booking voucher for this departure.",
      );
    }
    for (const title of tour.details.includeTitles) pushHarvest("include", title);
    for (const title of tour.details.excludeTitles) pushHarvest("exclude", title);
    for (const title of tour.details.beforeYouGoTitles) {
      pushHarvest(
        "before_you_go",
        title,
        "Follow the notes on your voucher; ask us if anything is unclear before you travel.",
      );
    }
    for (const title of tour.details.travelStyleTitles) pushHarvest("style", title);
    for (const title of tour.details.facilityTitles) pushHarvest("facility", title);
  }
  const catalogMap = await upsertCatalog(harvested);

  let ok = 0;
  let skipped = 0;
  const failed: { slug: string; error: string }[] = [];
  for (const tour of tours) {
    try {
      const result = await seedOne(tour, catalogMap);
      if (result.startsWith("skip:")) {
        skipped += 1;
        console.log(`· ${result}`);
      } else {
        ok += 1;
        console.log(`✓ ${result}`);
      }
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e);
      failed.push({ slug: tour.slug, error: message });
      console.error(`✗ ${tour.slug}: ${message}`);
    }
  }

  const total = await prisma.tour.count();
  console.log(
    `\nDone. created=${ok} skipped=${skipped} failed=${failed.length}. DB tours now=${total}`,
  );
  if (failed.length) {
    console.error("Failures:", failed);
    process.exitCode = 1;
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
