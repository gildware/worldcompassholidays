import { mkdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomBytes } from "node:crypto";
import { extensionForMime } from "@/lib/storage/validate";
import type { ImageUploadInput, UploadedImage } from "@/lib/storage/types";

const PUBLIC_ROOT = path.join(process.cwd(), "public");

export async function uploadLocalImage({
  file,
  folder,
}: ImageUploadInput): Promise<UploadedImage> {
  const buffer = Buffer.from(await file.arrayBuffer());
  const ext = extensionForMime(file.type);
  const safeFolder = folder.replace(/[^a-z0-9/_-]/gi, "").replace(/^\/+|\/+$/g, "");
  const filename = `${Date.now()}-${randomBytes(6).toString("hex")}.${ext}`;
  const relativeKey = path.posix.join(safeFolder, filename);
  const absolutePath = path.join(PUBLIC_ROOT, "uploads", relativeKey);

  await mkdir(path.dirname(absolutePath), { recursive: true });
  await writeFile(absolutePath, buffer);

  return {
    url: `/uploads/${relativeKey}`,
    key: relativeKey,
    driver: "local",
  };
}

export async function deleteLocalImage(key: string) {
  if (!key || key.includes("..")) return;
  // Keep committed seed placeholders for re-seeding demos.
  if (key.includes("/seed-") || key.startsWith("seed-")) return;
  const absolutePath = path.join(PUBLIC_ROOT, "uploads", key);
  try {
    await unlink(absolutePath);
  } catch {
    // Missing file is fine — DB is source of truth after delete.
  }
}
