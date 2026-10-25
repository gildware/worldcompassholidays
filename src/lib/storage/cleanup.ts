import { getAssetEnv } from "@/lib/storage/config";
import { deleteCloudinaryPrefix } from "@/lib/storage/cloudinary";
import { deleteImage } from "@/lib/storage";

export type StoredImage = { key: string; driver: string };

export async function deleteStoredImages(images: StoredImage[]) {
  const seen = new Set<string>();
  for (const image of images) {
    if (!image.key || seen.has(image.key)) continue;
    seen.add(image.key);
    await deleteImage({
      key: image.key,
      driver: image.driver === "cloudinary" ? "cloudinary" : "local",
    });
  }
}

/** Deletes the Cloudinary folder for an entity, plus any file keys still stored on it. */
export async function deleteEntityMedia(
  kind: string,
  names: string[],
  images: StoredImage[] = [],
) {
  await deleteStoredImages(images);
  const env = getAssetEnv();
  for (const name of names) {
    const safe = name.trim().replace(/[^a-z0-9_-]/gi, "");
    if (!safe) continue;
    await deleteCloudinaryPrefix(`worldcompass/${kind}/${safe}/`);
    await deleteCloudinaryPrefix(`${env}/${kind}/${safe}/`);
  }
}
