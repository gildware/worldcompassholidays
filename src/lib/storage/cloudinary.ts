import { v2 as cloudinary } from "cloudinary";
import { getCloudinaryConfig } from "@/lib/storage/config";
import type { ImageUploadInput, UploadedImage } from "@/lib/storage/types";

function configure() {
  const config = getCloudinaryConfig();
  cloudinary.config({
    cloud_name: config.cloudName,
    api_key: config.apiKey,
    api_secret: config.apiSecret,
    secure: true,
  });
  return config;
}

export async function uploadCloudinaryImage({
  file,
  folder,
}: ImageUploadInput): Promise<UploadedImage> {
  const config = configure();
  const buffer = Buffer.from(await file.arrayBuffer());
  const safeFolder = folder.replace(/[^a-z0-9/_-]/gi, "").replace(/^\/+|\/+$/g, "");
  const targetFolder = pathJoin(config.folder, safeFolder);

  const result = await new Promise<{
    secure_url: string;
    public_id: string;
  }>((resolve, reject) => {
    let settled = false;
    const fail = (error: unknown) => {
      if (settled) return;
      settled = true;
      reject(error instanceof Error ? error : new Error("Cloudinary upload failed."));
    };
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: targetFolder,
        resource_type: "image",
      },
      (error, uploaded) => {
        if (error || !uploaded) {
          fail(error ?? new Error("Cloudinary upload failed."));
          return;
        }
        if (settled) return;
        settled = true;
        resolve({
          secure_url: uploaded.secure_url,
          public_id: uploaded.public_id,
        });
      },
    );
    stream.on("error", fail);
    stream.end(buffer);
  });

  return {
    url: result.secure_url,
    key: result.public_id,
    driver: "cloudinary",
  };
}

export async function deleteCloudinaryImage(publicId: string) {
  if (!publicId) return;
  configure();
  try {
    await cloudinary.uploader.destroy(publicId, { resource_type: "image" });
  } catch {
    // Ignore remote delete failures so record deletion can continue.
  }
}

function pathJoin(...parts: string[]) {
  return parts
    .map((part) => part.replace(/^\/+|\/+$/g, ""))
    .filter(Boolean)
    .join("/");
}
