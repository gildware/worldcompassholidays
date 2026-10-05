import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { EmptyState, PageIntro } from "@/components/site/PageIntro";
import { modules } from "@/config/modules";
import { prisma } from "@/lib/db";
import { formatMoney } from "@/lib/format";

export const metadata: Metadata = { title: "Tours and treks" };

export default async function ToursPage() {
  if (!modules.tours) notFound();

  const tours = await prisma.tour.findMany({
    where: { published: true },
    include: { destination: true },
    orderBy: { title: "asc" },
  });

  return (
    <div className="mx-auto max-w-6xl px-5 py-14">
      <PageIntro
        eyebrow="Tours"
        title="Tours and treks"
        description="Guided trips by destination — days, difficulty, group size, and starting price."
      />
      <div className="mt-10">
        {tours.length === 0 ? (
          <EmptyState
            title="No tours yet"
            body="Publish a tour from the admin and it will show up here and on its destination."
            href="/admin/tours"
            action="Add a tour"
          />
        ) : (
          <ul className="grid gap-4 md:grid-cols-2">
            {tours.map((tour) => (
              <li
                key={tour.id}
                className="overflow-hidden rounded-xl border border-line bg-white"
              >
                <div className="relative aspect-[16/10] bg-surface">
                  <Image
                    src={tour.imageUrl}
                    alt={tour.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                </div>
                <div className="p-5">
                  <p className="text-xs font-medium tracking-wide text-brand uppercase">
                    {tour.destination?.name ?? "Tour"}
                  </p>
                  <h2 className="mt-2 text-lg font-semibold text-navy">
                    {tour.title}
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-muted">
                    {tour.summary}
                  </p>
                  <p className="mt-4 text-sm text-navy">
                    {tour.durationDays} days · {tour.difficulty} · up to{" "}
                    {tour.maxGroupSize} ·{" "}
                    {formatMoney(tour.priceFrom, tour.currency)}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
