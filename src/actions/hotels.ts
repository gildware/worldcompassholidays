"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { keepCatalogIds, keepFaqEntries } from "@/lib/catalog-query";
import { firstIssue, type FormState } from "@/lib/forms";
import { requirePermission } from "@/lib/auth/guards";
import { prisma } from "@/lib/db";
import { isMealPlan, isPropertyType } from "@/lib/hotels/options";
import { deleteImage } from "@/lib/storage";
import { readUploadedImage, validateUploadedImage } from "@/lib/storage/form";
import { uniqueSlug } from "@/lib/slug";
import { sanitizeTourHtml } from "@/lib/tours/html";
import { parseJsonArray, type GalleryItem } from "@/lib/tours/json";

const propertyTypes = [
  "hotel",
  "resort",
  "homestay",
  "villa",
  "guesthouse",
  "apartment",
] as const;

const mealPlans = ["room_only", "breakfast", "half_board", "full_board"] as const;

const timePattern = /^([01]\d|2[0-3]):[0-5]\d$/;

const roomSchema = z.object({
  id: z.string().trim().max(80).default(""),
  name: z.string().trim().min(2, "Enter a room name.").max(120),
  summary: z.string().trim().max(400).default(""),
  occupancy: z.number().int().min(1, "A room must sleep at least 1.").max(20),
  bedType: z.string().trim().max(40).default(""),
  sizeSqm: z.number().int().min(1).max(2000).nullable().default(null),
  quantity: z.number().int().min(1, "Enter how many of this room you have.").max(500),
  pricePerNight: z.number().int().min(0, "Enter a nightly price."),
  extraGuestPrice: z.number().int().min(0).default(0),
  mealPlan: z.enum(mealPlans).default("room_only"),
  features: z.array(z.string()).default([]),
  amenities: z.array(z.string()).default([]),
  imageUrl: z.string().default(""),
  imageKey: z.string().default(""),
  imageDriver: z.string().default(""),
  active: z.boolean().default(true),
});

type RoomInput = z.infer<typeof roomSchema>;

const draftSchema = z.object({
  name: z.string().trim().min(2, "Enter a hotel name.").max(160),
  summary: z.string().trim().max(400).default(""),
  description: z.string().trim().max(100000).default(""),
  propertyType: z.enum(propertyTypes).default("hotel"),
  starRating: z.coerce.number().int().min(0).max(5).default(0),
  checkIn: z.string().trim().default("14:00"),
  checkOut: z.string().trim().default("11:00"),
  currency: z.string().trim().min(3).max(3).default("INR"),
  destinationId: z
    .string()
    .trim()
    .optional()
    .transform((value) => (value ? value : null)),
  address: z.string().trim().max(240).default(""),
  mapLat: z.string().trim().max(40).default(""),
  mapLng: z.string().trim().max(40).default(""),
  mapZoom: z.coerce.number().int().min(1).max(20).default(14),
  cancellationPolicy: z.string().trim().max(4000).default(""),
  houseRules: z.string().trim().max(4000).default(""),
  seoTitle: z.string().trim().max(160).default(""),
  seoDescription: z.string().trim().max(400).default(""),
  published: z.literal(false),
  isFeatured: z.boolean(),
  seoIndex: z.boolean(),
});

const publishSchema = draftSchema
  .omit({
    published: true,
    summary: true,
    destinationId: true,
    seoTitle: true,
    seoDescription: true,
    checkIn: true,
    checkOut: true,
  })
  .extend({
    summary: z.string().trim().min(10, "Add a short description.").max(400),
    destinationId: z.string().trim().min(1, "Choose a destination."),
    seoTitle: z.string().trim().min(2, "Add an SEO title.").max(160),
    seoDescription: z.string().trim().min(10, "Add an SEO description.").max(400),
    checkIn: z.string().trim().regex(timePattern, "Enter a check-in time."),
    checkOut: z.string().trim().regex(timePattern, "Enter a check-out time."),
    published: z.literal(true),
  });

type HotelParsed = Omit<z.infer<typeof draftSchema>, "published" | "destinationId"> & {
  destinationId: string | null;
  published: boolean;
};

function revalidateHotelPaths(destinationSlug?: string | null) {
  revalidatePath("/hotels");
  revalidatePath("/admin/hotels");
  revalidatePath("/destinations");
  if (destinationSlug) revalidatePath(`/destinations/${destinationSlug}`);
}

function readOptionalImage(formData: FormData, prefix: "featured" | "seo") {
  const url = String(formData.get(`${prefix}ImageUrl`) ?? "").trim();
  const key = String(formData.get(`${prefix}ImageKey`) ?? "").trim();
  const driver = String(formData.get(`${prefix}ImageDriver`) ?? "").trim();
  if (!url || !key) return null;
  if (driver !== "local" && driver !== "cloudinary") return null;
  return { url, key, driver } as const;
}

function readHotel(formData: FormData):
  | { success: true; data: HotelParsed }
  | { success: false; error: z.ZodError } {
  const destinationId = String(formData.get("destinationId") ?? "").trim();
  const raw = {
    name: formData.get("name"),
    summary: formData.get("summary") ?? "",
    description: formData.get("description") ?? "",
    propertyType: formData.get("propertyType") || "hotel",
    starRating: formData.get("starRating") || 0,
    checkIn: String(formData.get("checkIn") ?? "").trim() || "14:00",
    checkOut: String(formData.get("checkOut") ?? "").trim() || "11:00",
    currency: String(formData.get("currency") ?? "INR").trim().toUpperCase() || "INR",
    destinationId,
    address: formData.get("address") ?? "",
    mapLat: formData.get("mapLat") ?? "",
    mapLng: formData.get("mapLng") ?? "",
    mapZoom: formData.get("mapZoom") || 14,
    cancellationPolicy: formData.get("cancellationPolicy") ?? "",
    houseRules: formData.get("houseRules") ?? "",
    seoTitle: formData.get("seoTitle") ?? "",
    seoDescription: formData.get("seoDescription") ?? "",
    published: formData.get("published") === "on",
    isFeatured: formData.get("isFeatured") === "on",
    seoIndex: formData.get("seoIndex") === "on",
  };

  if (raw.published) {
    const parsed = publishSchema.safeParse(raw);
    if (!parsed.success) return parsed;
    return { success: true, data: { ...parsed.data, published: true } };
  }

  const parsed = draftSchema.safeParse({
    ...raw,
    checkIn: timePattern.test(raw.checkIn) ? raw.checkIn : "14:00",
    checkOut: timePattern.test(raw.checkOut) ? raw.checkOut : "11:00",
    propertyType: isPropertyType(String(raw.propertyType)) ? raw.propertyType : "hotel",
  });
  if (!parsed.success) return parsed;
  return { success: true, data: { ...parsed.data, published: false } };
}

function roomImage(room: {
  imageUrl: string;
  imageKey: string;
  imageDriver: string;
}) {
  if (!room.imageUrl || !room.imageKey) return null;
  if (room.imageDriver !== "local" && room.imageDriver !== "cloudinary") return null;
  return {
    url: room.imageUrl,
    key: room.imageKey,
    driver: room.imageDriver,
  } as const;
}

function readRooms(
  raw: string,
  publishing: boolean,
): { ok: true; rooms: RoomInput[] } | { ok: false; error: string } {
  let parsed: unknown;
  try {
    parsed = raw.trim() ? JSON.parse(raw) : [];
  } catch {
    return { ok: false, error: "Check the rooms and try again." };
  }
  if (!Array.isArray(parsed)) return { ok: true, rooms: [] };

  const rooms: RoomInput[] = [];
  for (const row of parsed) {
    if (!row || typeof row !== "object") continue;
    const record = row as Record<string, unknown>;
    const name = typeof record.name === "string" ? record.name.trim() : "";
    const summary = typeof record.summary === "string" ? record.summary.trim() : "";
    const bedType = typeof record.bedType === "string" ? record.bedType.trim() : "";
    const imageKey = typeof record.imageKey === "string" ? record.imageKey.trim() : "";
    const features = Array.isArray(record.features) ? record.features : [];
    const amenities = Array.isArray(record.amenities) ? record.amenities : [];
    const touched =
      Boolean(name || summary || bedType || imageKey) ||
      features.length > 0 ||
      amenities.length > 0 ||
      record.pricePerNight != null ||
      record.occupancy != null;
    if (!touched) continue;

    const meal = typeof record.mealPlan === "string" ? record.mealPlan : "room_only";
    const result = roomSchema.safeParse({
      ...record,
      name,
      summary,
      bedType,
      mealPlan: isMealPlan(meal) ? meal : "room_only",
      sizeSqm:
        record.sizeSqm === "" || record.sizeSqm == null ? null : Number(record.sizeSqm),
      features: features.filter((item) => typeof item === "string"),
      amenities: amenities.filter((item) => typeof item === "string"),
    });
    if (!result.success) return { ok: false, error: firstIssue(result.error) };

    const image = roomImage(result.data);
    const imageError = validateUploadedImage(image, "hotels", { required: false });
    if (imageError) return { ok: false, error: imageError };
    rooms.push(result.data);
  }

  if (publishing && !rooms.some((room) => room.active)) {
    return { ok: false, error: "Add at least one room you can sell." };
  }
  return { ok: true, rooms };
}

function readGallery(raw: string) {
  const items = parseJsonArray<GalleryItem>(raw).flatMap((item) => {
    if (!item?.url || !item.key) return [];
    if (item.driver !== "local" && item.driver !== "cloudinary") return [];
    return [{ url: item.url, key: item.key, driver: item.driver }];
  });
  for (const item of items) {
    const error = validateUploadedImage(item, "hotels", { required: false });
    if (error) return { error };
  }
  return { items };
}

function priceFromRooms(rooms: RoomInput[]) {
  const prices = rooms.filter((room) => room.active).map((room) => room.pricePerNight);
  if (prices.length === 0) return 0;
  return Math.min(...prices);
}

async function applyRoomCatalog(rooms: RoomInput[]) {
  const next: RoomInput[] = [];
  for (const room of rooms) {
    next.push({
      ...room,
      features: await keepCatalogIds("room_feature", JSON.stringify(room.features)),
      amenities: await keepCatalogIds("room_amenity", JSON.stringify(room.amenities)),
    });
  }
  return next;
}

type StoredImage = { key: string; driver: string };

function remember(list: StoredImage[], key: string, driver: string) {
  if (!key) return;
  list.push({ key, driver });
}

async function deleteUnused(previous: StoredImage[], nextKeys: Set<string>) {
  const seen = new Set<string>();
  for (const image of previous) {
    if (!image.key || nextKeys.has(image.key) || seen.has(image.key)) continue;
    seen.add(image.key);
    await deleteImage({
      key: image.key,
      driver: image.driver === "cloudinary" ? "cloudinary" : "local",
    });
  }
}

function hotelImages(hotel: {
  imageKey: string;
  imageDriver: string;
  featuredImageKey: string;
  featuredImageDriver: string;
  seoImageKey: string;
  seoImageDriver: string;
  galleryJson: string;
  rooms: { imageKey: string; imageDriver: string }[];
}) {
  const images: StoredImage[] = [];
  remember(images, hotel.imageKey, hotel.imageDriver);
  remember(images, hotel.featuredImageKey, hotel.featuredImageDriver);
  remember(images, hotel.seoImageKey, hotel.seoImageDriver);
  for (const item of parseJsonArray<GalleryItem>(hotel.galleryJson)) {
    if (item?.key) remember(images, item.key, item.driver);
  }
  for (const room of hotel.rooms) remember(images, room.imageKey, room.imageDriver);
  return images;
}

async function syncRooms(hotelId: string, rooms: RoomInput[]) {
  const existing = await prisma.room.findMany({
    where: { hotelId },
    select: { id: true },
  });
  const existingIds = new Set(existing.map((room) => room.id));
  const keep = new Set<string>();

  for (const [index, room] of rooms.entries()) {
    const image = roomImage(room);
    const data = {
      name: room.name,
      summary: room.summary,
      occupancy: room.occupancy,
      bedType: room.bedType,
      sizeSqm: room.sizeSqm,
      quantity: room.quantity,
      pricePerNight: room.pricePerNight,
      extraGuestPrice: room.extraGuestPrice,
      mealPlan: room.mealPlan,
      featuresJson: JSON.stringify(room.features),
      amenitiesJson: JSON.stringify(room.amenities),
      imageUrl: image?.url ?? "",
      imageKey: image?.key ?? "",
      imageDriver: image?.driver ?? "local",
      active: room.active,
      sortOrder: index,
    };
    if (room.id && existingIds.has(room.id)) {
      await prisma.room.update({ where: { id: room.id }, data });
      keep.add(room.id);
    } else {
      const created = await prisma.room.create({ data: { hotelId, ...data } });
      keep.add(created.id);
    }
  }

  await prisma.room.deleteMany({
    where: { hotelId, id: { notIn: [...keep] } },
  });
}

export async function saveHotel(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  await requirePermission("hotels.manage");

  const parsed = readHotel(formData);
  if (!parsed.success) return { error: firstIssue(parsed.error) };

  const publishing = parsed.data.published;
  if (publishing && !timePattern.test(parsed.data.checkIn)) {
    return { error: "Enter a check-in time." };
  }
  if (publishing && !timePattern.test(parsed.data.checkOut)) {
    return { error: "Enter a check-out time." };
  }

  const roomsResult = readRooms(String(formData.get("roomsJson") ?? "[]"), publishing);
  if (!roomsResult.ok) return { error: roomsResult.error };

  const gallery = readGallery(String(formData.get("galleryJson") ?? "[]"));
  if ("error" in gallery && gallery.error) return { error: gallery.error };

  const cover = readUploadedImage(formData);
  const banner = readOptionalImage(formData, "featured");
  const seoImage = readOptionalImage(formData, "seo");
  const coverError = validateUploadedImage(cover, "hotels", { required: publishing });
  if (coverError) {
    return { error: publishing ? "Upload a cover image for cards." : coverError };
  }
  const bannerError = validateUploadedImage(banner, "hotels", { required: publishing });
  if (bannerError) {
    return { error: publishing ? "Upload a banner image." : bannerError };
  }
  const seoError = validateUploadedImage(seoImage, "hotels", { required: false });
  if (seoError) return { error: seoError };

  let destinationSlug: string | null = null;
  if (parsed.data.destinationId) {
    const destination = await prisma.destination.findUnique({
      where: { id: parsed.data.destinationId },
      select: { id: true, slug: true },
    });
    if (!destination) return { error: "Choose a destination." };
    destinationSlug = destination.slug;
  } else if (publishing) {
    return { error: "Choose a destination." };
  }

  const rooms = await applyRoomCatalog(roomsResult.rooms);
  const amenities = await keepCatalogIds(
    "hotel_amenity",
    String(formData.get("amenitiesJson") ?? "[]"),
  );
  const faqs = await keepFaqEntries(
    String(formData.get("faqsJson") ?? "[]"),
    "hotel_faq",
  );

  const data = {
    name: parsed.data.name,
    summary: parsed.data.summary,
    description: sanitizeTourHtml(parsed.data.description),
    propertyType: parsed.data.propertyType,
    starRating: parsed.data.starRating,
    checkIn: parsed.data.checkIn,
    checkOut: parsed.data.checkOut,
    priceFrom: priceFromRooms(rooms),
    currency: parsed.data.currency,
    address: parsed.data.address,
    mapLat: parsed.data.mapLat,
    mapLng: parsed.data.mapLng,
    mapZoom: parsed.data.mapZoom,
    cancellationPolicy: parsed.data.cancellationPolicy,
    houseRules: parsed.data.houseRules,
    seoTitle: parsed.data.seoTitle,
    seoDescription: parsed.data.seoDescription,
    published: parsed.data.published,
    isFeatured: parsed.data.isFeatured,
    seoIndex: parsed.data.seoIndex,
    destinationId: parsed.data.destinationId,
    amenitiesJson: JSON.stringify(amenities),
    faqsJson: JSON.stringify(faqs),
    galleryJson: JSON.stringify(gallery.items ?? []),
    imageUrl: cover?.url ?? "",
    imageKey: cover?.key ?? "",
    imageDriver: cover?.driver ?? "local",
    featuredImageUrl: banner?.url ?? "",
    featuredImageKey: banner?.key ?? "",
    featuredImageDriver: banner?.driver ?? "local",
    seoImageUrl: seoImage?.url ?? "",
    seoImageKey: seoImage?.key ?? "",
    seoImageDriver: seoImage?.driver ?? "local",
  };

  const nextKeys = new Set<string>();
  for (const key of [
    data.imageKey,
    data.featuredImageKey,
    data.seoImageKey,
    ...rooms.map((room) => room.imageKey),
    ...(gallery.items ?? []).map((item) => item.key),
  ]) {
    if (key) nextKeys.add(key);
  }

  const hotelId = String(formData.get("hotelId") ?? "").trim();

  try {
    if (!hotelId) {
      const slug = await uniqueSlug(parsed.data.name, async (candidate) =>
        Boolean(
          await prisma.hotel.findUnique({
            where: { slug: candidate },
            select: { id: true },
          }),
        ),
      );
      const hotel = await prisma.hotel.create({ data: { ...data, slug } });
      await syncRooms(hotel.id, rooms);
      revalidateHotelPaths(destinationSlug);
      revalidatePath(`/hotels/${slug}`);
      return {
        error: null,
        success: publishing ? "Hotel published." : "Draft saved.",
        hotelId: hotel.id,
      };
    }

    const existing = await prisma.hotel.findUnique({
      where: { id: hotelId },
      include: {
        destination: { select: { slug: true } },
        rooms: { select: { imageKey: true, imageDriver: true } },
      },
    });
    if (!existing) return { error: "Hotel not found." };

    const slug =
      existing.name === parsed.data.name
        ? existing.slug
        : await uniqueSlug(parsed.data.name, async (candidate) =>
            Boolean(
              await prisma.hotel.findFirst({
                where: { slug: candidate, NOT: { id: hotelId } },
                select: { id: true },
              }),
            ),
          );

    await prisma.hotel.update({ where: { id: hotelId }, data: { ...data, slug } });
    await syncRooms(hotelId, rooms);
    await deleteUnused(hotelImages(existing), nextKeys);
    revalidateHotelPaths(existing.destination?.slug);
    revalidateHotelPaths(destinationSlug);
    revalidatePath(`/hotels/${existing.slug}`);
    revalidatePath(`/hotels/${slug}`);
    revalidatePath(`/admin/hotels/${hotelId}/view`);
    return {
      error: null,
      success: publishing ? "Hotel published." : "Draft saved.",
      hotelId,
    };
  } catch (error) {
    console.error("saveHotel failed", error);
    return { error: "Could not save this hotel. Check the form and try again." };
  }
}

export async function deleteHotel(formData: FormData) {
  await requirePermission("hotels.manage");
  const hotelId = String(formData.get("hotelId") ?? "");
  const hotel = await prisma.hotel.findUnique({
    where: { id: hotelId },
    include: {
      destination: { select: { slug: true } },
      rooms: { select: { imageKey: true, imageDriver: true } },
    },
  });
  if (!hotel) redirect("/admin/hotels");

  const images = hotelImages(hotel);
  await prisma.hotel.delete({ where: { id: hotelId } });
  await deleteUnused(images, new Set());
  revalidateHotelPaths(hotel.destination?.slug);
  revalidatePath(`/hotels/${hotel.slug}`);
  redirect("/admin/hotels?deleted=1");
}
