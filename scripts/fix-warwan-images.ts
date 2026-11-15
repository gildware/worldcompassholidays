import { readdirSync, readFileSync, unlinkSync } from "node:fs";
import path from "node:path";
import { loadEnvConfig } from "@next/env";
import {
  cover,
  createBatchBlocklist,
  day,
  fetchAndWireTourImages,
  gallery,
} from "./lib/fetch-tour-images-core";
import { claimSource, hashBuffer } from "./lib/tour-image-uniqueness";

loadEnvConfig(process.cwd());
const tourDir = path.join(process.cwd(), "public", "uploads", "tours");
const slug = "warwan-valley-trek";

async function main() {
  const re = new RegExp(`^${slug}-(cover|g\\d+|d\\d+|ATTRIBUTION)\\.(jpe?g|webp|txt)$`, "i");
  for (const n of readdirSync(tourDir)) {
    if (!re.test(n)) continue;
    unlinkSync(path.join(tourDir, n));
    console.log("reset", n);
  }
  const shared = createBatchBlocklist("__warwan__");
  for (const n of readdirSync(tourDir)) {
    if (!/\.jpe?g$/i.test(n)) continue;
    claimSource(shared, { hash: hashBuffer(readFileSync(path.join(tourDir, n))) });
  }
  await fetchAndWireTourImages(
    {
      slug,
      targets: [
        cover(`${slug}-cover.jpg`, "Warwan Valley Kashmir", ["File:Warwan valley.jpg"]),
        gallery(`${slug}-g1.jpg`, "Margan Kashmir", ["File:Margan top hidden waterfall.jpg"]),
        gallery(`${slug}-g2.jpg`, "Shilsar Kashmir", ["File:Shilsar valley mountains.jpg"]),
        gallery(`${slug}-g3.jpg`, "Sinthan Top Kashmir", [
          "File:Sinthan Top, Kashmir.jpg",
          "File:Sinthan Top (14570944311).jpg",
        ]),
        gallery(`${slug}-g4.jpg`, "Sinthan Top Kashmir", [
          "File:Road up to Sinthan Top (14390832907).jpg",
          "File:Sinthan Top (14573901011).jpg",
        ]),
        day(`${slug}-d1.jpg`, 1, "Sinthan Top Kashmir", [
          "File:Sinthan Top (14390584740).jpg",
          "File:Sinthan Top, Kashmir, India.jpg",
        ]),
        day(`${slug}-d2.jpg`, 2, "Sinthan Top Kashmir", [
          "File:Sinthan Top (14597361293).jpg",
          "File:Sinthan Top (14390826097).jpg",
        ]),
        day(`${slug}-d3.jpg`, 3, "Sinthan Top Kashmir", [
          "File:Sinthan Top (14594406763).jpg",
          "File:Sinthan top, Srinagar.jpg",
        ]),
        day(`${slug}-d4.jpg`, 4, "Sinthan Top Kashmir", [
          "File:Sinthan Top (14390591500).jpg",
          "File:Sinthan Top (14390630928).jpg",
        ]),
        day(`${slug}-d5.jpg`, 5, "Sinthan Top Kashmir", [
          "File:Sinthan Top (14390584740).jpg",
          "File:Sinthan Top (14570944311).jpg",
        ]),
        day(`${slug}-d6.jpg`, 6, "Dachigam Kashmir", [
          "File:Dachigam National Park 2-Kashmir.jpg",
          "File:On top of Dachigam.jpg",
        ]),
        day(`${slug}-d7.jpg`, 7, "Dachigam Kashmir", [
          "File:Dachigam National Park- Jammu & Kashmir.jpg",
          "File:A view of Lower Dachigam where most of the hangul get confined in winter, AJT Johnsingh.jpg",
        ]),
        day(`${slug}-d8.jpg`, 8, "Hazratbal Dal Lake", [
          "File:Dal Lake Hazratbal Srinagar.jpg",
        ]),
      ],
    },
    { sharedBlock: shared },
  );
}

main().catch((e) => {
  console.warn(e instanceof Error ? e.message.split("\n")[0] : e);
  process.exitCode = 0; // media may still be saved
});
