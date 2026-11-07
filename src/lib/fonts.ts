import localFont from "next/font/local";

/** Self-hosted so Docker / offline builds do not call fonts.googleapis.com. */

export const figtree = localFont({
  src: [
    { path: "../app/fonts/figtree-latin-400-normal.woff2", weight: "400", style: "normal" },
    { path: "../app/fonts/figtree-latin-500-normal.woff2", weight: "500", style: "normal" },
    { path: "../app/fonts/figtree-latin-600-normal.woff2", weight: "600", style: "normal" },
    { path: "../app/fonts/figtree-latin-700-normal.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-figtree",
  display: "swap",
});

export const ibmPlexSans = localFont({
  src: [
    { path: "../app/fonts/ibm-plex-sans-latin-400-normal.woff2", weight: "400", style: "normal" },
    { path: "../app/fonts/ibm-plex-sans-latin-500-normal.woff2", weight: "500", style: "normal" },
    { path: "../app/fonts/ibm-plex-sans-latin-600-normal.woff2", weight: "600", style: "normal" },
    { path: "../app/fonts/ibm-plex-sans-latin-700-normal.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-ad-sans",
  display: "swap",
});

export const ibmPlexMono = localFont({
  src: [
    { path: "../app/fonts/ibm-plex-mono-latin-400-normal.woff2", weight: "400", style: "normal" },
    { path: "../app/fonts/ibm-plex-mono-latin-500-normal.woff2", weight: "500", style: "normal" },
  ],
  variable: "--font-ad-mono",
  display: "swap",
});

export const outfit = localFont({
  src: [
    { path: "../app/fonts/outfit-latin-400-normal.woff2", weight: "400", style: "normal" },
    { path: "../app/fonts/outfit-latin-500-normal.woff2", weight: "500", style: "normal" },
    { path: "../app/fonts/outfit-latin-600-normal.woff2", weight: "600", style: "normal" },
    { path: "../app/fonts/outfit-latin-700-normal.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-bd-sans",
  display: "swap",
});

export const fraunces = localFont({
  src: [
    { path: "../app/fonts/fraunces-latin-500-normal.woff2", weight: "500", style: "normal" },
    { path: "../app/fonts/fraunces-latin-600-normal.woff2", weight: "600", style: "normal" },
    { path: "../app/fonts/fraunces-latin-700-normal.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-bd-display",
  display: "swap",
});
