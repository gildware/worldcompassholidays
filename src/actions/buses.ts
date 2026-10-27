"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requirePermission } from "@/lib/auth/guards";
import {
  arriveFromDepart,
  formatBusDuration,
  parseClock,
  parseGallery,
  type BusGalleryItem,
} from "@/lib/buses";
import { mirrorBusOntoRoutes } from "@/lib/bus-catalog";
import { prisma } from "@/lib/db";
import { firstIssue, type FormState } from "@/lib/forms";
import { uniqueSlug } from "@/lib/slug";
import { deleteImage } from "@/lib/storage";
import { validateUploadedImage } from "@/lib/storage/form";
import { clearTtlCache } from "@/lib/ttl-cache";

const coachEnum = z.enum(["seater", "volvo", "sleeper"]);

const busSchema = z.object({
  name: z.string().trim().min(2, "Enter a coach name.").max(120),
  coachType: coachEnum,
  operator: z.string().trim().max(80),
  summary: z.string().trim().max(400),
  about: z.string().trim().max(8000),
});

const routeSchema = z.object({
  busId: z.string().trim().min(1, "Choose the bus that runs this route."),
  fromLocationId: z.string().trim().min(1, "Choose where the route starts."),
  toLocationId: z.string().trim().min(1, "Choose where the route ends."),
  pickup: z.string().trim().max(160),
  dropoff: z.string().trim().max(160),
  departTime: z.string().trim().max(8),
  durationHours: z.coerce.number().int().min(0).max(47),
  durationMinutes: z.coerce.number().int().min(0).max(59),
  fareFrom: z.coerce.number().int().min(0).max(1_000_000),
});

function revalidateBus(slug?: string) {
  clearTtlCache();
  revalidatePath("/admin/buses");
  revalidatePath("/admin/buses/routes");
  revalidatePath("/buses");
  revalidatePath("/");
  if (slug) revalidatePath(`/buses/${slug}`);
}

function isSafeMediaUrl(url: string) {
  if (url.includes("..")) return false;
  if (url.startsWith("/uploads/") || url.startsWith("/img/")) return true;
  return url.startsWith("https://res.cloudinary.com/");
}

function acceptMedia(item: {
  url: string;
  key: string;
  driver: string;
}): BusGalleryItem | { error: string } | null {
  const url = item.url.trim();
  const key = item.key.trim();
  if (!url && !key) return null;
  if (!key || key === "legacy") {
    if (!isSafeMediaUrl(url)) return { error: "Invalid image reference." };
    return { url, key: "", driver: "local" };
  }
  const driver = item.driver === "cloudinary" ? "cloudinary" : "local";
  const image = { url, key, driver } as const;
  const error = validateUploadedImage(image, "buses", { required: false });
  if (error) return { error };
  return image;
}

function readGallery(raw: string): BusGalleryItem[] | { error: string } {
  let parsed: unknown;
  try {
    parsed = raw ? JSON.parse(raw) : [];
  } catch {
    return { error: "The extra photos could not be read." };
  }
  if (!Array.isArray(parsed)) return { error: "The extra photos could not be read." };
  const items: BusGalleryItem[] = [];
  for (const entry of parsed.slice(0, 8)) {
    if (!entry || typeof entry !== "object") continue;
    const row = entry as { url?: unknown; key?: unknown; driver?: unknown };
    const accepted = acceptMedia({
      url: typeof row.url === "string" ? row.url : "",
      key: typeof row.key === "string" ? row.key : "",
      driver: typeof row.driver === "string" ? row.driver : "",
    });
    if (!accepted) continue;
    if ("error" in accepted) return accepted;
    if (items.some((item) => item.url === accepted.url)) continue;
    items.push(accepted);
  }
  return items;
}

async function dropImages(items: BusGalleryItem[]) {
  for (const item of items) {
    if (!item.key) continue;
    await deleteImage({ key: item.key, driver: item.driver });
  }
}

export async function saveBus(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  await requirePermission("buses.manage");
  const intent = String(formData.get("intent") ?? "draft");
  const published = intent === "publish";
  const parsed = busSchema.safeParse({
    name: formData.get("name"),
    coachType: formData.get("coachType") || "seater",
    operator: formData.get("operator") ?? "",
    summary: formData.get("summary") ?? "",
    about: formData.get("about") ?? "",
  });
  if (!parsed.success) return { error: firstIssue(parsed.error) };
  const data = parsed.data;

  const facilities = await prisma.catalogItem.findMany({
    where: { kind: "bus_facility" },
    select: { id: true },
  });
  let facilityIds: string[] = [];
  try {
    const raw = JSON.parse(String(formData.get("facilityIds") ?? "[]")) as unknown;
    if (Array.isArray(raw)) {
      const allowed = new Set(facilities.map((item) => item.id));
      facilityIds = [...new Set(raw.filter((id): id is string => typeof id === "string" && allowed.has(id)))];
    }
  } catch {
    return { error: "The facilities could not be read." };
  }

  const cover = acceptMedia({
    url: String(formData.get("imageUrl") ?? ""),
    key: String(formData.get("imageKey") ?? ""),
    driver: String(formData.get("imageDriver") ?? ""),
  });
  if (cover && "error" in cover) return { error: cover.error };
  if (published && !cover) return { error: "Add a cover photo before publishing." };
  if (published && facilityIds.length < 1) {
    return { error: "Choose at least one facility before publishing." };
  }
  if (published && data.summary.length < 8) {
    return { error: "Write a one-line summary before publishing." };
  }

  const gallery = readGallery(String(formData.get("galleryJson") ?? "[]"));
  if ("error" in gallery) return gallery;

  const id = String(formData.get("id") ?? "").trim();
  const existing = id
    ? await prisma.bus.findUnique({
        where: { id },
        select: { id: true, slug: true, imageKey: true, imageDriver: true, galleryJson: true },
      })
    : null;
  if (id && !existing) return { error: "That bus was not found." };

  const slug = existing
    ? existing.slug
    : await uniqueSlug(data.name, async (candidate) => {
        const found = await prisma.bus.findUnique({ where: { slug: candidate }, select: { id: true } });
        return Boolean(found);
      });

  const saved = {
    name: data.name,
    slug,
    coachType: data.coachType,
    operator: data.operator,
    summary: data.summary,
    about: data.about,
    amenitiesJson: JSON.stringify(facilityIds),
    published,
    imageUrl: cover?.url ?? "",
    imageKey: cover?.key ?? "",
    imageDriver: cover?.driver ?? "local",
    galleryJson: JSON.stringify(gallery),
  };

  const bus = existing
    ? await prisma.bus.update({ where: { id: existing.id }, data: saved })
    : await prisma.bus.create({ data: saved });

  if (existing) {
    const previousGallery = parseGallery(existing.galleryJson);
    const kept = new Set([saved.imageKey, ...gallery.map((item) => item.key)].filter(Boolean));
    await dropImages([
      ...(existing.imageKey && !kept.has(existing.imageKey)
        ? [
            {
              url: "",
              key: existing.imageKey,
              driver: existing.imageDriver === "cloudinary" ? ("cloudinary" as const) : ("local" as const),
            },
          ]
        : []),
      ...previousGallery.filter((item) => item.key && !kept.has(item.key)),
    ]);
  }

  await mirrorBusOntoRoutes(bus.id);
  const routes = await prisma.busRoute.findMany({
    where: { busId: bus.id },
    select: { slug: true },
  });
  revalidateBus();
  for (const route of routes) revalidateBus(route.slug);
  redirect("/admin/buses?saved=1");
}

export async function deleteBus(formData: FormData) {
  await requirePermission("buses.manage");
  const id = String(formData.get("busId") ?? "");
  const bus = await prisma.bus.findUnique({
    where: { id },
    select: {
      slug: true,
      imageKey: true,
      imageDriver: true,
      galleryJson: true,
      _count: { select: { routes: true } },
    },
  });
  if (!bus) redirect("/admin/buses");
  if (bus._count.routes > 0) redirect("/admin/buses?blocked=1");

  await prisma.bus.delete({ where: { id } });
  await dropImages([
    ...(bus.imageKey
      ? [
          {
            url: "",
            key: bus.imageKey,
            driver: bus.imageDriver === "cloudinary" ? ("cloudinary" as const) : ("local" as const),
          },
        ]
      : []),
    ...parseGallery(bus.galleryJson),
  ]);
  revalidateBus();
  redirect("/admin/buses?deleted=1");
}

export async function saveBusRoute(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  await requirePermission("buses.manage");
  const intent = String(formData.get("intent") ?? "draft");
  const published = intent === "publish";
  const parsed = routeSchema.safeParse({
    busId: formData.get("busId"),
    fromLocationId: formData.get("fromLocationId"),
    toLocationId: formData.get("toLocationId"),
    pickup: formData.get("pickup") ?? "",
    dropoff: formData.get("dropoff") ?? "",
    departTime: formData.get("departTime") ?? "",
    durationHours: formData.get("durationHours") ?? 0,
    durationMinutes: formData.get("durationMinutes") ?? 0,
    fareFrom: formData.get("fareFrom") ?? 0,
  });
  if (!parsed.success) return { error: firstIssue(parsed.error) };

  const data = parsed.data;
  if (data.fromLocationId === data.toLocationId) {
    return { error: "A route has to start and end in different places." };
  }

  const [bus, fromLocation, toLocation] = await Promise.all([
    prisma.bus.findUnique({ where: { id: data.busId } }),
    prisma.catalogItem.findFirst({
      where: { id: data.fromLocationId, kind: "bus_location" },
    }),
    prisma.catalogItem.findFirst({
      where: { id: data.toLocationId, kind: "bus_location" },
    }),
  ]);
  if (!bus) return { error: "Choose a bus from the bus list." };
  if (!fromLocation || !toLocation) {
    return { error: "Choose locations from the location list." };
  }

  const minutes = data.durationHours * 60 + data.durationMinutes;
  const departOk = Boolean(parseClock(data.departTime));
  if (published) {
    if (!bus.published) {
      return { error: "Publish the bus first. Photos and facilities belong to the bus." };
    }
    if (!departOk) return { error: "Set a departure time before publishing." };
    if (minutes < 15) return { error: "Set a travel time of at least 15 minutes." };
    if (!fromLocation.mapLat || !fromLocation.mapLng || !toLocation.mapLat || !toLocation.mapLng) {
      return { error: "Both locations need a map pin before this route can be published." };
    }
  } else if (data.departTime && !departOk) {
    return { error: "Use a departure time like 21:30." };
  }

  const arrival =
    departOk && minutes > 0
      ? arriveFromDepart(data.departTime, data.durationHours, data.durationMinutes)
      : { time: "", days: 0 };

  const id = String(formData.get("id") ?? "").trim();
  const existing = id
    ? await prisma.busRoute.findUnique({
        where: { id },
        select: { id: true, slug: true },
      })
    : null;
  if (id && !existing) return { error: "That route was not found." };

  const slug = existing
    ? existing.slug
    : await uniqueSlug(`${bus.name} ${fromLocation.title} ${toLocation.title}`, async (candidate) => {
        const found = await prisma.busRoute.findUnique({
          where: { slug: candidate },
          select: { id: true },
        });
        return Boolean(found);
      });

  const saved = {
    busId: bus.id,
    name: bus.name,
    slug,
    fromCity: fromLocation.title,
    toCity: toLocation.title,
    fromLocationId: fromLocation.id,
    toLocationId: toLocation.id,
    pickup: data.pickup || fromLocation.content,
    dropoff: data.dropoff || toLocation.content,
    departTime: departOk ? data.departTime : "",
    arriveTime: arrival.time,
    duration: minutes > 0 ? formatBusDuration(data.durationHours, data.durationMinutes) : "",
    fareFrom: data.fareFrom,
    published,
  };

  if (existing) {
    await prisma.busRoute.update({ where: { id: existing.id }, data: saved });
  } else {
    await prisma.busRoute.create({ data: saved });
  }
  await mirrorBusOntoRoutes(bus.id);

  revalidateBus(slug);
  redirect("/admin/buses/routes?saved=1");
}

export async function deleteBusRoute(formData: FormData) {
  await requirePermission("buses.manage");
  const id = String(formData.get("routeId") ?? "");
  const route = await prisma.busRoute.findUnique({
    where: { id },
    select: { slug: true },
  });
  if (!route) redirect("/admin/buses/routes");

  await prisma.busRoute.delete({ where: { id } });
  revalidateBus(route.slug);
  redirect("/admin/buses/routes?deleted=1");
}
