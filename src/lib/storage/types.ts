export type UploadedImage = {
  /** Public URL or path used in <img src> / next/image */
  url: string;
  /** Provider-specific key used for deletion (local relative path or Cloudinary public_id) */
  key: string;
  driver: "local" | "cloudinary";
};

export type ImageUploadInput = {
  file: File;
  folder: string;
};
