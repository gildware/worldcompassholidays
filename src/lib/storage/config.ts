export type ImageUploadDriver = "local" | "cloudinary";

export function getImageUploadDriver(): ImageUploadDriver {
  const value = (process.env.IMAGE_UPLOAD_DRIVER ?? "local").toLowerCase();
  if (value === "cloudinary") return "cloudinary";
  return "local";
}

export function getCloudinaryConfig() {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME?.trim();
  const apiKey = process.env.CLOUDINARY_API_KEY?.trim();
  const apiSecret = process.env.CLOUDINARY_API_SECRET?.trim();
  const folder = process.env.CLOUDINARY_FOLDER?.trim() || "travel";

  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error(
      "IMAGE_UPLOAD_DRIVER=cloudinary requires CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET.",
    );
  }

  return { cloudName, apiKey, apiSecret, folder };
}
