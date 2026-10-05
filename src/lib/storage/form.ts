import type { ImageFolder } from "@/lib/storage/folders";
import type { UploadedImage } from "@/lib/storage/types";

export function readUploadedImage(formData: FormData): UploadedImage | null {
  const url = String(formData.get("imageUrl") ?? "").trim();
  const key = String(formData.get("imageKey") ?? "").trim();
  const driver = String(formData.get("imageDriver") ?? "").trim();

  if (!url || !key) return null;
  if (driver !== "local" && driver !== "cloudinary") return null;
  return { url, key, driver };
}

/** Reject forged paths that were not produced by our upload helpers. */
export function validateUploadedImage(
  image: UploadedImage | null | undefined,
  folder: ImageFolder,
  { required }: { required: boolean },
): string | null {
  if (!image) return required ? "Upload an image." : null;

  if (image.key.includes("..") || image.key.startsWith("/")) {
    return "Invalid image reference.";
  }

  const segments = image.key.split("/").filter(Boolean);
  const contentFolder =
    segments[0] === "local" || segments[0] === "dev" || segments[0] === "prod"
      ? segments[1]
      : segments[0];
  if (contentFolder !== folder) {
    return "Invalid image reference.";
  }

  if (image.driver === "local") {
    if (image.url !== `/uploads/${image.key}`) {
      return "Invalid image reference.";
    }
    return null;
  }

  if (!image.url.startsWith("https://res.cloudinary.com/")) {
    return "Invalid image reference.";
  }

  return null;
}
