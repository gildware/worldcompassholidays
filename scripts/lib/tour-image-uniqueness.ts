/**
 * Cross-tour image uniqueness.
 * Every tour must use different source photos — never reuse another tour’s
 * Commons title or identical raw/local bytes.
 */
import { createHash } from "node:crypto";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";

export type TourImageBlocklist = {
  /** SHA-1 of raw download / local source bytes */
  hashes: Set<string>;
  /** Wikimedia Commons File:… titles already claimed */
  titles: Set<string>;
};

function normalizeTitle(title: string) {
  return title.trim().replace(/^File:/i, "File:");
}

/** Load hashes + Commons titles from every other tour’s media + attribution. */
export function loadOtherTourImageBlocklist(
  toursDir: string,
  currentSlug: string,
): TourImageBlocklist {
  const hashes = new Set<string>();
  const titles = new Set<string>();
  if (!existsSync(toursDir)) return { hashes, titles };

  for (const name of readdirSync(toursDir)) {
    if (name.startsWith(`${currentSlug}-`)) continue;

    if (name.endsWith(".jpg") || name.endsWith(".jpeg") || name.endsWith(".webp")) {
      try {
        const buf = readFileSync(path.join(toursDir, name));
        hashes.add(createHash("sha1").update(buf).digest("hex"));
      } catch {
        /* skip unreadable */
      }
      continue;
    }

    if (!name.endsWith("-ATTRIBUTION.txt") && name !== "ATTRIBUTION.txt") continue;
    try {
      const text = readFileSync(path.join(toursDir, name), "utf8");
      for (const line of text.split("\n")) {
        // Commons titles often include spaces and (parens) before the extension
        const fileMatch = line.match(/File:.+?\.(?:jpe?g|png|JPG|PNG|webp)/);
        if (fileMatch) titles.add(normalizeTitle(fileMatch[0]));
        const localMatch = line.match(/local:([^\s]+)/);
        if (localMatch) {
          // local paths are relative to public/uploads — hash those files too when present
          const uploadsRoot = path.dirname(toursDir);
          const localPath = path.join(uploadsRoot, localMatch[1]);
          if (existsSync(localPath)) {
            hashes.add(createHash("sha1").update(readFileSync(localPath)).digest("hex"));
          }
        }
      }
    } catch {
      /* skip */
    }
  }

  return { hashes, titles };
}

export function hashBuffer(buf: Buffer) {
  return createHash("sha1").update(buf).digest("hex");
}

export function isTitleBlocked(title: string, block: TourImageBlocklist) {
  return block.titles.has(normalizeTitle(title));
}

export function claimSource(
  block: TourImageBlocklist,
  opts: { hash: string; title?: string },
) {
  if (block.hashes.has(opts.hash)) return false;
  if (opts.title && isTitleBlocked(opts.title, block)) return false;
  block.hashes.add(opts.hash);
  if (opts.title) block.titles.add(normalizeTitle(opts.title));
  return true;
}
