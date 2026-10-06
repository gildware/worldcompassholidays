"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { firstIssue, type FormState } from "@/lib/forms";
import { requirePermission } from "@/lib/auth/guards";
import { slugify, uniqueSlug } from "@/lib/slug";
import { deleteImage } from "@/lib/storage";
import { deleteDocument } from "@/lib/storage/documents";
import { parseDateOnly, parseDateTimeLocal } from "@/lib/rentals/dates";
import {
  fleetKinds,
  isRentalConfigKind,
  vehicleBaseStatuses,
} from "@/lib/rentals/labels";
import { blockingBookingStatuses } from "@/lib/rentals/labels";

function fail(error: unknown): FormState {
  if (error instanceof Error && error.message) return { error: error.message };
  return { error: "Something went wrong. Try again." };
}

function revalidateFleet(slug?: string) {
  revalidatePath("/admin/rentals");
  revalidatePath("/admin/rentals/fleet");
  revalidatePath("/admin/rentals/configuration");
  revalidatePath("/admin/configuration");
  revalidatePath("/admin/rentals/locations");
  revalidatePath("/admin/rentals/policies");
  revalidatePath("/rentals");
  revalidatePath("/destinations");
  if (slug) revalidatePath(`/rentals/${slug}`);
}

const configSchema = z.object({
  id: z.string().optional(),
  kind: z.string().refine(isRentalConfigKind, "Choose a configuration list."),
  name: z.string().trim().min(2, "Enter a name.").max(80),
  description: z.string().trim().max(400).optional().default(""),
  appliesTo: z.enum(["all", "car", "bike"]),
  active: z.boolean(),
  sortOrder: z.coerce.number().int().min(0).max(9999),
  price: z.coerce.number().int().min(0),
  priceUnit: z.enum(["flat", "per_day"]),
  requiresNumber: z.boolean(),
  requiresIssueDate: z.boolean(),
  requiresExpiry: z.boolean(),
});

export async function saveRentalConfig(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  await requirePermission("vehicles.manage");
  const parsed = configSchema.safeParse({
    id: String(formData.get("id") ?? "") || undefined,
    kind: formData.get("kind"),
    name: formData.get("name"),
    description: formData.get("description") ?? "",
    appliesTo: formData.get("appliesTo") || "all",
    active: formData.get("active") === "on",
    sortOrder: formData.get("sortOrder") || 0,
    price: formData.get("price") || 0,
    priceUnit: formData.get("priceUnit") || "flat",
    requiresNumber: formData.get("requiresNumber") === "on",
    requiresIssueDate: formData.get("requiresIssueDate") === "on",
    requiresExpiry: formData.get("requiresExpiry") === "on",
  });
  if (!parsed.success) return { error: firstIssue(parsed.error) };

  const data = parsed.data;
  const slug = slugify(data.name);
  const duplicate = await prisma.rentalConfig.findFirst({
    where: {
      kind: data.kind,
      slug,
      id: data.id ? { not: data.id } : undefined,
    },
    select: { id: true },
  });
  if (duplicate) return { error: "That name is already in this list." };

  if (data.id) {
    await prisma.rentalConfig.update({
      where: { id: data.id },
      data: { ...data, slug, id: undefined },
    });
  } else {
    await prisma.rentalConfig.create({ data: { ...data, slug } });
  }

  revalidateFleet();
  return { error: null, success: data.id ? "Configuration updated." : "Configuration added." };
}

export async function setRentalConfigActive(formData: FormData) {
  await requirePermission("vehicles.manage");
  const id = String(formData.get("id") ?? "");
  const active = formData.get("active") === "true";
  await prisma.rentalConfig.update({ where: { id }, data: { active } });
  revalidateFleet();
}

export async function deleteRentalConfig(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  await requirePermission("vehicles.manage");
  const id = String(formData.get("id") ?? "");
  const [features, addons, documents, bookingDocs, vehicles] = await Promise.all([
    prisma.vehicleFeature.count({ where: { configId: id } }),
    prisma.vehicleAddon.count({ where: { configId: id } }),
    prisma.vehicleDocument.count({ where: { configId: id } }),
    prisma.rentalBookingDocument.count({ where: { configId: id } }),
    prisma.vehicle.count({
      where: {
        OR: [{ vehicleTypeId: id }, { fuelTypeId: id }, { transmissionId: id }],
      },
    }),
  ]);
  const used = features + addons + documents + bookingDocs + vehicles;
  if (used > 0) {
    return {
      error: "This item is in use. Deactivate it instead of deleting it.",
    };
  }
  await prisma.rentalConfig.delete({ where: { id } });
  revalidateFleet();
  return { error: null, success: "Configuration deleted." };
}

export async function saveRentalSettings(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  await requirePermission("vehicles.manage");
  const allowCounterPickup = formData.get("allowCounterPickup") === "on";
  const allowHomeDelivery = formData.get("allowHomeDelivery") === "on";
  if (!allowCounterPickup && !allowHomeDelivery) {
    return { error: "Allow pickup at a location, home delivery, or both." };
  }
  await prisma.rentalSettings.update({
    where: { id: "default" },
    data: {
      allowCounterPickup,
      allowHomeDelivery,
    },
  });
  revalidateFleet();
  return { error: null, success: "Rental settings saved." };
}

const policySchema = z.object({
  id: z.string().optional(),
  kind: z.enum(["rule", "cancellation"]),
  name: z.string().trim().min(2).max(80),
  description: z.string().trim().min(2).max(600),
  active: z.boolean(),
  sortOrder: z.coerce.number().int().min(0).max(9999),
  hoursBeforePickup: z.string().optional(),
  refundPercent: z.coerce.number().int().min(0).max(100),
});

export async function saveRentalPolicy(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  await requirePermission("vehicles.manage");
  const parsed = policySchema.safeParse({
    id: String(formData.get("id") ?? "") || undefined,
    kind: formData.get("kind"),
    name: formData.get("name"),
    description: formData.get("description"),
    active: formData.get("active") === "on",
    sortOrder: formData.get("sortOrder") || 0,
    hoursBeforePickup: String(formData.get("hoursBeforePickup") ?? ""),
    refundPercent: formData.get("refundPercent") || 0,
  });
  if (!parsed.success) return { error: firstIssue(parsed.error) };
  const hoursRaw = parsed.data.hoursBeforePickup?.trim() ?? "";
  let hoursBeforePickup: number | null = null;
  if (parsed.data.kind === "cancellation") {
    const hours = Number(hoursRaw);
    if (!Number.isInteger(hours) || hours < 0) {
      return { error: "Enter how many hours before pickup this window starts." };
    }
    hoursBeforePickup = hours;
  }
  const slug = slugify(parsed.data.name);
  const duplicate = await prisma.rentalPolicy.findFirst({
    where: { slug, id: parsed.data.id ? { not: parsed.data.id } : undefined },
    select: { id: true },
  });
  if (duplicate) return { error: "A policy with this name already exists." };
  const data = {
    kind: parsed.data.kind,
    name: parsed.data.name,
    slug,
    description: parsed.data.description,
    active: parsed.data.active,
    sortOrder: parsed.data.sortOrder,
    hoursBeforePickup,
    refundPercent: parsed.data.kind === "cancellation" ? parsed.data.refundPercent : 0,
  };
  if (parsed.data.id) {
    await prisma.rentalPolicy.update({ where: { id: parsed.data.id }, data });
  } else {
    await prisma.rentalPolicy.create({ data });
  }
  revalidateFleet();
  return { error: null, success: "Policy saved." };
}

export async function deleteRentalPolicy(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  await requirePermission("vehicles.manage");
  await prisma.rentalPolicy.delete({ where: { id: String(formData.get("id") ?? "") } });
  revalidateFleet();
  return { error: null, success: "Policy deleted." };
}

export async function saveRentalLocation(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  await requirePermission("vehicles.manage");
  const name = String(formData.get("name") ?? "").trim();
  const address = String(formData.get("address") ?? "").trim();
  const mapLat = String(formData.get("mapLat") ?? "").trim();
  const mapLng = String(formData.get("mapLng") ?? "").trim();
  const zoom = Number(formData.get("mapZoom") ?? 14);
  const mapZoom = Number.isInteger(zoom) ? Math.min(20, Math.max(1, zoom)) : 14;
  const imageUrl = String(formData.get("imageUrl") ?? "").trim();
  const imageKey = String(formData.get("imageKey") ?? "").trim();
  const imageDriver = String(formData.get("imageDriver") ?? "") === "cloudinary" ? "cloudinary" : "local";
  const id = String(formData.get("id") ?? "");
  const active = formData.get("active") === "on";
  if (name.length < 2) return { error: "Enter a location name." };
  if (address.length < 2) return { error: "Enter the address." };
  if (!imageUrl) return { error: "Add an image." };
  if ((mapLat && Number.isNaN(Number(mapLat))) || (mapLng && Number.isNaN(Number(mapLng)))) {
    return { error: "Enter a valid map location." };
  }
  if (Boolean(mapLat) !== Boolean(mapLng)) return { error: "Enter both latitude and longitude." };
  const slug = await uniqueSlug(name, async (candidate) => {
    const existing = await prisma.rentalLocation.findUnique({ where: { slug: candidate } });
    return Boolean(existing && existing.id !== id);
  });
  const data = {
    name,
    address,
    mapLat,
    mapLng,
    mapZoom,
    imageUrl,
    imageKey,
    imageDriver,
    active,
  };
  if (id) {
    const current = await prisma.rentalLocation.findUnique({ where: { id } });
    if (!current) return { error: "Location not found." };
    await prisma.rentalLocation.update({
      where: { id },
      data,
    });
  } else {
    await prisma.rentalLocation.create({
      data: { ...data, slug },
    });
  }
  revalidateFleet();
  return { error: null, success: id ? "Location updated." : "Location added." };
}

export async function deleteRentalLocation(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  await requirePermission("vehicles.manage");
  const id = String(formData.get("id") ?? "");
  const used = await prisma.rentalBooking.count({
    where: { OR: [{ pickupLocationId: id }, { returnLocationId: id }] },
  });
  if (used > 0) return { error: "This location is used on bookings. Deactivate it instead." };
  await prisma.rentalLocation.delete({ where: { id } });
  revalidateFleet();
  return { error: null, success: "Location deleted." };
}

export async function removePickupLocation(formData: FormData) {
  const result = await deleteRentalLocation({ error: null }, formData);
  if (result.error) redirect("/admin/rentals/locations?blocked=used");
}

const imageSchema = z.array(
  z.object({
    url: z.string().min(1),
    key: z.string(),
    driver: z.enum(["local", "cloudinary"]),
  }),
);

const vehicleSchema = z.object({
  id: z.string().optional(),
  name: z.string().trim().min(2, "Enter the vehicle name.").max(120),
  registrationNumber: z
    .string()
    .trim()
    .min(4, "Enter the registration number.")
    .max(16)
    .transform((value) => value.replace(/[\s-]/g, "").toUpperCase())
    .refine((value) => /^[A-Z0-9]{4,16}$/.test(value), "Use letters and numbers only."),
  kind: z.enum(["car", "bike"]),
  brand: z.string().trim().max(80).optional().default(""),
  modelName: z.string().trim().max(80).optional().default(""),
  year: z.string().optional().default(""),
  summary: z.string().trim().max(280).optional().default(""),
  description: z.string().trim().max(4000).optional().default(""),
  destinationId: z.string().min(1, "Choose a destination."),
  vehicleTypeId: z.string().optional().default(""),
  fuelTypeId: z.string().optional().default(""),
  transmissionId: z.string().optional().default(""),
  seats: z.coerce.number().int().min(1, "Enter the number of seats.").max(60),
  doors: z.string().optional().default(""),
  luggage: z.string().optional().default(""),
  includedKmPerDay: z.coerce.number().int().min(0).max(5000),
  status: z.enum(vehicleBaseStatuses),
  published: z.boolean(),
  allowCounterPickup: z.boolean(),
  allowHomeDelivery: z.boolean(),
  pricePerDay: z.coerce.number().int().min(0),
  pricePerWeek: z.coerce.number().int().min(0),
  pricePerMonth: z.coerce.number().int().min(0),
  securityDeposit: z.coerce.number().int().min(0),
  extraKmCharge: z.coerce.number().int().min(0),
  lateReturnCharge: z.coerce.number().int().min(0),
  discountType: z.enum(["none", "percent", "flat"]),
  discountValue: z.coerce.number().int().min(0),
});

function idList(formData: FormData, name: string) {
  return formData.getAll(name).map(String).filter(Boolean);
}

export async function saveVehicle(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  await requirePermission("vehicles.manage");
  const parsed = vehicleSchema.safeParse({
    id: String(formData.get("id") ?? "") || undefined,
    name: formData.get("name"),
    registrationNumber: formData.get("registrationNumber"),
    kind: formData.get("kind"),
    brand: formData.get("brand") ?? "",
    modelName: formData.get("modelName") ?? "",
    year: String(formData.get("year") ?? ""),
    summary: formData.get("summary") ?? "",
    description: formData.get("description") ?? "",
    destinationId: formData.get("destinationId"),
    vehicleTypeId: formData.get("vehicleTypeId"),
    fuelTypeId: formData.get("fuelTypeId"),
    transmissionId: formData.get("transmissionId"),
    seats: formData.get("seats"),
    doors: String(formData.get("doors") ?? ""),
    luggage: String(formData.get("luggage") ?? ""),
    includedKmPerDay: formData.get("includedKmPerDay") || 0,
    status: formData.get("status") || "available",
    published: formData.get("published") === "on",
    allowCounterPickup: formData.get("allowCounterPickup") === "on",
    allowHomeDelivery: formData.get("allowHomeDelivery") === "on",
    pricePerDay: formData.get("pricePerDay"),
    pricePerWeek: formData.get("pricePerWeek") || 0,
    pricePerMonth: formData.get("pricePerMonth") || 0,
    securityDeposit: formData.get("securityDeposit") || 0,
    extraKmCharge: formData.get("extraKmCharge") || 0,
    lateReturnCharge: formData.get("lateReturnCharge") || 0,
    discountType: formData.get("discountType") || "none",
    discountValue: formData.get("discountValue") || 0,
  });
  if (!parsed.success) return { error: firstIssue(parsed.error) };
  const data = parsed.data;
  const intent = String(formData.get("intent") ?? "publish");
  const publishing = intent === "publish";
  if (!fleetKinds().includes(data.kind)) {
    return { error: "That fleet is turned off in module settings." };
  }
  if (data.discountType === "percent" && data.discountValue > 100) {
    return { error: "A percent discount cannot be more than 100." };
  }
  if (publishing && data.pricePerDay < 1) {
    return { error: "Enter a daily price." };
  }
  if (publishing && !data.vehicleTypeId) return { error: "Choose a vehicle type." };
  if (publishing && !data.fuelTypeId) return { error: "Choose a fuel type." };
  if (publishing && !data.transmissionId) return { error: "Choose a transmission." };
  if (publishing && !data.allowCounterPickup && !data.allowHomeDelivery) {
    return { error: "Choose pickup, delivery, or both before publishing." };
  }
  if (publishing && data.status === "inactive") {
    return { error: "An inactive vehicle cannot be published." };
  }

  const year = data.year.trim() ? Number(data.year) : null;
  if (data.year.trim() && (!Number.isInteger(year) || year! < 1980 || year! > 2100)) {
    return { error: "Enter a valid model year." };
  }
  const doors = data.doors.trim() ? Number(data.doors) : null;
  const luggage = data.luggage.trim() ? Number(data.luggage) : null;
  if ((doors !== null && (!Number.isInteger(doors) || doors < 0)) || (luggage !== null && (!Number.isInteger(luggage) || luggage < 0))) {
    return { error: "Doors and luggage must be whole numbers." };
  }

  let images: z.infer<typeof imageSchema> = [];
  try {
    images = imageSchema.parse(JSON.parse(String(formData.get("imagesJson") || "[]")));
  } catch {
    return { error: "Vehicle images could not be read. Upload them again." };
  }

  const featureIds = idList(formData, "featureIds");
  const addonIds = idList(formData, "addonIds");
  const locationIds = idList(formData, "locationIds");
  const [type, fuel, transmission] = await Promise.all([
    data.vehicleTypeId
      ? prisma.rentalConfig.findFirst({ where: { id: data.vehicleTypeId, kind: "vehicle_type", active: true } })
      : null,
    data.fuelTypeId
      ? prisma.rentalConfig.findFirst({ where: { id: data.fuelTypeId, kind: "fuel", active: true } })
      : null,
    data.transmissionId
      ? prisma.rentalConfig.findFirst({ where: { id: data.transmissionId, kind: "transmission", active: true } })
      : null,
  ]);
  if (
    (data.vehicleTypeId && !type) ||
    (data.fuelTypeId && !fuel) ||
    (data.transmissionId && !transmission)
  ) {
    return { error: "Choose active type, fuel, and transmission options." };
  }
  if (
    (type && type.appliesTo !== "all" && type.appliesTo !== data.kind) ||
    (fuel && fuel.appliesTo !== "all" && fuel.appliesTo !== data.kind) ||
    (transmission && transmission.appliesTo !== "all" && transmission.appliesTo !== data.kind)
  ) {
    return { error: "One of the selected options does not apply to this fleet." };
  }
  const readyToPublish = Boolean(
    type &&
      fuel &&
      transmission &&
      data.pricePerDay >= 1 &&
      (data.allowCounterPickup || data.allowHomeDelivery) &&
      data.status !== "inactive",
  );

  const record = {
    name: data.name,
    registrationNumber: data.registrationNumber,
    kind: data.kind,
    brand: data.brand,
    modelName: data.modelName,
    year,
    summary: data.summary,
    description: data.description,
    destinationId: data.destinationId,
    vehicleTypeId: type ? data.vehicleTypeId : null,
    fuelTypeId: fuel ? data.fuelTypeId : null,
    transmissionId: transmission ? data.transmissionId : null,
    seats: data.seats,
    doors,
    luggage,
    includedKmPerDay: data.includedKmPerDay,
    status: data.status,
    published: false,
    allowCounterPickup: data.allowCounterPickup,
    allowHomeDelivery: data.allowHomeDelivery,
    pricePerDay: data.pricePerDay,
    pricePerWeek: data.pricePerWeek,
    pricePerMonth: data.pricePerMonth,
    securityDeposit: data.securityDeposit,
    extraKmCharge: data.extraKmCharge,
    lateReturnCharge: data.lateReturnCharge,
    discountType: data.discountType,
    discountValue: data.discountType === "none" ? 0 : data.discountValue,
    currency: "INR",
  };

  const existing = data.id
    ? await prisma.vehicle.findUnique({
        where: { id: data.id },
        include: { images: true },
      })
    : null;
  if (data.id && !existing) return { error: "Vehicle not found." };

  const registrationTaken = await prisma.vehicle.findUnique({
    where: { registrationNumber: data.registrationNumber },
    select: { id: true },
  });
  if (registrationTaken && registrationTaken.id !== existing?.id) {
    return { error: "That registration number is already used by another vehicle." };
  }

  const slug = existing
    ? existing.slug
    : await uniqueSlug(data.name, async (candidate) =>
        Boolean(await prisma.vehicle.findUnique({ where: { slug: candidate }, select: { id: true } })),
      );
  const published =
    publishing || (intent !== "draft" && Boolean(existing?.published && readyToPublish));

  const vehicle = existing
    ? await prisma.vehicle.update({ where: { id: existing.id }, data: { ...record, published } })
    : await prisma.vehicle.create({ data: { ...record, published, slug } });

  await prisma.$transaction([
    prisma.vehicleFeature.deleteMany({ where: { vehicleId: vehicle.id } }),
    prisma.vehicleAddon.deleteMany({ where: { vehicleId: vehicle.id } }),
    prisma.vehicleLocation.deleteMany({ where: { vehicleId: vehicle.id } }),
    prisma.vehicleImage.deleteMany({ where: { vehicleId: vehicle.id } }),
    ...(featureIds.length
      ? [prisma.vehicleFeature.createMany({ data: featureIds.map((configId) => ({ vehicleId: vehicle.id, configId })) })]
      : []),
    ...(addonIds.length
      ? [prisma.vehicleAddon.createMany({ data: addonIds.map((configId) => ({ vehicleId: vehicle.id, configId })) })]
      : []),
    ...(locationIds.length
      ? [prisma.vehicleLocation.createMany({ data: locationIds.map((locationId) => ({ vehicleId: vehicle.id, locationId })) })]
      : []),
    ...(images.length
      ? [
          prisma.vehicleImage.createMany({
            data: images.map((image, index) => ({
              vehicleId: vehicle.id,
              url: image.url,
              key: image.key,
              driver: image.driver,
              sortOrder: index,
            })),
          }),
        ]
      : []),
  ]);

  if (existing) {
    const keep = new Set(images.map((image) => image.key));
    await Promise.all(
      existing.images
        .filter((image) => image.key && !keep.has(image.key))
        .map((image) =>
          deleteImage({
            key: image.key,
            driver: image.driver === "cloudinary" ? "cloudinary" : "local",
          }),
        ),
    );
  }

  revalidateFleet(vehicle.slug);
  if (intent === "continue") {
    return { error: null, success: "Saved.", vehicleId: vehicle.id };
  }
  return {
    error: null,
    success: publishing ? "Vehicle published." : "Draft saved.",
    vehicleId: vehicle.id,
  };
}

export async function deleteVehicle(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  await requirePermission("vehicles.manage");
  const id = String(formData.get("id") ?? "");
  const bookings = await prisma.rentalBooking.count({ where: { vehicleId: id } });
  if (bookings > 0) {
    return { error: "This vehicle has bookings. Set it to inactive instead of deleting it." };
  }
  const vehicle = await prisma.vehicle.findUnique({
    where: { id },
    include: { images: true, documents: true },
  });
  if (!vehicle) return { error: "Vehicle not found." };
  await prisma.vehicle.delete({ where: { id } });
  await Promise.all([
    ...vehicle.images.map((image) =>
      deleteImage({
        key: image.key,
        driver: image.driver === "cloudinary" ? "cloudinary" : "local",
      }),
    ),
    ...vehicle.documents.map((document) =>
      deleteDocument({
        key: document.fileKey,
        driver: document.fileDriver,
        resourceType: document.fileResource,
      }),
    ),
  ]);
  revalidateFleet(vehicle.slug);
  const { redirect } = await import("next/navigation");
  redirect("/admin/rentals/fleet?deleted=1");
  return { error: null };
}

export async function removeVehicle(formData: FormData) {
  const result = await deleteVehicle({ error: null }, formData);
  if (result.error) {
    const { redirect } = await import("next/navigation");
    redirect(`/admin/rentals/fleet?notice=${encodeURIComponent(result.error)}`);
  }
}

const fileSchema = z.object({
  url: z.string().min(1),
  key: z.string(),
  driver: z.enum(["local", "cloudinary"]),
  resourceType: z.enum(["image", "raw"]),
});

export async function saveVehicleDocument(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  await requirePermission("vehicles.manage");
  const vehicleId = String(formData.get("vehicleId") ?? "");
  const configId = String(formData.get("configId") ?? "");
  const config = await prisma.rentalConfig.findFirst({
    where: { id: configId, kind: "vehicle_document" },
  });
  if (!config) return { error: "Choose a vehicle document type." };
  let file: z.infer<typeof fileSchema>;
  try {
    file = fileSchema.parse(JSON.parse(String(formData.get("fileJson") || "")));
  } catch {
    return { error: "Upload the document file." };
  }
  const number = String(formData.get("number") ?? "").trim();
  const issueDate = parseDateOnly(String(formData.get("issueDate") ?? ""));
  const expiryDate = parseDateOnly(String(formData.get("expiryDate") ?? ""));
  if (config.requiresNumber && !number) return { error: `${config.name} needs a number.` };
  if (config.requiresIssueDate && !issueDate) return { error: `${config.name} needs an issue date.` };
  if (config.requiresExpiry && !expiryDate) return { error: `${config.name} needs an expiry date.` };
  const note = String(formData.get("note") ?? "").trim();
  const status = String(formData.get("status") ?? "pending");
  if (!["pending", "verified", "rejected"].includes(status)) {
    return { error: "Choose a document status." };
  }
  await prisma.vehicleDocument.create({
    data: {
      vehicleId,
      configId,
      typeName: config.name,
      fileUrl: file.url,
      fileKey: file.key,
      fileDriver: file.driver,
      fileResource: file.resourceType,
      number,
      issueDate,
      expiryDate,
      note,
      status,
    },
  });
  revalidateFleet();
  return { error: null, success: "Vehicle document added." };
}

export async function deleteVehicleDocument(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  await requirePermission("vehicles.manage");
  const document = await prisma.vehicleDocument.findUnique({
    where: { id: String(formData.get("id") ?? "") },
  });
  if (!document) return { error: "Document not found." };
  await prisma.vehicleDocument.delete({ where: { id: document.id } });
  await deleteDocument({
    key: document.fileKey,
    driver: document.fileDriver,
    resourceType: document.fileResource,
  });
  revalidateFleet();
  return { error: null, success: "Vehicle document removed." };
}

export async function saveVehicleBlock(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  await requirePermission("vehicles.manage");
  const vehicleId = String(formData.get("vehicleId") ?? "");
  const kind = String(formData.get("kind") ?? "hold");
  if (kind !== "hold" && kind !== "maintenance") return { error: "Choose a block type." };
  const startAt = parseDateTimeLocal(String(formData.get("startAt") ?? ""));
  const endAt = parseDateTimeLocal(String(formData.get("endAt") ?? ""));
  if (!startAt || !endAt || endAt <= startAt) {
    return { error: "Enter a start and an end, with the end after the start." };
  }
  const clash = await prisma.rentalBooking.findFirst({
    where: {
      vehicleId,
      status: { in: [...blockingBookingStatuses] },
      pickupAt: { lt: endAt },
      returnAt: { gt: startAt },
    },
    select: { reference: true },
  });
  if (clash) {
    return { error: `Those dates overlap booking ${clash.reference}.` };
  }
  await prisma.vehicleBlock.create({
    data: {
      vehicleId,
      kind,
      startAt,
      endAt,
      reason: String(formData.get("reason") ?? "").trim(),
    },
  });
  revalidateFleet();
  return { error: null, success: kind === "maintenance" ? "Maintenance block added." : "Hold added." };
}

export async function deleteVehicleBlock(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  await requirePermission("vehicles.manage");
  const block = await prisma.vehicleBlock.findUnique({
    where: { id: String(formData.get("id") ?? "") },
  });
  if (!block) return { error: "Block not found." };
  if (block.maintenanceId) {
    return { error: "This block belongs to a maintenance record. Update that record instead." };
  }
  await prisma.vehicleBlock.delete({ where: { id: block.id } });
  revalidateFleet();
  return { error: null, success: "Block removed." };
}
