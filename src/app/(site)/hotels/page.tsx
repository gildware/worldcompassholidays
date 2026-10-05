import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { EmptyState, PageIntro } from "@/components/site/PageIntro";
import { modules } from "@/config/modules";
import { prisma } from "@/lib/db";
import { formatMoney } from "@/lib/format";

export const metadata: Metadata = { title: "Hotels" };

export default async function HotelsPage() {
  if (!modules.hotels) notFound();

  const hotels = await prisma.hotel.findMany({
    where: { published: true },
    include: { destination: true },
    orderBy: { name: "asc" },
  });

  return (
    <div className="mx-auto max-w-6xl px-5 py-14">
      <PageIntro
        eyebrow="Stays"
        title="Hotels"
        description="Rooms and nightly rates will be managed per hotel."
      />
      <div className="mt-10">
        {hotels.length === 0 ? (
          <EmptyState
            title="No hotels yet"
            body="Hotel inventory is ready in the database. The admin form for rooms comes next."
          />
        ) : (
          <ul className="grid gap-4 md:grid-cols-2">
            {hotels.map((hotel) => (
              <li key={hotel.id} className="rounded-xl border border-line bg-white p-5">
                <p className="text-xs font-medium text-brand uppercase">
                  {hotel.destination.name}
                </p>
                <h2 className="mt-2 text-lg font-semibold">{hotel.name}</h2>
                <p className="mt-2 text-sm text-muted">{hotel.summary}</p>
                <p className="mt-4 text-sm">
                  From {formatMoney(hotel.priceFrom, hotel.currency)} / night
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
