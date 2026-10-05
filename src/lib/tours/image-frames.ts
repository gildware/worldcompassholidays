/** How tour photos are cropped on the site, and the file size to upload. */
export type ImageFrame = {
  /** Width divided by height. */
  aspect: number;
  outputWidth: number;
  outputHeight: number;
  label: string;
};

export const tourImageFrames = {
  /** Full-width hero at the top of a page. Destination heroes use this same 21:9 frame. */
  banner: {
    aspect: 21 / 9,
    outputWidth: 1920,
    outputHeight: 823,
    label: "21:9",
  },
  /** Tour cards on the tours list and destination pages (`aspect-[16/10]`). */
  cover: {
    aspect: 16 / 10,
    outputWidth: 1600,
    outputHeight: 1000,
    label: "16:10",
  },
  /** Gallery tiles in a 4:3 grid. */
  gallery: {
    aspect: 4 / 3,
    outputWidth: 1200,
    outputHeight: 900,
    label: "4:3",
  },
} as const satisfies Record<string, ImageFrame>;
