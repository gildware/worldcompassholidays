/**
 * Download exact property photos from each hotel’s official website / WP media library.
 *
 *   npx tsx scripts/fetch-exact-hotel-photos.ts
 *   npx tsx scripts/fetch-exact-hotel-photos.ts --force
 */
import { existsSync } from "node:fs";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { loadEnvConfig } from "@next/env";
import { PrismaClient } from "@prisma/client";
import sharp from "sharp";

loadEnvConfig(process.cwd());

const prisma = new PrismaClient();
const force = process.argv.includes("--force");
const outDir = path.join(process.cwd(), "public", "uploads", "hotels");
const agent =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

type HotelSource = {
  slug: string;
  pages: string[];
  mediaApi?: string;
  curated?: string[];
};

const hotels: HotelSource[] = [
  {
    slug: "golden-leaf-srinagar",
    pages: [
      "https://goldenleafkashmir.com/",
      "https://goldenleafkashmir.com/executive-room/",
      "https://goldenleafkashmir.com/super-deluxe-room/",
      "https://goldenleafkashmir.com/family-room/",
    ],
    mediaApi: "https://goldenleafkashmir.com/wp-json/wp/v2/media?per_page=40&media_type=image",
  },
  {
    slug: "heritage-luxury-srinagar",
    pages: ["https://hotelheritageluxury.com/"],
    mediaApi: "https://hotelheritageluxury.com/wp-json/wp/v2/media?per_page=40&media_type=image",
  },
  {
    slug: "marvilla-srinagar",
    pages: [],
    curated: [
      // Fallback filled later from Google/Maps if empty — leave curated empty to force search pages
    ],
  },
  {
    slug: "asian-park-srinagar",
    pages: ["https://hotelasianpark.com/", "https://hotelasianpark.com/rooms-suites/", "https://hotelasianpark.com/gallery/"],
    mediaApi: "https://hotelasianpark.com/wp-json/wp/v2/media?per_page=40&media_type=image",
  },
  {
    slug: "arison-luxury-srinagar",
    pages: ["https://arisonluxury.com/", "https://arisonluxury.com/gallery.html"],
    // Distinct scenes from MakeMyTrip + ViaKashmir (exterior, lobby, bedroom, suite, corridor).
    curated: [
      "https://r1imghtlak.mmtcdn.com/29478057-2fdc-49f3-8f4e-62cc2a8f01d6.jpeg",
      "https://ik.imagekit.io/viakashmir/viakashmir/hotels/arison-luxury-hyderpora-srinagar-1565654515/arison-luxury-hyderpora-srinagar-1565654515-b11-04.webp",
      "https://ik.imagekit.io/viakashmir/viakashmir/hotels/arison-luxury-hyderpora-srinagar-1565654515/arison-luxury-hyderpora-srinagar-1565654515-b11-03.webp",
      "https://ik.imagekit.io/viakashmir/viakashmir/hotels/arison-luxury-hyderpora-srinagar-1565654515/arison-luxury-hyderpora-srinagar-1565654515-b12-02.webp",
      "https://ik.imagekit.io/viakashmir/viakashmir/hotels/arison-luxury-hyderpora-srinagar-1565654515/arison-luxury-hyderpora-srinagar-1565654515-b12-06.webp",
    ],
  },
  {
    slug: "jhelum-comfort-residency-srinagar",
    pages: ["https://jhelumcomfortinn.com/"],
    mediaApi: "https://jhelumcomfortinn.com/wp-json/wp/v2/media?per_page=40&media_type=image",
  },
  {
    slug: "royal-batoo-srinagar",
    pages: [
      "https://hotelroyalbatoo.com/",
      "https://hotelroyalbatoo.com/gallery.html",
      "https://hotelroyalbatoo.com/rooms.html",
    ],
    curated: [
      "https://hotelroyalbatoo.com/images/exterior/facade-1.webp",
      "https://hotelroyalbatoo.com/images/exterior/facade-2.webp",
      "https://hotelroyalbatoo.com/images/lobby/lobby-reception.webp",
      "https://hotelroyalbatoo.com/images/rooms/super-deluxe/super-deluxe-1.webp",
      "https://hotelroyalbatoo.com/images/rooms/premium/premium-1.webp",
      "https://hotelroyalbatoo.com/images/dining/restaurant-2.webp",
      "https://hotelroyalbatoo.com/images/hotel/guest-lounge.webp",
      "https://hotelroyalbatoo.com/images/rooms/super-deluxe/super-deluxe-2.webp",
    ],
  },
  {
    slug: "milan-srinagar",
    pages: ["https://hotelmilan.in/", "https://hotelmilan.in/rooms/"],
    mediaApi: "https://hotelmilan.in/wp-json/wp/v2/media?per_page=40&media_type=image",
  },
  {
    slug: "apple-tree-resorts-gulmarg",
    pages: [
      "https://appletreeresorts.com/",
      "https://appletreeresorts.com/rooms/",
      "https://appletreeresorts.com/our-facilities/",
    ],
    mediaApi: "https://appletreeresorts.com/wp-json/wp/v2/media?per_page=40&media_type=image",
  },
  {
    slug: "pandit-resort-gulmarg",
    pages: [],
  },
  {
    slug: "mama-palace-gulmarg",
    pages: ["http://hotelmamapalace.com/"],
  },
  {
    slug: "zahgeer-continental-gulmarg",
    pages: ["https://hotelzahgeergulmarg.com/"],
    // Exterior + dining + lounge + room (avoid near-identical bedroom crops).
    curated: [
      "https://r1imghtlak.mmtcdn.com/9936e5508dd111ee9b320a58a9feac02.jpg",
      "https://hotelzahgeergulmarg.com/Zahger/7.png",
      "https://hotelzahgeergulmarg.com/Zahger/25.png",
      "https://hotelzahgeergulmarg.com/Zahger/11.png",
      "https://r1imghtlak.mmtcdn.com/c080a01e8dd211eebab80a58a9feac02.jpg",
    ],
  },
  {
    slug: "gulmarg-palace-tangmarg",
    pages: [],
  },
  {
    slug: "signature-gulmarg",
    pages: ["http://www.hotelsignaturekashmir.com/"],
  },
  {
    slug: "white-villa-pahalgam",
    pages: ["https://whitevillaresort.com/"],
    mediaApi: "https://whitevillaresort.com/wp-json/wp/v2/media?per_page=40&media_type=image",
  },
  {
    slug: "green-heights-pahalgam",
    pages: ["https://hotelgreenheights.com/", "https://hotelgreenheights.com/rooms-and-suites/"],
    mediaApi: "https://hotelgreenheights.com/wp-json/wp/v2/media?per_page=40&media_type=image",
  },
  {
    slug: "pahalgam-shore",
    pages: ["https://thepahalgamshore.com/"],
    mediaApi: "https://thepahalgamshore.com/wp-json/wp/v2/media?per_page=40&media_type=image",
  },
  {
    slug: "riverside-resort-pahalgam",
    // Official domain currently redirects to unrelated Just A Hotels assets —
    // prefer Justdial catalogue photos of Riverside Resorts Inn, Movera.
    pages: [],
    curated: [
      "https://content.jdmagicbox.com/v2/comp/pahalgam/h4/9999p1932.1932.240209222417.a3h4/catalogue/riverside-resorts-inn-pahalgam-pahalgam-hotels-x1wsnzoxlv.jpg",
      "https://content.jdmagicbox.com/v2/comp/pahalgam/h4/9999p1932.1932.240209222417.a3h4/catalogue/riverside-resorts-inn-pahalgam-pahalgam-hotels-o275q1j14n.jpg",
      "https://content.jdmagicbox.com/v2/comp/pahalgam/h4/9999p1932.1932.240209222417.a3h4/catalogue/riverside-resorts-inn-pahalgam-pahalgam-hotels-frlyt6bdeo.jpg",
      "https://content.jdmagicbox.com/v2/comp/pahalgam/h4/9999p1932.1932.240209222417.a3h4/catalogue/riverside-resorts-inn-pahalgam-pahalgam-hotels-w2wylwowde.jpg",
      "https://content.jdmagicbox.com/v2/comp/pahalgam/h4/9999p1932.1932.240209222417.a3h4/catalogue/riverside-resorts-inn-pahalgam-pahalgam-hotels-eklrx34mx9.jpg",
    ],
  },
  {
    slug: "hayat-residency-pahalgam",
    pages: ["https://hotelhayatresidency.com/", "https://hayatresidency.in/"],
    mediaApi: "https://hotelhayatresidency.com/wp-json/wp/v2/media?per_page=40&media_type=image",
  },
  {
    slug: "pahalgam-retreat",
    pages: ["https://pahalgamretreat.com/"],
    mediaApi: "https://pahalgamretreat.com/wp-json/wp/v2/media?per_page=40&media_type=image",
  },
  {
    slug: "white-water-resort-pahalgam",
    pages: ["https://whitewaterresorts.com/"],
  },
];

function rejectUrl(url: string) {
  const u = url.toLowerCase();
  return (
    /logo|icon|favicon|avatar|sprite|emoji|marker|gravatar|badge|award|g20|screenshot|removebg|cropped-|whatsapp.?image.?button|contact\.jpg|download\.png|mandala|generator|intercom|bathroom\.png|beds\.png|cable-tv|hiking|wifi|smoke|housekeeping|parking\.png|room-service|free-wifi|verified-customer|highend-360-awards|managing-director|theme\/|twentytwenty|404-image/.test(
      u,
    ) ||
    /-\d{2,4}x\d{2,4}\./.test(u) ||
    /fit=\d+%2c\d+/i.test(u) ||
    /resize=\d+/i.test(u)
  );
}

function normalizeUrl(raw: string, base: string) {
  let url = raw.trim().replace(/\\u002F/g, "/").replace(/\\\//g, "/");
  if (url.startsWith("//")) url = `https:${url}`;
  if (url.startsWith("/")) {
    try {
      url = new URL(url, base).href;
    } catch {
      return null;
    }
  }
  if (!/^https?:\/\//i.test(url)) return null;
  // Prefer full-size WP originals
  url = url.replace(/-\d{2,4}x\d{2,4}(?=\.(jpe?g|png|webp))/i, "");
  url = url.replace(/\?.*$/, "");
  if (rejectUrl(url)) return null;
  if (!/\.(jpe?g|png|webp)$/i.test(url)) return null;
  return url;
}

function extractFromHtml(html: string, pageUrl: string) {
  const found = new Set<string>();
  const re =
    /(?:https?:)?\/\/[^"'\\\s<>]+\.(?:jpe?g|png|webp)|(?:src|data-src|data-lazy-src|href)=["']([^"']+\.(?:jpe?g|png|webp))/gi;
  let match: RegExpExecArray | null;
  while ((match = re.exec(html))) {
    const candidate = match[1] || match[0];
    const normalized = normalizeUrl(candidate, pageUrl);
    if (normalized) found.add(normalized);
  }
  return [...found];
}

async function fetchText(url: string) {
  const response = await fetch(url, {
    headers: { "User-Agent": agent, Accept: "text/html,application/json,*/*" },
    redirect: "follow",
  });
  if (!response.ok) return "";
  return response.text();
}

async function collectFromMediaApi(apiUrl: string) {
  const urls: string[] = [];
  for (let page = 1; page <= 3; page += 1) {
    const sep = apiUrl.includes("?") ? "&" : "?";
    const text = await fetchText(`${apiUrl}${sep}page=${page}`);
    if (!text || text.startsWith("<!")) break;
    try {
      const items = JSON.parse(text) as Array<{ source_url?: string }>;
      if (!Array.isArray(items) || items.length === 0) break;
      for (const item of items) {
        if (!item.source_url) continue;
        const normalized = normalizeUrl(item.source_url, apiUrl);
        if (normalized) urls.push(normalized);
      }
    } catch {
      break;
    }
  }
  return urls;
}

async function collectUrls(hotel: HotelSource) {
  const urls: string[] = [...(hotel.curated || [])];
  if (hotel.mediaApi) {
    urls.push(...(await collectFromMediaApi(hotel.mediaApi)));
  }
  for (const page of hotel.pages) {
    try {
      const html = await fetchText(page);
      if (html.length > 200) urls.push(...extractFromHtml(html, page));
    } catch {
      /* ignore */
    }
  }
  // Deduplicate preferring non-resized
  const seen = new Set<string>();
  const unique: string[] = [];
  for (const url of urls) {
    const key = url.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    unique.push(url);
  }
  return unique;
}

async function downloadAsJpeg(url: string, dest: string) {
  const response = await fetch(url, {
    headers: { "User-Agent": agent, Accept: "image/*,*/*", Referer: new URL(url).origin },
  });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const bytes = Buffer.from(await response.arrayBuffer());
  if (bytes.length < 8000) throw new Error("too small");
  await sharp(bytes).rotate().jpeg({ quality: 85, mozjpeg: true }).resize({ width: 1600, withoutEnlargement: true }).toFile(dest);
}

async function updateDb(slug: string) {
  const coverRel = `hotels/${slug}-cover.jpg`;
  const coverFile = path.join(process.cwd(), "public", "uploads", coverRel);
  if (!existsSync(coverFile)) return;
  const gallery = ["g1", "g2", "g3", "g4"]
    .map((suffix) => {
      const rel = `hotels/${slug}-${suffix}.jpg`;
      if (!existsSync(path.join(process.cwd(), "public", "uploads", rel))) return null;
      return { url: `/uploads/${rel}`, key: rel, driver: "local" as const };
    })
    .filter((item): item is { url: string; key: string; driver: "local" } => Boolean(item));
  const imageUrl = `/uploads/${coverRel}`;
  await prisma.hotel.updateMany({
    where: { slug },
    data: {
      imageUrl,
      imageKey: coverRel,
      imageDriver: "local",
      featuredImageUrl: imageUrl,
      featuredImageKey: coverRel,
      featuredImageDriver: "local",
      galleryJson: JSON.stringify(gallery),
    },
  });
}

async function main() {
  await mkdir(outDir, { recursive: true });
  const gaps: string[] = [];

  for (const hotel of hotels) {
    console.log(`\n=== ${hotel.slug}`);
    try {
      const urls = await collectUrls(hotel);
      console.log(`  candidates: ${urls.length}`);
      if (urls.length === 0) {
        gaps.push(hotel.slug);
        console.log("  GAP — no official images found");
        continue;
      }

      const suffixes = ["cover", "g1", "g2", "g3", "g4"] as const;
      let saved = 0;
      for (const url of urls) {
        if (saved >= suffixes.length) break;
        const dest = path.join(outDir, `${hotel.slug}-${suffixes[saved]}.jpg`);
        if (existsSync(dest) && !force) {
          console.log(`  skip ${suffixes[saved]}`);
          saved += 1;
          continue;
        }
        try {
          await downloadAsJpeg(url, dest);
          console.log(`  ok ${suffixes[saved]} ← ${url}`);
          saved += 1;
        } catch (error) {
          console.log(`  fail ${url} (${error instanceof Error ? error.message : error})`);
        }
      }
      if (saved < 5) gaps.push(`${hotel.slug}(${saved}/5)`);
      await updateDb(hotel.slug);
    } catch (error) {
      gaps.push(hotel.slug);
      console.log(`  ERROR ${error instanceof Error ? error.stack || error.message : error}`);
    }
  }

  console.log("\nGaps needing manual/browser fill:");
  console.log(gaps.join("\n") || "(none)");
}

main()
  .catch((error: unknown) => {
    console.error(error instanceof Error ? error.message : "Exact hotel photo fetch failed.");
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
