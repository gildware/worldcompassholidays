import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { loadEnvConfig } from "@next/env";
import { PrismaClient } from "@prisma/client";

loadEnvConfig(process.cwd());

const prisma = new PrismaClient();
const lucideDir = path.join(process.cwd(), "node_modules", "lucide-static", "icons");
const outDir = path.join(process.cwd(), "public", "uploads", "catalog", "icons");

function brand(raw: string) {
  const inner = raw
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/^[\s\S]*?<svg[^>]*>/i, "")
    .replace(/<\/svg>[\s\S]*$/i, "")
    .trim();
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64" role="img" aria-hidden="true">
  <rect width="64" height="64" rx="14" fill="#E6F2EF"/>
  <g transform="translate(12 12) scale(1.6667)" fill="none" stroke="#0F5C4C" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    ${inner}
  </g>
</svg>
`;
}

function ensure(name: string) {
  mkdirSync(outDir, { recursive: true });
  const raw = readFileSync(path.join(lucideDir, `${name}.svg`), "utf8");
  writeFileSync(path.join(outDir, `${name}.svg`), brand(raw));
  return {
    url: `/uploads/catalog/icons/${name}.svg`,
    key: `catalog/icons/${name}.svg`,
  };
}

async function main() {
  for (const name of [
    "hotel",
    "wallet",
    "calendar-x",
    "credit-card",
    "message-circle-question",
    "circle-question-mark",
    "circle-help",
  ]) {
    ensure(name);
    console.log("icon", name);
  }

  const extras: Record<string, string> = {
    "Which hotels are used on this package?": "hotel",
    "How much should I budget for local extras?": "wallet",
    "When can this be cancelled?": "calendar-x",
    "Is a seat held when I send this?": "credit-card",
  };

  for (const [title, icon] of Object.entries(extras)) {
    const asset = ensure(icon);
    const existing = await prisma.catalogItem.findFirst({
      where: { kind: "faq", title },
    });
    if (existing) {
      await prisma.catalogItem.update({
        where: { id: existing.id },
        data: {
          iconUrl: asset.url,
          iconKey: asset.key,
          iconDriver: "local",
        },
      });
      console.log("updated faq", title);
    } else {
      await prisma.catalogItem.create({
        data: {
          kind: "faq",
          title,
          content: "",
          iconUrl: asset.url,
          iconKey: asset.key,
          iconDriver: "local",
          sortOrder: 100,
        },
      });
      console.log("created faq", title);
    }
  }
}

main()
  .catch((error: unknown) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
