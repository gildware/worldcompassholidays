"use server";

import { revalidatePath } from "next/cache";
import { requirePermission } from "@/lib/auth/guards";
import { prisma } from "@/lib/db";
import type { FormState } from "@/lib/forms";
import { deleteStoredImages, type StoredImage } from "@/lib/storage/cleanup";
import { readUploadedImage, validateUploadedImage } from "@/lib/storage/form";
import { parseJsonArray, type GalleryItem } from "@/lib/tours/json";

function remember(list: StoredImage[], key: string, driver: string) {
  if (!key) return;
  list.push({ key, driver });
}

export async function saveBrand(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  await requirePermission("staff.manage");

  const logo = readUploadedImage(formData);
  const logoError = validateUploadedImage(logo, "brand", { required: false });
  if (logoError) return { error: logoError };

  const covers = parseJsonArray<GalleryItem>(String(formData.get("coversJson") ?? "[]"));
  if (covers.length > 8) return { error: "Keep the homepage to 8 cover photos." };
  for (const cover of covers) {
    const error = validateUploadedImage(cover, "brand", { required: true });
    if (error) return { error: "One of the cover photos is not a valid upload." };
  }

  const existing = await prisma.siteBrand.findUnique({ where: { id: "default" } });
  const previous: StoredImage[] = [];
  if (existing?.logoKey) remember(previous, existing.logoKey, existing.logoDriver);
  if (existing?.coversJson) {
    for (const cover of parseJsonArray<GalleryItem>(existing.coversJson)) {
      remember(previous, cover.key, cover.driver);
    }
  }

  const nextKeys = new Set<string>();
  if (logo?.key) nextKeys.add(logo.key);
  for (const cover of covers) nextKeys.add(cover.key);

  await prisma.siteBrand.upsert({
    where: { id: "default" },
    update: {
      logoUrl: logo?.url ?? "",
      logoKey: logo?.key ?? "",
      logoDriver: logo?.driver ?? "local",
      coversJson: JSON.stringify(covers),
    },
    create: {
      id: "default",
      logoUrl: logo?.url ?? "",
      logoKey: logo?.key ?? "",
      logoDriver: logo?.driver ?? "local",
      coversJson: JSON.stringify(covers),
    },
  });

  await deleteStoredImages(previous.filter((image) => !nextKeys.has(image.key)));

  revalidatePath("/");
  revalidatePath("/admin", "layout");
  revalidatePath("/admin/brand");
  return { error: null, success: "Brand images saved." };
}
