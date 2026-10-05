import { getImageUploadDriver } from "@/lib/storage/config";
import {
  deleteCloudinaryImage,
  uploadCloudinaryImage,
} from "@/lib/storage/cloudinary";
import { deleteLocalImage, uploadLocalImage } from "@/lib/storage/local";
import { validateImageFile } from "@/lib/storage/validate";
import type { ImageUploadInput, UploadedImage } from "@/lib/storage/types";

export type { UploadedImage } from "@/lib/storage/types";
export { getImageUploadDriver } from "@/lib/storage/config";
export { validateImageFile } from "@/lib/storage/validate";

export async function uploadImage(
  input: ImageUploadInput,
): Promise<UploadedImage> {
  const error = validateImageFile(input.file);
  if (error) throw new Error(error);

  const driver = getImageUploadDriver();
  if (driver === "cloudinary") return uploadCloudinaryImage(input);
  return uploadLocalImage(input);
}

export async function deleteImage(options: {
  key: string;
  driver: "local" | "cloudinary";
}) {
  if (!options.key) return;
  if (options.driver === "cloudinary") {
    await deleteCloudinaryImage(options.key);
    return;
  }
  await deleteLocalImage(options.key);
}
