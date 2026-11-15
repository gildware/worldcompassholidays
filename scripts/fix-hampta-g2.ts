import { createHash } from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";
import { loadEnvConfig } from "@next/env";
import sharp from "sharp";

loadEnvConfig(process.cwd());

const agent = "WorldCompassHoliday/1.0 (hampta g2 unique; hi@worldcompassholiday.com)";
const coverHash = createHash("sha1")
  .update(readFileSync("public/uploads/tours/hampta-pass-chandratal-trek-cover.jpg"))
  .digest("hex");
const g1Hash = createHash("sha1")
  .update(readFileSync("public/uploads/tours/hampta-pass-chandratal-trek-g1.jpg"))
  .digest("hex");
const used = new Set([coverHash, g1Hash]);

async function search(q: string) {
  const u = new URL("https://commons.wikimedia.org/w/api.php");
  u.searchParams.set("action", "query");
  u.searchParams.set("list", "search");
  u.searchParams.set("srsearch", `${q} filetype:bitmap`);
  u.searchParams.set("srnamespace", "6");
  u.searchParams.set("srlimit", "20");
  u.searchParams.set("format", "json");
  const res = await fetch(u, { headers: { "User-Agent": agent } });
  const data = (await res.json()) as { query?: { search?: { title: string }[] } };
  return (data.query?.search ?? []).map((x) => x.title);
}

async function info(title: string) {
  const u = new URL("https://commons.wikimedia.org/w/api.php");
  u.searchParams.set("action", "query");
  u.searchParams.set("titles", title);
  u.searchParams.set("prop", "imageinfo");
  u.searchParams.set("iiprop", "url|mime|extmetadata");
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
  if (!ii?.url || !String(ii.mime || "").startsWith("image/") || String(ii.mime).includes("svg")) {
    return null;
  }
  if (String(ii.extmetadata?.LicenseShortName?.value || "").toLowerCase().includes("nc")) {
    return null;
  }
  return (ii.thumburl || ii.url).split("?")[0];
}

async function main() {
  const queries = [
    "Lahaul valley Himachal",
    "Chatru Himachal",
    "Hampta Pass snow ridge",
    "Rohtang Pass Himachal mountains",
    "Spiti barren mountains Himachal",
  ];
  for (const q of queries) {
    console.log("search", q);
    await new Promise((r) => setTimeout(r, 2000));
    const titles = await search(q);
    for (const title of titles) {
      if (!/hampta|lahaul|chatru|rohtang|spiti|manali|chandra/i.test(title)) continue;
      if (/logo|map|flag|mesmerising beauty of hampta/i.test(title)) continue;
      await new Promise((r) => setTimeout(r, 1000));
      const url = await info(title);
      if (!url) continue;
      const res = await fetch(url, {
        headers: { "User-Agent": agent, Referer: "https://commons.wikimedia.org/" },
      });
      if (!res.ok) continue;
      const raw = Buffer.from(await res.arrayBuffer());
      const hash = createHash("sha1").update(raw).digest("hex");
      if (used.has(hash)) {
        console.log("dup", title);
        continue;
      }
      const processed = await sharp(raw)
        .rotate()
        .resize(1600, 1067, { fit: "cover", position: "centre" })
        .jpeg({ quality: 86, mozjpeg: true })
        .toBuffer();
      writeFileSync("public/uploads/tours/hampta-pass-chandratal-trek-g2.jpg", processed);
      const { uploadCloudinaryBuffer } = await import("../src/lib/storage/cloudinary");
      const up = await uploadCloudinaryBuffer({
        buffer: processed,
        publicId: "worldcompass/tours/hampta-pass-chandratal-trek/gallery-2",
      });
      console.log("ok", title, up.key);
      return;
    }
  }
  throw new Error("FAIL unique hampta g2");
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : e);
  process.exitCode = 1;
});
