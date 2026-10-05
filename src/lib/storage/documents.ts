import { randomBytes } from "node:crypto";
import { mkdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { v2 as cloudinary } from "cloudinary";
import { getCloudinaryConfig, getImageUploadDriver } from "@/lib/storage/config";

const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp", "application/pdf"]);
const MAX_BYTES = 5 * 1024 * 1024;

export type StoredFile = {
  url: string;
  key: string;
  driver: "local" | "cloudinary";
  resourceType: "image" | "raw";
};

export function validateDocumentFile(file: File | null | undefined) {
  if (!file || file.size === 0) return "Choose a file.";
  if (!ALLOWED.has(file.type)) return "Use a JPG, PNG, WebP, or PDF file.";
  if (file.size > MAX_BYTES) return "File must be 5 MB or smaller.";
  return null;
}

function extensionFor(type: string) {
  if (type === "image/jpeg") return "jpg";
  if (type === "image/png") return "png";
  if (type === "image/webp") return "webp";
  if (type === "application/pdf") return "pdf";
  return "bin";
}

export async function uploadDocument(input: {
  file: File;
  folder: string;
}): Promise<StoredFile> {
  const error = validateDocumentFile(input.file);
  if (error) throw new Error(error);
  const resourceType = input.file.type === "application/pdf" ? "raw" : "image";
  const driver = getImageUploadDriver();
  if (driver === "cloudinary") {
    return uploadCloudinaryDocument(input.file, input.folder, resourceType);
  }
  return uploadLocalDocument(input.file, input.folder, resourceType);
}

export async function deleteDocument(file: {
  key: string;
  driver: string;
  resourceType: string;
}) {
  if (!file.key) return;
  if (file.driver === "cloudinary") {
    const config = getCloudinaryConfig();
    cloudinary.config({
      cloud_name: config.cloudName,
      api_key: config.apiKey,
      api_secret: config.apiSecret,
      secure: true,
    });
    try {
      await cloudinary.uploader.destroy(file.key, {
        resource_type: file.resourceType === "raw" ? "raw" : "image",
      });
    } catch {
      // Record deletion should continue if the remote file is already gone.
    }
    return;
  }
  if (file.key.includes("..")) return;
  try {
    await unlink(path.join(process.cwd(), "public", "uploads", file.key));
  } catch {
    // Missing file is fine.
  }
}

async function uploadLocalDocument(
  file: File,
  folder: string,
  resourceType: "image" | "raw",
): Promise<StoredFile> {
  const safeFolder = folder.replace(/[^a-z0-9/_-]/gi, "").replace(/^\/+|\/+$/g, "");
  const filename = `${Date.now()}-${randomBytes(6).toString("hex")}.${extensionFor(file.type)}`;
  const relativeKey = path.posix.join(safeFolder, filename);
  const absolutePath = path.join(process.cwd(), "public", "uploads", relativeKey);
  await mkdir(path.dirname(absolutePath), { recursive: true });
  await writeFile(absolutePath, Buffer.from(await file.arrayBuffer()));
  return {
    url: `/uploads/${relativeKey}`,
    key: relativeKey,
    driver: "local",
    resourceType,
  };
}

async function uploadCloudinaryDocument(
  file: File,
  folder: string,
  resourceType: "image" | "raw",
): Promise<StoredFile> {
  const config = getCloudinaryConfig();
  cloudinary.config({
    cloud_name: config.cloudName,
    api_key: config.apiKey,
    api_secret: config.apiSecret,
    secure: true,
  });
  const safeFolder = folder.replace(/[^a-z0-9/_-]/gi, "").replace(/^\/+|\/+$/g, "");
  const targetFolder = [config.folder, safeFolder].filter(Boolean).join("/");
  const buffer = Buffer.from(await file.arrayBuffer());
  const result = await new Promise<{ secure_url: string; public_id: string }>(
    (resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: targetFolder, resource_type: resourceType },
        (error, uploaded) => {
          if (error || !uploaded) {
            reject(error ?? new Error("Upload failed."));
            return;
          }
          resolve({
            secure_url: uploaded.secure_url,
            public_id: uploaded.public_id,
          });
        },
      );
      stream.end(buffer);
    },
  );
  return {
    url: result.secure_url,
    key: result.public_id,
    driver: "cloudinary",
    resourceType,
  };
}
