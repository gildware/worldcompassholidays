"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { isKnownCountry } from "@/lib/data/countries";
import { prisma } from "@/lib/db";
import { firstIssue, type FormState } from "@/lib/forms";
import { requirePermission } from "@/lib/auth/guards";
import { deleteImage } from "@/lib/storage";
import { readUploadedImage, validateUploadedImage } from "@/lib/storage/form";
import { parentAssignmentError } from "@/lib/destinations";
import { readMapFields } from "@/lib/maps";
import { uniqueSlug } from "@/lib/slug";

const destinationSchema = z.object({
  name: z.string().trim().min(2, "Enter a destination name").max(80),
  region: z.string().trim().min(2, "Enter a region").max(80),
  country: z
    .string()
    .trim()
    .min(2, "Choose a country")
    .refine(isKnownCountry, "Choose a country from the list"),
  summary: z.string().trim().min(10, "Add a short summary").max(280),
  published: z.boolean(),
  parentId: z.string().trim(),
  mapLat: z.string(),
  mapLng: z.string(),
  mapZoom: z.number().int(),
});

function readDestination(formData: FormData) {
  const map = readMapFields(
    formData.get("mapLat"),
    formData.get("mapLng"),
    formData.get("mapZoom"),
  );
  if (!map.ok) return { success: false as const, error: map.error };

  const parsed = destinationSchema.safeParse({
    name: formData.get("name"),
    region: formData.get("region"),
    country: formData.get("country"),
    summary: formData.get("summary"),
    published: formData.get("published") === "on",
    parentId: String(formData.get("parentId") ?? ""),
    mapLat: map.mapLat,
    mapLng: map.mapLng,
    mapZoom: map.mapZoom,
  });
  if (!parsed.success) {
    return { success: false as const, error: firstIssue(parsed.error) };
  }
  return { success: true as const, data: parsed.data };
}

async function resolveParentId(parentId: string, destinationId?: string) {
  const rows = await prisma.destination.findMany({
    select: { id: true, parentId: true },
  });
  const error = parentAssignmentError(rows, parentId, destinationId);
  if (error) return { error, parentId: null };
  return { error: null, parentId: parentId || null };
}

async function rememberDestinationToast(kind: "added" | "updated") {
  const jar = await cookies();
  jar.set("destination_toast", kind, {
    path: "/admin/destinations",
    maxAge: 30,
    sameSite: "lax",
    httpOnly: false,
  });
}

function revalidateDestinationPaths(slug?: string) {
  revalidatePath("/");
  revalidatePath("/destinations");
  revalidatePath("/admin/destinations");
  if (slug) revalidatePath(`/destinations/${slug}`);
}

export async function createDestination(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  await requirePermission("destinations.manage");

  const parsed = readDestination(formData);
  if (!parsed.success) return { error: parsed.error };

  const uploaded = readUploadedImage(formData);
  const imageError = validateUploadedImage(uploaded, "destinations", {
    required: true,
  });
  if (imageError) return { error: imageError };

  const parent = await resolveParentId(parsed.data.parentId);
  if (parent.error) return { error: parent.error };

  const slug = await uniqueSlug(parsed.data.name, async (candidate) =>
    Boolean(
      await prisma.destination.findUnique({
        where: { slug: candidate },
        select: { id: true },
      }),
    ),
  );

  await prisma.destination.create({
    data: {
      name: parsed.data.name,
      region: parsed.data.region,
      country: parsed.data.country,
      summary: parsed.data.summary,
      mapLat: parsed.data.mapLat,
      mapLng: parsed.data.mapLng,
      mapZoom: parsed.data.mapZoom,
      published: parsed.data.published,
      parentId: parent.parentId,
      slug,
      imageUrl: uploaded!.url,
      imageKey: uploaded!.key,
      imageDriver: uploaded!.driver,
    },
  });

  revalidateDestinationPaths(slug);
  if (parent.parentId) {
    const parentRow = await prisma.destination.findUnique({
      where: { id: parent.parentId },
      select: { slug: true },
    });
    if (parentRow) revalidateDestinationPaths(parentRow.slug);
  }
  await rememberDestinationToast("added");
  redirect("/admin/destinations?saved=added");
}

export async function updateDestination(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  await requirePermission("destinations.manage");

  const destinationId = String(formData.get("destinationId") ?? "");
  const parsed = readDestination(formData);
  if (!parsed.success) return { error: parsed.error };

  const existing = await prisma.destination.findUnique({
    where: { id: destinationId },
    select: {
      id: true,
      slug: true,
      name: true,
      parentId: true,
      imageUrl: true,
      imageKey: true,
      imageDriver: true,
    },
  });
  if (!existing) return { error: "Destination not found." };

  const uploaded = readUploadedImage(formData);
  const imageError = validateUploadedImage(uploaded, "destinations", {
    required: true,
  });
  if (imageError) return { error: imageError };

  const parent = await resolveParentId(parsed.data.parentId, destinationId);
  if (parent.error) return { error: parent.error };

  const nameChanged = existing.name !== parsed.data.name;
  const slug = nameChanged
    ? await uniqueSlug(parsed.data.name, async (candidate) =>
        Boolean(
          await prisma.destination.findFirst({
            where: { slug: candidate, NOT: { id: destinationId } },
            select: { id: true },
          }),
        ),
      )
    : existing.slug;

  const imageUrl = uploaded!.url;
  const imageKey = uploaded!.key;
  const imageDriver = uploaded!.driver;
  const replaced = imageKey !== existing.imageKey;

  await prisma.destination.update({
    where: { id: destinationId },
    data: {
      name: parsed.data.name,
      region: parsed.data.region,
      country: parsed.data.country,
      summary: parsed.data.summary,
      mapLat: parsed.data.mapLat,
      mapLng: parsed.data.mapLng,
      mapZoom: parsed.data.mapZoom,
      published: parsed.data.published,
      parentId: parent.parentId,
      slug,
      imageUrl,
      imageKey,
      imageDriver,
    },
  });

  if (replaced) {
    await deleteImage({
      key: existing.imageKey,
      driver: existing.imageDriver === "cloudinary" ? "cloudinary" : "local",
    });
  }

  revalidateDestinationPaths(existing.slug);
  revalidateDestinationPaths(slug);
  const parentIds = [existing.parentId, parent.parentId].filter(
    (id): id is string => Boolean(id),
  );
  if (parentIds.length > 0) {
    const parents = await prisma.destination.findMany({
      where: { id: { in: parentIds } },
      select: { slug: true },
    });
    for (const row of parents) revalidateDestinationPaths(row.slug);
  }
  await rememberDestinationToast("updated");
  redirect("/admin/destinations?saved=updated");
}

export async function deleteDestination(formData: FormData) {
  await requirePermission("destinations.manage");
  const destinationId = String(formData.get("destinationId") ?? "");

  const destination = await prisma.destination.findUnique({
    where: { id: destinationId },
    include: {
      _count: {
        select: {
          tours: true,
          hotels: true,
          vehicles: true,
          busRoutes: true,
          children: true,
        },
      },
    },
  });

  if (!destination) {
    redirect("/admin/destinations");
  }

  if (destination._count.children > 0) {
    redirect("/admin/destinations?blocked=children");
  }

  const linked =
    destination._count.tours +
    destination._count.hotels +
    destination._count.vehicles +
    destination._count.busRoutes;

  if (linked > 0) {
    redirect("/admin/destinations?blocked=listings");
  }

  await prisma.destination.delete({ where: { id: destinationId } });
  await deleteImage({
    key: destination.imageKey,
    driver: destination.imageDriver === "cloudinary" ? "cloudinary" : "local",
  });
  revalidateDestinationPaths(destination.slug);
  redirect("/admin/destinations?deleted=1");
}
