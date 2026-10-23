// @ts-check
import { spawnSync } from "node:child_process";
import { serwist } from "@serwist/next/config";

const gitRevision = spawnSync("git", ["rev-parse", "HEAD"], {
  encoding: "utf-8",
}).stdout?.trim();
const revision = gitRevision || crypto.randomUUID();

const base = await serwist({
  swSrc: "src/app/sw.ts",
  swDest: "public/sw.js",
  // Live tour/hotel/car pages are force-dynamic — do not precache HTML shells as fresh.
  precachePrerendered: false,
  additionalPrecacheEntries: [
    { url: "/~offline", revision },
    { url: "/icons/icon-192.png", revision },
    { url: "/icons/icon-512.png", revision },
    { url: "/icons/apple-touch-icon.png", revision },
  ],
});

/** Light offline shell: Next static chunks + brand icons/fonts only (not uploads/catalog images). */
export default {
  ...base,
  maximumFileSizeToCacheInBytes: 2 * 1024 * 1024,
  globPatterns: [
    ".next/static/**/*.{js,css,woff,woff2}",
    "public/icons/**/*.{png,svg,webp}",
    "public/fonts/**/*.{woff,woff2,ttf,eot}",
  ],
  globIgnores: [
    ...(base.globIgnores ?? []),
    "public/uploads/**",
    "public/img/**",
    "**/node_modules/**",
  ],
};
