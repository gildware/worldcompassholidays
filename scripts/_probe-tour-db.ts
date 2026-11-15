import { loadEnvConfig } from "@next/env";
loadEnvConfig(process.cwd());
import { PrismaClient } from "@prisma/client";

async function main() {
  const p = new PrismaClient();
  const dests = await p.destination.findMany({
    select: { slug: true, name: true },
    orderBy: { slug: "asc" },
  });
  console.log("destinations", dests.length);
  console.log(
    dests
      .filter((d) => /goa|kashmir|srinagar|gulmarg|pahalgam/i.test(d.slug + " " + d.name))
      .map((d) => d.slug)
      .join(", "),
  );
  const kinds = await p.catalogItem.groupBy({ by: ["kind"], _count: true });
  console.log("catalog kinds", kinds);
  const sample = await p.catalogItem.findMany({
    take: 40,
    select: { kind: true, title: true },
    orderBy: [{ kind: "asc" }, { title: "asc" }],
  });
  console.log(sample);
  console.log("tours", await p.tour.count());
  await p.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
