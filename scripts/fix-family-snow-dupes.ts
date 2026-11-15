import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import sharp from "sharp";
import {
  claimSource,
  hashBuffer,
  isTitleBlocked,
  loadOtherTourImageBlocklist,
} from "./lib/tour-image-uniqueness";

const agent = "WorldCompassHoliday/1.0 (family-snow uniq; hi@worldcompassholiday.com)";
const slug = "family-snow-gulmarg-special";
const tourDir = path.join(process.cwd(), "public/uploads/tours");

async function info(title: string) {
  const u = new URL("https://commons.wikimedia.org/w/api.php");
  u.searchParams.set("action", "query");
  u.searchParams.set("titles", title);
  u.searchParams.set("prop", "imageinfo");
  u.searchParams.set("iiprop", "url|mime|extmetadata|size");
  u.searchParams.set("iiurlwidth", "1920");
  u.searchParams.set("format", "json");
  const res = await fetch(u, { headers: { "User-Agent": agent } });
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

async function download(url: string) {
  const res = await fetch(url, {
    headers: { "User-Agent": agent, Referer: "https://commons.wikimedia.org/" },
  });
  if (!res.ok) throw new Error(String(res.status));
  return Buffer.from(await res.arrayBuffer());
}

async function main() {
  const targets = [
    {
      file: `${slug}-g2.jpg`,
      w: 1600,
      h: 1067,
      titles: [
        "File:Tourists enjoying snow at Gulmarg, in Jammu and Kashmir.jpg",
        "File:Snow at Gulmarg, Kashmir.jpg",
        "File:Kangdoor Ski slopes of Gulmarg.JPG",
        "File:Snow in Gulmarg, Kashmir.jpg",
        "File:Gulmarg December 2020 by Mutahir Showkat.jpg",
        "File:Gulmarg kashmir winter2004.jpg",
      ],
    },
  ];

  const block = loadOtherTourImageBlocklist(tourDir, slug);
  let attrText = readFileSync(path.join(tourDir, `${slug}-ATTRIBUTION.txt`), "utf8");
  for (const line of attrText.split("\n")) {
    const m = line.match(/File:.+?\.(?:jpe?g|JPG|PNG|webp)/);
    if (m) block.titles.add(m[0]);
  }

  for (const t of targets) {
    let ok = false;
    for (const title of t.titles) {
      if (isTitleBlocked(title, block)) {
        console.log("blocked", title);
        continue;
      }
      try {
        const meta = await info(title);
        if (!meta) continue;
        const raw = await download(meta.url);
        const hash = hashBuffer(raw);
        if (!claimSource(block, { hash, title: meta.title })) continue;
        const processed = await sharp(raw)
          .rotate()
          .resize(t.w, t.h, { fit: "cover", position: "centre" })
          .jpeg({ quality: 86, mozjpeg: true })
          .toBuffer();
        writeFileSync(path.join(tourDir, t.file), processed);
        const source = `${meta.title} (${meta.license})`;
        attrText = attrText.replace(
          new RegExp(`${t.file.replace(/\./g, "\\.")}  ←  .+`),
          `${t.file}  ←  ${source}`,
        );
        console.log("ok", t.file, "←", source);
        ok = true;
        break;
      } catch (e) {
        console.log("fail", title, e instanceof Error ? e.message : e);
      }
    }
    if (!ok) throw new Error(`FAILED ${t.file}`);
  }
  writeFileSync(path.join(tourDir, `${slug}-ATTRIBUTION.txt`), attrText);
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : e);
  process.exitCode = 1;
});
