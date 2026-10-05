import type { Metadata } from "next";
import { DestinationGrid } from "@/components/site/DestinationGrid";
import { PageIntro } from "@/components/site/PageIntro";
import { prisma } from "@/lib/db";

export const metadata: Metadata = {
  title: "Destinations",
};

export default async function DestinationsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const query = q?.trim();

  const destinations = await prisma.destination.findMany({
    where: {
      published: true,
      ...(query
        ? {
            OR: [
              { name: { contains: query } },
              { region: { contains: query } },
              { country: { contains: query } },
              { parent: { name: { contains: query } } },
            ],
          }
        : {}),
    },
    orderBy: { name: "asc" },
    include: {
      parent: { select: { name: true } },
      children: {
        where: { published: true },
        select: { name: true },
        orderBy: { name: "asc" },
      },
    },
  });

  return (
    <div className="mx-auto max-w-6xl px-5 py-14">
      <PageIntro
        eyebrow="Places"
        title={query ? `Results for “${query}”` : "Destinations"}
        description="Regions and the places inside them. Tours, stays, and rentals attach to a destination."
      />
      <div className="mt-10">
        <DestinationGrid destinations={destinations} />
      </div>
    </div>
  );
}
