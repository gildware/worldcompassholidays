"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { keepCatalogIds, keepFaqEntries } from "@/lib/catalog-query";
import { firstIssue, type FormState } from "@/lib/forms";
import { requirePermission } from "@/lib/auth/guards";
import { deleteImage } from "@/lib/storage";
import { readUploadedImage, validateUploadedImage } from "@/lib/storage/form";
import { uniqueSlug } from "@/lib/slug";
import { sanitizeTourHtml } from "@/lib/tours/html";
import {
  formatTourDuration,
  parseDurationUnit,
  parseJsonArray,
  type GalleryItem,
  type ItineraryItem,
  type PriceDiscount,
} from "@/lib/tours/json";

const difficultyEnum = z.enum(["easy", "moderate", "challenging"]);
const durationUnitEnum = z.enum(["hours", "days", "weeks"]);

const discountSchema = z.object({
  kind: z.enum(["single", "group"]),
  minPeople: z.number().int().min(1).max(40),
  mode: z.enum(["percent", "amount"]),
  value: z.number().min(0).max(1_000_000),
});

const draftTourSchema = z.object({
  title: z.string().trim().min(2, "Enter a title").max(160),
  summary: z.string().trim().max(400).default(""),
  description: z.string().trim().max(100000).default(""),
  category: z.string().trim().max(80).default(""),
  youtubeUrl: z.string().trim().max(300).default(""),
  minDayBeforeBooking: z.coerce.number().int().min(0).optional().nullable(),
  durationDays: z.coerce.number().int().min(1).max(240).default(5),
  durationUnit: durationUnitEnum.default("days"),
  durationLabel: z.string().trim().max(40).default(""),
  difficulty: difficultyEnum.default("moderate"),
  minPeople: z.coerce.number().int().min(1).max(40).default(1),
  maxGroupSize: z.coerce.number().int().min(1).max(40).default(12),
  priceFrom: z.coerce.number().int().min(0).default(0),
  currency: z.string().trim().min(3).max(3).default("INR"),
  destinationId: z
    .string()
    .trim()
    .optional()
    .transform((value) => (value ? value : null)),
  address: z.string().trim().max(240).default(""),
  mapLat: z.string().trim().max(40).default(""),
  mapLng: z.string().trim().max(40).default(""),
  mapZoom: z.coerce.number().int().min(1).max(20).default(8),
  defaultState: z.enum(["always", "dates"]).default("always"),
  icalImportUrl: z.string().trim().max(500).default(""),
  seoTitle: z.string().trim().max(160).default(""),
  seoDescription: z.string().trim().max(400).default(""),
  facebookTitle: z.string().trim().max(160).default(""),
  facebookDescription: z.string().trim().max(400).default(""),
  twitterTitle: z.string().trim().max(160).default(""),
  twitterDescription: z.string().trim().max(400).default(""),
  published: z.literal(false),
  isFeatured: z.boolean(),
  seoIndex: z.boolean(),
});

const publishTourSchema = draftTourSchema
  .omit({
    published: true,
    summary: true,
    destinationId: true,
    seoTitle: true,
    seoDescription: true,
  })
  .extend({
    summary: z.string().trim().min(10, "Add a short description").max(400),
    destinationId: z.string().trim().min(1, "Choose a destination"),
    seoTitle: z.string().trim().min(2, "Add an SEO title").max(160),
    seoDescription: z
      .string()
      .trim()
      .min(10, "Add an SEO description")
      .max(400),
    published: z.literal(true),
  });

type TourParsed = Omit<z.infer<typeof draftTourSchema>, "published" | "destinationId"> & {
  destinationId: string | null;
  published: boolean;
};

function readDestinationIds(formData: FormData) {
  const ids = parseJsonArray<string>(
    String(formData.get("destinationIdsJson") ?? "[]"),
  )
    .map((id) => id.trim())
    .filter(Boolean);
  return [...new Set(ids)];
}

function readDiscounts(
  raw: string,
): { ok: true; items: PriceDiscount[] } | { ok: false; error: string } {
  let parsed: unknown;
  try {
    parsed = raw.trim() ? JSON.parse(raw) : [];
  } catch {
    return { ok: false, error: "Check the discount rules." };
  }
  if (!Array.isArray(parsed)) return { ok: true, items: [] };

  const items: PriceDiscount[] = [];
  for (const row of parsed) {
    const result = discountSchema.safeParse(row);
    if (!result.success) return { ok: false, error: "Check the discount rules." };
    if (result.data.mode === "percent" && result.data.value > 100) {
      return { ok: false, error: "A percent discount cannot be more than 100." };
    }
    if (result.data.kind === "group" && result.data.minPeople < 2) {
      return { ok: false, error: "A group discount needs at least 2 people." };
    }
    items.push({
      kind: result.data.kind,
      minPeople: result.data.kind === "single" ? 1 : result.data.minPeople,
      mode: result.data.mode,
      value: result.data.value,
    });
  }
  return { ok: true, items };
}

function readTourRaw(formData: FormData) {
  const minRaw = formData.get("minDayBeforeBooking");
  const destinationIds = readDestinationIds(formData);
  return {
    title: formData.get("title"),
    summary: formData.get("summary") ?? "",
    description: formData.get("description") ?? "",
    category: formData.get("category") ?? "",
    youtubeUrl: formData.get("youtubeUrl") ?? "",
    minDayBeforeBooking:
      minRaw === null || String(minRaw).trim() === ""
        ? null
        : Number(minRaw),
    durationDays: formData.get("durationDays") || 5,
    durationUnit: parseDurationUnit(String(formData.get("durationUnit") ?? "")),
    durationLabel: formData.get("durationLabel") ?? "",
    difficulty: formData.get("difficulty") || "moderate",
    minPeople: formData.get("minPeople") || 1,
    maxGroupSize: formData.get("maxGroupSize") || 12,
    priceFrom: formData.get("priceFrom") || 0,
    currency: formData.get("currency") || "INR",
    destinationId:
      destinationIds[0] ?? String(formData.get("destinationId") ?? "").trim(),
    address: formData.get("address") ?? "",
    mapLat: formData.get("mapLat") ?? "",
    mapLng: formData.get("mapLng") ?? "",
    mapZoom: formData.get("mapZoom") || 8,
    defaultState: formData.get("defaultState") || "always",
    icalImportUrl: formData.get("icalImportUrl") ?? "",
    seoTitle: formData.get("seoTitle") ?? "",
    seoDescription: formData.get("seoDescription") ?? "",
    facebookTitle: formData.get("facebookTitle") ?? "",
    facebookDescription: formData.get("facebookDescription") ?? "",
    twitterTitle: formData.get("twitterTitle") ?? "",
    twitterDescription: formData.get("twitterDescription") ?? "",
    published: formData.get("published") === "on",
    isFeatured: formData.get("isFeatured") === "on",
    seoIndex: formData.get("seoIndex") === "on",
  };
}

function readTour(formData: FormData):
  | { success: true; data: TourParsed }
  | { success: false; error: z.ZodError } {
  const raw = readTourRaw(formData);
  if (raw.published) {
    const parsed = publishTourSchema.safeParse(raw);
    if (!parsed.success) return parsed;
    return {
      success: true,
      data: {
        ...parsed.data,
        destinationId: parsed.data.destinationId,
        published: true,
      },
    };
  }

  const parsed = draftTourSchema.safeParse(raw);
  if (!parsed.success) return parsed;
  return {
    success: true,
    data: {
      ...parsed.data,
      published: false,
    },
  };
}

function readOptionalImage(
  formData: FormData,
  prefix: "featured" | "seo",
) {
  const url = String(formData.get(`${prefix}ImageUrl`) ?? "").trim();
  const key = String(formData.get(`${prefix}ImageKey`) ?? "").trim();
  const driver = String(formData.get(`${prefix}ImageDriver`) ?? "").trim();
  if (!url || !key) return null;
  if (driver !== "local" && driver !== "cloudinary") return null;
  return { url, key, driver } as const;
}

function revalidateTourPaths(destinationSlug?: string | null) {
  revalidatePath("/tours");
  revalidatePath("/admin/tours");
  revalidatePath("/destinations");
  if (destinationSlug) revalidatePath(`/destinations/${destinationSlug}`);
}

async function loadDestinations(ids: string[]) {
  if (ids.length === 0) return [];
  return prisma.destination.findMany({
    where: { id: { in: ids } },
    select: { id: true, slug: true },
  });
}

function durationError(days: number, unit: "hours" | "days" | "weeks") {
  if (unit === "hours" && days > 240) return "Hours cannot be more than 240.";
  if (unit === "days" && days > 60) return "Days cannot be more than 60.";
  if (unit === "weeks" && days > 52) return "Weeks cannot be more than 52.";
  return null;
}

async function prepareLinks(
  formData: FormData,
  publishing: boolean,
  durationDays: number,
  durationUnit: "hours" | "days" | "weeks",
) {
  const invalidDuration = durationError(durationDays, durationUnit);
  if (invalidDuration) return { error: invalidDuration };
  const destinationIds = readDestinationIds(formData);
  const discounts = readDiscounts(String(formData.get("discountsJson") ?? "[]"));
  if (!discounts.ok) return { error: discounts.error };
  if (publishing && destinationIds.length === 0) {
    return { error: "Choose at least one destination" };
  }
  const destinations = await loadDestinations(destinationIds);
  if (destinations.length !== destinationIds.length) {
    return { error: "Choose a destination" };
  }
  return { destinationIds, discounts: discounts.items, destinations };
}

async function syncDestinations(tourId: string, ids: string[]) {
  await prisma.tourDestination.deleteMany({ where: { tourId } });
  if (ids.length === 0) return;
  await prisma.tourDestination.createMany({
    data: ids.map((destinationId) => ({ tourId, destinationId })),
  });
}

async function syncItinerary(tourId: string, items: ItineraryItem[]) {
  await prisma.itineraryDay.deleteMany({ where: { tourId } });
  if (items.length === 0) return;
  await prisma.itineraryDay.createMany({
    data: items.map((item, index) => ({
      tourId,
      dayNumber: item.dayNumber || index + 1,
      title: item.title.trim(),
      description: item.description.trim(),
      imageUrl: item.imageUrl?.trim() ?? "",
      imageKey: item.imageKey?.trim() ?? "",
      imageDriver: item.imageDriver === "cloudinary" ? "cloudinary" : "local",
    })),
  });
}

async function applyCatalog(data: {
  category: string;
  categoryId: string;
  travelStylesJson: string;
  facilitiesJson: string;
  faqsJson: string;
  includesJson: string;
  excludesJson: string;
}) {
  const categoryId = data.category.trim();
  const category = categoryId
    ? await prisma.catalogItem.findFirst({
        where: { id: categoryId, kind: "category" },
        select: { id: true, title: true },
      })
    : null;
  data.category = category?.title ?? "";
  data.categoryId = category?.id ?? "";
  data.travelStylesJson = JSON.stringify(
    await keepCatalogIds("style", data.travelStylesJson),
  );
  data.facilitiesJson = JSON.stringify(
    await keepCatalogIds("facility", data.facilitiesJson),
  );
  data.faqsJson = JSON.stringify(await keepFaqEntries(data.faqsJson));
  data.includesJson = JSON.stringify(
    await keepCatalogIds("include", data.includesJson),
  );
  data.excludesJson = JSON.stringify(
    await keepCatalogIds("exclude", data.excludesJson),
  );
}

function tourPayload(
  formData: FormData,
  parsed: TourParsed,
  destinationIds: string[],
  discounts: PriceDiscount[],
) {
  const cover = readUploadedImage(formData);
  const banner = readOptionalImage(formData, "featured");
  const seoImage = readOptionalImage(formData, "seo");
  const gallery = parseJsonArray<GalleryItem>(
    String(formData.get("galleryJson") ?? "[]"),
  );
  const itinerary = parseJsonArray<ItineraryItem>(
    String(formData.get("itineraryJson") ?? "[]"),
  );

  return {
    cover,
    banner,
    seoImage,
    gallery,
    itinerary,
    destinationIds,
    data: {
      title: parsed.title,
      summary: parsed.summary,
      description: sanitizeTourHtml(parsed.description),
      category: parsed.category,
      categoryId: "",
      youtubeUrl: parsed.youtubeUrl,
      minDayBeforeBooking: parsed.minDayBeforeBooking ?? null,
      durationDays: parsed.durationDays,
      durationUnit: parsed.durationUnit,
      durationLabel: formatTourDuration(
        parsed.durationDays,
        parsed.durationUnit,
      ),
      discountsJson: JSON.stringify(discounts),
      destinationIdsJson: JSON.stringify(destinationIds),
      difficulty: parsed.difficulty,
      minPeople: parsed.minPeople,
      maxGroupSize: parsed.maxGroupSize,
      priceFrom: parsed.priceFrom,
      currency: parsed.currency,
      address: parsed.address,
      mapLat: parsed.mapLat,
      mapLng: parsed.mapLng,
      mapZoom: parsed.mapZoom,
      defaultState: parsed.defaultState,
      icalImportUrl: parsed.icalImportUrl,
      seoTitle: parsed.seoTitle,
      seoDescription: parsed.seoDescription,
      facebookTitle: parsed.facebookTitle,
      facebookDescription: parsed.facebookDescription,
      twitterTitle: parsed.twitterTitle,
      twitterDescription: parsed.twitterDescription,
      published: parsed.published,
      isFeatured: parsed.isFeatured,
      seoIndex: parsed.seoIndex,
      faqsJson: String(formData.get("faqsJson") ?? "[]"),
      includesJson: String(formData.get("includesJson") ?? "[]"),
      excludesJson: String(formData.get("excludesJson") ?? "[]"),
      surroundingsJson: String(
        formData.get("surroundingsJson") ??
          '{"education":[],"health":[],"transportation":[]}',
      ),
      galleryJson: JSON.stringify(gallery),
      travelStylesJson: String(formData.get("travelStylesJson") ?? "[]"),
      facilitiesJson: String(formData.get("facilitiesJson") ?? "[]"),
      featuredImageUrl: banner?.url ?? "",
      featuredImageKey: banner?.key ?? "",
      featuredImageDriver: banner?.driver ?? "local",
      seoImageUrl: seoImage?.url ?? "",
      seoImageKey: seoImage?.key ?? "",
      seoImageDriver: seoImage?.driver ?? "local",
      imageUrl: cover?.url ?? "",
      imageKey: cover?.key ?? "",
      imageDriver: cover?.driver ?? "local",
    },
  };
}

export async function createTour(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  await requirePermission("tours.manage");

  const parsed = readTour(formData);
  if (!parsed.success) return { error: firstIssue(parsed.error) };

  const publishing = parsed.data.published;
  const links = await prepareLinks(
    formData,
    publishing,
    parsed.data.durationDays,
    parsed.data.durationUnit,
  );
  if ("error" in links) {
    return { error: links.error ?? "Check the form and try again." };
  }

  const payload = tourPayload(
    formData,
    parsed.data,
    links.destinationIds,
    links.discounts,
  );
  await applyCatalog(payload.data);

  const coverError = validateUploadedImage(payload.cover, "tours", {
    required: publishing,
  });
  if (coverError) {
    return {
      error: publishing ? "Upload a cover image for cards." : coverError,
    };
  }
  const bannerError = validateUploadedImage(payload.banner, "tours", {
    required: publishing,
  });
  if (bannerError) {
    return {
      error: publishing ? "Upload a banner image." : bannerError,
    };
  }

  const slug = await uniqueSlug(parsed.data.title, async (candidate) =>
    Boolean(
      await prisma.tour.findUnique({
        where: { slug: candidate },
        select: { id: true },
      }),
    ),
  );

  try {
    const data = {
      ...payload.data,
      isFeatured: false,
      slug,
      destinationId: links.destinationIds[0] ?? null,
    };

    const tour = await prisma.tour.create({ data });

    await syncItinerary(tour.id, payload.itinerary);
    await syncDestinations(tour.id, links.destinationIds);
    for (const destination of links.destinations) {
      revalidateTourPaths(destination.slug);
    }
    if (links.destinations.length === 0) revalidateTourPaths();
    return {
      error: null,
      success: publishing ? "Tour published." : "Draft saved.",
      tourId: tour.id,
    };
  } catch (error) {
    console.error("createTour failed", error);
    return {
      error:
        "Could not save this draft. Check the form and try again.",
    };
  }
}

export async function updateTour(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  await requirePermission("tours.manage");

  const tourId = String(formData.get("tourId") ?? "");
  const parsed = readTour(formData);
  if (!parsed.success) return { error: firstIssue(parsed.error) };

  const existing = await prisma.tour.findUnique({
    where: { id: tourId },
    include: {
      destination: { select: { slug: true } },
      destinationLinks: {
        select: { destination: { select: { slug: true } } },
      },
    },
  });
  if (!existing) return { error: "Tour not found." };

  const publishing = parsed.data.published;
  const links = await prepareLinks(
    formData,
    publishing,
    parsed.data.durationDays,
    parsed.data.durationUnit,
  );
  if ("error" in links) {
    return { error: links.error ?? "Check the form and try again." };
  }

  const payload = tourPayload(
    formData,
    parsed.data,
    links.destinationIds,
    links.discounts,
  );
  await applyCatalog(payload.data);

  const coverError = validateUploadedImage(payload.cover, "tours", {
    required: publishing,
  });
  if (coverError) {
    return {
      error: publishing ? "Upload a cover image for cards." : coverError,
    };
  }
  const bannerError = validateUploadedImage(payload.banner, "tours", {
    required: publishing,
  });
  if (bannerError) {
    return {
      error: publishing ? "Upload a banner image." : bannerError,
    };
  }

  const titleChanged = existing.title !== parsed.data.title;
  const slug = titleChanged
    ? await uniqueSlug(parsed.data.title, async (candidate) =>
        Boolean(
          await prisma.tour.findFirst({
            where: { slug: candidate, NOT: { id: tourId } },
            select: { id: true },
          }),
        ),
      )
    : existing.slug;

  const nextCoverKey = payload.data.imageKey;
  const nextBannerKey = payload.data.featuredImageKey;
  const replacedCover =
    Boolean(existing.imageKey) &&
    Boolean(nextCoverKey) &&
    nextCoverKey !== existing.imageKey;
  const replacedBanner =
    Boolean(existing.featuredImageKey) &&
    Boolean(nextBannerKey) &&
    nextBannerKey !== existing.featuredImageKey;

  await prisma.tour.update({
    where: { id: tourId },
    data: {
      ...payload.data,
      isFeatured: existing.isFeatured,
      slug,
      destinationId: links.destinationIds[0] ?? null,
    },
  });

  await syncItinerary(tourId, payload.itinerary);
  await syncDestinations(tourId, links.destinationIds);

  if (replacedCover) {
    await deleteImage({
      key: existing.imageKey,
      driver: existing.imageDriver === "cloudinary" ? "cloudinary" : "local",
    });
  }
  if (replacedBanner && existing.featuredImageKey) {
    await deleteImage({
      key: existing.featuredImageKey,
      driver:
        existing.featuredImageDriver === "cloudinary" ? "cloudinary" : "local",
    });
  }

  const slugs = new Set<string>();
  if (existing.destination?.slug) slugs.add(existing.destination.slug);
  for (const link of existing.destinationLinks) {
    if (link.destination.slug) slugs.add(link.destination.slug);
  }
  for (const destination of links.destinations) slugs.add(destination.slug);
  if (slugs.size === 0) revalidateTourPaths();
  for (const slug of slugs) revalidateTourPaths(slug);
  return {
    error: null,
    success: publishing ? "Tour published." : "Draft saved.",
    tourId,
  };
}

export async function saveTour(
  previous: FormState,
  formData: FormData,
): Promise<FormState> {
  const tourId = String(formData.get("tourId") ?? "").trim();
  if (tourId) return updateTour(previous, formData);
  return createTour(previous, formData);
}

export async function setTourFeatured(tourId: string, featured: boolean) {
  await requirePermission("tours.manage");
  const tour = await prisma.tour.findUnique({
    where: { id: tourId },
    select: {
      id: true,
      destination: { select: { slug: true } },
    },
  });
  if (!tour) return { error: "Tour not found." };

  await prisma.tour.update({
    where: { id: tourId },
    data: { isFeatured: featured },
  });
  revalidateTourPaths(tour.destination?.slug);
  revalidatePath(`/admin/tours/${tourId}/view`);
  return { error: null as string | null };
}

export async function deleteTour(formData: FormData) {
  await requirePermission("tours.manage");
  const tourId = String(formData.get("tourId") ?? "");

  const tour = await prisma.tour.findUnique({
    where: { id: tourId },
    include: {
      destination: { select: { slug: true } },
    },
  });

  if (!tour) redirect("/admin/tours");

  await prisma.tour.delete({ where: { id: tourId } });
  if (tour.imageKey) {
    await deleteImage({
      key: tour.imageKey,
      driver: tour.imageDriver === "cloudinary" ? "cloudinary" : "local",
    });
  }

  revalidateTourPaths(tour.destination?.slug);
  redirect("/admin/tours?deleted=1");
}
