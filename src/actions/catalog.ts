"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import {
  catalogKindHasAnswer,
  catalogKindLabel,
  isCatalogKind,
  mapStoredSelection,
  selectionKeys,
  type CatalogKind,
} from "@/lib/catalog";
import { prisma } from "@/lib/db";
import { firstIssue, type FormState } from "@/lib/forms";
import { requirePermission } from "@/lib/auth/guards";
import { deleteImage } from "@/lib/storage";
import { readUploadedImage, validateUploadedImage } from "@/lib/storage/form";
import { parseJsonArray } from "@/lib/tours/json";

const itemSchema = z.object({
  title: z.string().trim().min(2, "Enter a title.").max(80),
  content: z.string().trim().max(2000),
});

function revalidateCatalog() {
  revalidatePath("/admin/configuration");
  revalidatePath("/admin/tours");
  revalidatePath("/admin/tours/new");
}

export async function saveCatalogItem(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  await requirePermission("tours.manage");

  const kindValue = String(formData.get("kind") ?? "");
  if (!isCatalogKind(kindValue)) return { error: "Choose a configuration type." };

  const parsed = itemSchema.safeParse({
    title: formData.get("title"),
    content: formData.get("content") ?? "",
  });
  if (!parsed.success) return { error: firstIssue(parsed.error) };
  if (catalogKindHasAnswer(kindValue) && parsed.data.content.length < 2) {
    return { error: "Enter an answer." };
  }

  const icon = readUploadedImage(formData);
  const iconError = validateUploadedImage(icon, "catalog", { required: false });
  if (iconError) return { error: iconError };

  const id = String(formData.get("id") ?? "").trim();
  const title = parsed.data.title;
  const content = catalogKindHasAnswer(kindValue) ? parsed.data.content : "";
  const siblings = await prisma.catalogItem.findMany({
    where: { kind: kindValue },
    select: { id: true, title: true },
  });
  const duplicate = siblings.find(
    (row) => row.id !== id && row.title.toLowerCase() === title.toLowerCase(),
  );
  if (duplicate) {
    return { error: `A ${catalogKindLabel(kindValue).toLowerCase()} with this title already exists.` };
  }

  if (id) {
    const existing = await prisma.catalogItem.findFirst({
      where: { id, kind: kindValue },
    });
    if (!existing) return { error: "That item was not found." };

    await prisma.catalogItem.update({
      where: { id },
      data: {
        title,
        content,
        iconUrl: icon?.url ?? "",
        iconKey: icon?.key ?? "",
        iconDriver: icon?.driver ?? "local",
      },
    });

    if (existing.iconKey && existing.iconKey !== icon?.key) {
      await deleteImage({
        key: existing.iconKey,
        driver: existing.iconDriver === "cloudinary" ? "cloudinary" : "local",
      });
    }

    await bindTours(kindValue, id, existing.title, title);
  } else {
    const count = await prisma.catalogItem.count({ where: { kind: kindValue } });
    await prisma.catalogItem.create({
      data: {
        kind: kindValue,
        title,
        content,
        sortOrder: count,
        iconUrl: icon?.url ?? "",
        iconKey: icon?.key ?? "",
        iconDriver: icon?.driver ?? "local",
      },
    });
  }

  revalidateCatalog();
  return { error: null, success: "Saved" };
}

export async function deleteCatalogItem(id: string): Promise<FormState> {
  await requirePermission("tours.manage");
  const item = await prisma.catalogItem.findUnique({ where: { id } });
  if (!item || !isCatalogKind(item.kind)) return { error: "That item was not found." };

  const used = await toursUsing(item.kind, item.id, item.title);
  if (used > 0) {
    const noun = catalogKindLabel(item.kind).toLowerCase();
    return {
      error: `This ${noun} is used by ${used} tour${used === 1 ? "" : "s"}. Remove it from those tours first.`,
    };
  }

  await prisma.catalogItem.delete({ where: { id } });
  if (item.iconKey) {
    await deleteImage({
      key: item.iconKey,
      driver: item.iconDriver === "cloudinary" ? "cloudinary" : "local",
    });
  }

  revalidateCatalog();
  return { error: null, success: "Deleted" };
}

async function bindTours(
  kind: CatalogKind,
  id: string,
  previousTitle: string,
  nextTitle: string,
) {
  if (kind === "category") {
    await prisma.tour.updateMany({
      where: {
        OR: [{ categoryId: id }, { category: previousTitle }],
      },
      data: { categoryId: id, category: nextTitle },
    });
    return;
  }

  const field = listField(kind);
  if (!field) return;
  const tours = await prisma.tour.findMany({
    select: {
      id: true,
      travelStylesJson: true,
      facilitiesJson: true,
      faqsJson: true,
      includesJson: true,
      excludesJson: true,
    },
  });

  for (const tour of tours) {
    const parsed = parseJsonArray<unknown>(tour[field]);
    const current = selectionKeys(parsed);
    if (!current.some((value) => value === previousTitle || value === id)) continue;
    const next = mapStoredSelection(parsed, (value) =>
      value === previousTitle || value === id ? id : value,
    );
    await prisma.tour.update({
      where: { id: tour.id },
      data: { [field]: JSON.stringify(next) },
    });
  }
}

async function toursUsing(kind: CatalogKind, id: string, title: string) {
  if (kind === "category") {
    return prisma.tour.count({
      where: { OR: [{ categoryId: id }, { category: title }] },
    });
  }

  const field = listField(kind);
  if (!field) return 0;
  const tours = await prisma.tour.findMany({
    select: {
      travelStylesJson: true,
      facilitiesJson: true,
      faqsJson: true,
      includesJson: true,
      excludesJson: true,
    },
  });
  return tours.filter((tour) => {
    const values = selectionKeys(parseJsonArray<unknown>(tour[field]));
    return values.includes(id) || values.includes(title);
  }).length;
}

function listField(kind: CatalogKind) {
  if (kind === "style") return "travelStylesJson" as const;
  if (kind === "facility") return "facilitiesJson" as const;
  if (kind === "faq") return "faqsJson" as const;
  if (kind === "include") return "includesJson" as const;
  if (kind === "exclude") return "excludesJson" as const;
  return null;
}
