import { appendFileSync, existsSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import sharp from "sharp";
import {
  claimSource,
  hashBuffer,
  isTitleBlocked,
  loadOtherTourImageBlocklist,
} from "./lib/tour-image-uniqueness";

const agent = "WorldCompassHoliday/1.0 (goecha d11; hi@worldcompassholiday.com)";
const slug = "goecha-la-trek";
const tourDir = path.join(process.cwd(), "public/uploads/tours");
const titles = [
  "File:Dubde alias Dubdi Monastery, Yuksom, West Sikkim 02.jpg",
  "File:Dubde alias Dubdi Monastery in Yuksom, West Sikkim 02.jpg",
  "File:Dubde alias Dubdi Monastery, Yuksom, West Sikkim 06.jpg",
  "File:Sikkim Village.jpg",
  "File:Kangch-Goechala.jpg",
  "File:Abhishek532 Goechala1.jpg",
  "File:The burning mountain.jpg",
  "File:Mont Pandim.JPG",
];

async function info(title: string) {
  const u = new URL("https://commons.wikimedia.org/w/api.php");
  u.searchParams.set("action", "query");
  u.searchParams.set("titles", title);
  u.searchParams.set("prop", "imageinfo");
  u.searchParams.set("iiprop", "url|mime|extmetadata|size");
  u.searchParams.set("iiurlwidth", "1920");
  u.searchParams.set("format", "json");
  await new Promise((r) => setTimeout(r, 2000));
  const res = await fetch(u, { headers: { "User-Agent": agent } });
  if (!res.ok) return null;
  const data = (await res.json()) as {
    query?: {
      pages?: Record<
        string,
        {
          imageinfo?: {
            url?: string;
            thumburl?: string;
            mime?: string;
            extmetadata?: { LicenseShortName?: { value?: string } };
          }[];
        }
      >;
    };
  };
  const ii = Object.values(data.query?.pages ?? {})[0]?.imageinfo?.[0];
  const mime = String(ii?.mime || "");
  if (!ii?.url || !mime.startsWith("image/") || mime.includes("svg") || mime.includes("png")) {
    return null;
  }
  if (String(ii.extmetadata?.LicenseShortName?.value || "").toLowerCase().includes("nc")) {
    return null;
  }
  return {
    title,
    url: (ii.thumburl || ii.url).split("?")[0],
    license: ii.extmetadata?.LicenseShortName?.value ?? "",
  };
}

async function main() {
  const block = loadOtherTourImageBlocklist(tourDir, slug);
  for (const title of titles) {
    if (isTitleBlocked(title, block)) {
      console.log("blocked", title);
      continue;
    }
    const meta = await info(title);
    if (!meta) {
      console.log("no meta", title);
      continue;
    }
    const res = await fetch(meta.url, {
      headers: { "User-Agent": agent, Referer: "https://commons.wikimedia.org/" },
    });
    if (!res.ok) continue;
    const raw = Buffer.from(await res.arrayBuffer());
    if (!claimSource(block, { hash: hashBuffer(raw), title: meta.title })) continue;
    const processed = await sharp(raw)
      .rotate()
      .resize(1400, 933, { fit: "cover", position: "centre" })
      .jpeg({ quality: 86, mozjpeg: true })
      .toBuffer();
    writeFileSync(path.join(tourDir, `${slug}-d11.jpg`), processed);
    const line = `${slug}-d11.jpg  ←  ${meta.title} (${meta.license})\n`;
    const attr = path.join(tourDir, `${slug}-ATTRIBUTION.txt`);
    if (existsSync(attr)) {
      const t = readFileSync(attr, "utf8");
      if (!t.includes(`${slug}-d11.jpg`)) appendFileSync(attr, line);
    } else {
      writeFileSync(attr, `# ${slug}\n\n${line}`);
    }
    console.log("ok", meta.title);
    return;
  }
  throw new Error("d11 failed");
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : e);
  process.exitCode = 1;
});
