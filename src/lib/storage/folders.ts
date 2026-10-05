export const IMAGE_FOLDERS = [
  "destinations",
  "tours",
  "hotels",
  "vehicles",
  "buses",
] as const;

export type ImageFolder = (typeof IMAGE_FOLDERS)[number];

export function isImageFolder(value: string): value is ImageFolder {
  return (IMAGE_FOLDERS as readonly string[]).includes(value);
}
