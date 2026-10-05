export type ImageUploadDriver = "local" | "cloudinary";

/** Cloudinary root folder. `dev` is a deployed development environment, separate from a laptop. */
export type AssetEnv = "local" | "dev" | "prod";

export function getImageUploadDriver(): ImageUploadDriver {
  const value = (process.env.IMAGE_UPLOAD_DRIVER ?? "local").toLowerCase();
  if (value === "cloudinary") return "cloudinary";
  return "local";
}

export function getAssetEnv(): AssetEnv {
  const raw = (process.env.APP_ENV ?? "").trim().toLowerCase();
  if (raw === "local") return "local";
  if (raw === "dev" || raw === "development" || raw === "staging") return "dev";
  if (raw === "prod" || raw === "production") return "prod";
  if (process.env.NODE_ENV === "production") return "prod";
  return "local";
}

function credentialsFromUrl(value: string) {
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    return null;
  }
  const cloudName = url.hostname.trim();
  const apiKey = decodeURIComponent(url.username).trim();
  const apiSecret = decodeURIComponent(url.password).trim();
  if (!cloudName || !apiKey || !apiSecret) return null;
  return { cloudName, apiKey, apiSecret };
}

export function getCloudinaryConfig() {
  const fromUrl = process.env.CLOUDINARY_URL?.trim()
    ? credentialsFromUrl(process.env.CLOUDINARY_URL.trim())
    : null;
  const cloudName =
    process.env.CLOUDINARY_CLOUD_NAME?.trim() || fromUrl?.cloudName;
  const apiKey = process.env.CLOUDINARY_API_KEY?.trim() || fromUrl?.apiKey;
  const apiSecret =
    process.env.CLOUDINARY_API_SECRET?.trim() || fromUrl?.apiSecret;
  const folder = getAssetEnv();

  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error(
      "IMAGE_UPLOAD_DRIVER=cloudinary requires CLOUDINARY_URL or CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET.",
    );
  }

  return { cloudName, apiKey, apiSecret, folder };
}
