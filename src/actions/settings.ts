"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requirePermission } from "@/lib/auth/guards";
import { isHexColor, normalizeHex } from "@/lib/brand";
import { prisma } from "@/lib/db";
import { firstIssue, type FormState } from "@/lib/forms";
import { deleteStoredImages, type StoredImage } from "@/lib/storage/cleanup";
import { readUploadedImage, validateUploadedImage } from "@/lib/storage/form";
import { clearTtlCache } from "@/lib/ttl-cache";
import { emailField } from "@/lib/validation";

const phoneField = z
  .string()
  .trim()
  .min(8, "Enter a phone number the desk can answer")
  .max(40, "That number is too long")
  .regex(/^[0-9+\-\s()]+$/, "Use digits, spaces, and + for the country code")
  .refine((value) => value.replace(/\D/g, "").length >= 8, "Enter a complete phone number");

const urlField = z
  .string()
  .trim()
  .max(300, "That link is too long")
  .refine((value) => {
    if (!value) return true;
    try {
      const url = new URL(value);
      return url.protocol === "http:" || url.protocol === "https:";
    } catch {
      return false;
    }
  }, "Use a full http or https URL");

const appearanceSchema = z.object({
  primaryColor: z
    .string()
    .trim()
    .refine(isHexColor, "Choose a six-digit hex colour, for example #3554d1"),
  phone: phoneField,
  whatsapp: phoneField,
  email: emailField,
  address: z.string().trim().max(160, "Keep the address under 160 characters"),
  facebookUrl: urlField,
  instagramUrl: urlField,
  twitterUrl: urlField,
  linkedinUrl: urlField,
  youtubeUrl: urlField,
});

function text(formData: FormData, name: string) {
  const value = formData.get(name);
  return typeof value === "string" ? value : "";
}

export async function saveAppearance(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  await requirePermission("staff.manage");

  const logo = readUploadedImage(formData);
  const logoError = validateUploadedImage(logo, "brand", { required: false });
  if (logoError) return { error: logoError };

  const parsed = appearanceSchema.safeParse({
    primaryColor: text(formData, "primaryColor"),
    phone: text(formData, "phone"),
    whatsapp: text(formData, "whatsapp"),
    email: text(formData, "email"),
    address: text(formData, "address"),
    facebookUrl: text(formData, "facebookUrl"),
    instagramUrl: text(formData, "instagramUrl"),
    twitterUrl: text(formData, "twitterUrl"),
    linkedinUrl: text(formData, "linkedinUrl"),
    youtubeUrl: text(formData, "youtubeUrl"),
  });
  if (!parsed.success) return { error: firstIssue(parsed.error) };

  const existing = await prisma.siteBrand.findUnique({ where: { id: "default" } });
  const previous: StoredImage[] = [];
  if (existing?.logoKey) previous.push({ key: existing.logoKey, driver: existing.logoDriver });

  const primaryColor = normalizeHex(parsed.data.primaryColor);
  const data = {
    logoUrl: logo?.url ?? "",
    logoKey: logo?.key ?? "",
    logoDriver: logo?.driver ?? "local",
    primaryColor,
    phone: parsed.data.phone,
    whatsapp: parsed.data.whatsapp,
    email: parsed.data.email,
    address: parsed.data.address,
    facebookUrl: parsed.data.facebookUrl,
    instagramUrl: parsed.data.instagramUrl,
    twitterUrl: parsed.data.twitterUrl,
    linkedinUrl: parsed.data.linkedinUrl,
    youtubeUrl: parsed.data.youtubeUrl,
  };

  await prisma.siteBrand.upsert({
    where: { id: "default" },
    update: data,
    create: { id: "default", coversJson: existing?.coversJson ?? "[]", ...data },
  });

  if (existing?.logoKey && existing.logoKey !== (logo?.key ?? "")) {
    await deleteStoredImages(previous);
  }

  clearTtlCache();
  revalidatePath("/", "layout");
  revalidatePath("/admin", "layout");
  revalidatePath("/admin/settings");
  revalidatePath("/contact");
  revalidatePath("/about");
  return { error: null, success: "Appearance saved. The public site will use these details now." };
}
