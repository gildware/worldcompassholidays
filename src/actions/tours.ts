"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { firstIssue, type FormState } from "@/lib/forms";
import { requirePermission } from "@/lib/auth/guards";
import { deleteImage } from "@/lib/storage";
import { readUploadedImage, validateUploadedImage } from "@/lib/storage/form";
import { uniqueSlug } from "@/lib/slug";
import { parseJsonArray, type GalleryItem, type ItineraryItem } from "@/lib/tours/json";

const tourSchema = z.object({
  title: z.string().trim().min(2, "Enter a title").max(160),
  summary: z.string().trim().min(10, "Add a short description").max(400),
  description: z.string().trim().max(20000).default(""),
  category: z.string().trim().max(80).default(""),
  youtubeUrl: z.string().trim().max(300).default(""),
  minDayBeforeBooking: z.coerce.number().int().min(0).optional().nullable(),
  durationDays: z.coerce.number().int().min(1).max(60),
  durationLabel: z.string().trim().max(40).default(""),
  difficulty: z.enum(["easy", "moderate", "challenging"]),
  minPeople: z.coerce.number().int().min(1).max(40),
  maxGroupSize: z.coerce.number().int().min(1).max(40),
  priceFrom: z.coerce.number().int().min(0),
  currency: z.string().trim().min(3).max(3).default("INR"),
  destinationId: z.string().trim().min(1, "Choose a destination"),
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
  published: z.boolean(),
  isFeatured: z.boolean(),
  seoIndex: z.boolean(),
});

function readTour(formData: FormData) {
  const minRaw = formData.get("minDayBeforeBooking");
  return tourSchema.safeParse({
    title: formData.get("title"),
    summary: formData.get("summary"),
    description: formData.get("description") ?? "",
    category: formData.get("category") ?? "",
    youtubeUrl: formData.get("youtubeUrl") ?? "",
    minDayBeforeBooking:
      minRaw === null || String(minRaw).trim() === ""
        ? null
        : Number(minRaw),
    durationDays: formData.get("durationDays"),
    durationLabel: formData.get("durationLabel") ?? "",
    difficulty: formData.get("difficulty") ?? "moderate",
    minPeople: formData.get("minPeople") ?? 1,
    maxGroupSize: formData.get("maxGroupSize"),
    priceFrom: formData.get("priceFrom"),
    currency: formData.get("currency") ?? "INR",
    destinationId: formData.get("destinationId"),
    address: formData.get("address") ?? "",
    mapLat: formData.get("mapLat") ?? "",
    mapLng: formData.get("mapLng") ?? "",
    mapZoom: formData.get("mapZoom") ?? 8,
    defaultState: formData.get("defaultState") ?? "always",
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
  });
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

function revalidateTourPaths(destinationSlug?: string) {
  revalidatePath("/tours");
  revalidatePath("/admin/tours");
  revalidatePath("/destinations");
  if (destinationSlug) revalidatePath(`/destinations/${destinationSlug}`);
}

async function loadDestination(destinationId: string) {
  return prisma.destination.findUnique({
    where: { id: destinationId },
    select: { id: true, slug: true },
  });
}

async function syncItinerary(tourId: string, items: ItineraryItem[]) {
  await prisma.itineraryDay.deleteMany({ where: { tourId } });
  if (items.length === 0) return;
  await prisma.itineraryDay.createMany({
    data: items.map((item, index) => ({
      tourId,
      dayNumber: item.dayNumber || index + 1,
      title: item.title.trim() || `Day ${index + 1}`,
      description: item.description.trim(),
    })),
  });
}

function tourPayload(formData: FormData, parsed: z.infer<typeof tourSchema>) {
  const banner = readUploadedImage(formData);
  const featured = readOptionalImage(formData, "featured");
  const seoImage = readOptionalImage(formData, "seo");
  const gallery = parseJsonArray<GalleryItem>(
    String(formData.get("galleryJson") ?? "[]"),
  );
  const itinerary = parseJsonArray<ItineraryItem>(
    String(formData.get("itineraryJson") ?? "[]"),
  );

  return {
    banner,
    featured,
    seoImage,
    gallery,
    itinerary,
    data: {
      title: parsed.title,
      summary: parsed.summary,
      description: parsed.description,
      category: parsed.category,
      youtubeUrl: parsed.youtubeUrl,
      minDayBeforeBooking: parsed.minDayBeforeBooking ?? null,
      durationDays: parsed.durationDays,
      durationLabel: parsed.durationLabel || String(parsed.durationDays),
      difficulty: parsed.difficulty,
      minPeople: parsed.minPeople,
      maxGroupSize: parsed.maxGroupSize,
      priceFrom: parsed.priceFrom,
      currency: parsed.currency,
      destinationId: parsed.destinationId,
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
      featuredImageUrl: featured?.url ?? "",
      featuredImageKey: featured?.key ?? "",
      featuredImageDriver: featured?.driver ?? "local",
      seoImageUrl: seoImage?.url ?? "",
      seoImageKey: seoImage?.key ?? "",
      seoImageDriver: seoImage?.driver ?? "local",
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

  const payload = tourPayload(formData, parsed.data);
  const imageError = validateUploadedImage(payload.banner, "tours", {
    required: true,
  });
  if (imageError) return { error: imageError };

  const destination = await loadDestination(parsed.data.destinationId);
  if (!destination) return { error: "Choose a destination" };

  const slug = await uniqueSlug(parsed.data.title, async (candidate) =>
    Boolean(
      await prisma.tour.findUnique({
        where: { slug: candidate },
        select: { id: true },
      }),
    ),
  );

  const tour = await prisma.tour.create({
    data: {
      ...payload.data,
      slug,
      imageUrl: payload.banner!.url,
      imageKey: payload.banner!.key,
      imageDriver: payload.banner!.driver,
    },
  });

  await syncItinerary(tour.id, payload.itinerary);
  revalidateTourPaths(destination.slug);
  return { error: null, success: "Tour saved." };
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
    include: { destination: { select: { slug: true } } },
  });
  if (!existing) return { error: "Tour not found." };

  const destination = await loadDestination(parsed.data.destinationId);
  if (!destination) return { error: "Choose a destination" };

  const payload = tourPayload(formData, parsed.data);
  const imageError = validateUploadedImage(payload.banner, "tours", {
    required: true,
  });
  if (imageError) return { error: imageError };

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

  const replacedBanner = payload.banner!.key !== existing.imageKey;

  await prisma.tour.update({
    where: { id: tourId },
    data: {
      ...payload.data,
      slug,
      imageUrl: payload.banner!.url,
      imageKey: payload.banner!.key,
      imageDriver: payload.banner!.driver,
    },
  });

  await syncItinerary(tourId, payload.itinerary);

  if (replacedBanner) {
    await deleteImage({
      key: existing.imageKey,
      driver: existing.imageDriver === "cloudinary" ? "cloudinary" : "local",
    });
  }

  revalidateTourPaths(existing.destination.slug);
  revalidateTourPaths(destination.slug);
  return { error: null, success: "Tour saved." };
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
  await deleteImage({
    key: tour.imageKey,
    driver: tour.imageDriver === "cloudinary" ? "cloudinary" : "local",
  });

  revalidateTourPaths(tour.destination.slug);
  redirect("/admin/tours?deleted=1");
}
