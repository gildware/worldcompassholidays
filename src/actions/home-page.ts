"use server";

import { revalidatePath } from "next/cache";
import { requirePermission } from "@/lib/auth/guards";
import { prisma } from "@/lib/db";
import type { FormState } from "@/lib/forms";
import { parseHomePageContent, type HomePageContent } from "@/lib/home-page";
import { deleteStoredImages, type StoredImage } from "@/lib/storage/cleanup";
import { validateUploadedImage } from "@/lib/storage/form";
import type { UploadedImage } from "@/lib/storage/types";
import { clearTtlCache } from "@/lib/ttl-cache";

function heroImageOk(image: UploadedImage) {
  const folderError = validateUploadedImage(image, "home", { required: false });
  if (!folderError) return true;
  return image.key.includes("/home/") || image.key.startsWith("home/");
}

function serviceUploads(content: HomePageContent) {
  return content.services.groups.flatMap((group) =>
    group.items.flatMap((item) => (item.image ? [item.image] : [])),
  );
}

export async function saveHomePage(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  try {
    await requirePermission("staff.manage");

    const raw = String(formData.get("contentJson") ?? "");
    if (!raw.trim()) return { error: "Nothing to save." };
    const content = parseHomePageContent(raw);

    if (content.hero.image && !heroImageOk(content.hero.image)) {
      return { error: "The hero image is not a valid upload. Try the image again." };
    }
    if (serviceUploads(content).some((image) => !heroImageOk(image))) {
      return { error: "A service photo is not a valid upload. Try that image again." };
    }

    const existing = await prisma.siteHome.findUnique({ where: { id: "default" } });
    const previous = parseHomePageContent(existing?.contentJson);
    const stale: StoredImage[] = [];
    if (previous.hero.image?.key && previous.hero.image.key !== content.hero.image?.key) {
      stale.push({ key: previous.hero.image.key, driver: previous.hero.image.driver });
    }
    const keptServiceKeys = new Set(serviceUploads(content).map((image) => image.key));
    for (const image of serviceUploads(previous)) {
      if (image.key && !keptServiceKeys.has(image.key)) {
        stale.push({ key: image.key, driver: image.driver });
      }
    }

    const payload = JSON.stringify(content);
    await prisma.siteHome.upsert({
      where: { id: "default" },
      update: { contentJson: payload },
      create: { id: "default", contentJson: payload },
    });

    await deleteStoredImages(stale);

    clearTtlCache();
    revalidatePath("/");
    return { error: null, success: "Homepage saved. The public site will show it now." };
  } catch (error) {
    const digest =
      error && typeof error === "object" && "digest" in error
        ? String((error as { digest?: string }).digest)
        : "";
    if (digest.startsWith("NEXT_")) throw error;
    console.error("saveHomePage", error);
    return {
      error:
        error instanceof Error
          ? error.message
          : "Could not save the homepage. Try again.",
    };
  }
}
