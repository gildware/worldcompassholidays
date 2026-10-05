import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { modules } from "@/config/modules";
import { DestinationGrid } from "@/components/site/DestinationGrid";
import { prisma } from "@/lib/db";
import { formatMoney } from "@/lib/format";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const destination = await prisma.destination.findUnique({ where: { slug } });
  return { title: destination?.name ?? "Destination" };
}

export default async function DestinationPage({ params }: Props) {
  const { slug } = await params;
  const destination = await prisma.destination.findUnique({
    where: { slug },
    include: {
      parent: { select: { name: true, slug: true, published: true } },
      children: {
        where: { published: true },
        orderBy: { name: "asc" },
        include: {
          parent: { select: { name: true } },
          children: {
            where: { published: true },
            select: { name: true },
            orderBy: { name: "asc" },
          },
        },
      },
      tours: { where: { published: true }, orderBy: { title: "asc" } },
      hotels: { where: { published: true }, orderBy: { name: "asc" } },
      vehicles: { where: { published: true }, orderBy: { name: "asc" } },
      busRoutes: { where: { published: true }, orderBy: { name: "asc" } },
    },
  });

  if (!destination || !destination.published) notFound();

  return (
    <div className="mx-auto max-w-6xl px-5 py-14">
      <div className="relative mb-8 aspect-[21/9] overflow-hidden rounded-2xl bg-surface">
        <Image
          src={destination.imageUrl}
          alt={destination.name}
          fill
          priority
          className="object-cover"
          sizes="(max-width: 1152px) 100vw, 1152px"
        />
      </div>
      <p className="text-sm text-muted">
        <Link href="/destinations" className="font-medium text-brand">
          Destinations
        </Link>
        {destination.parent?.published ? (
          <>
            {" / "}
            <Link
              href={`/destinations/${destination.parent.slug}`}
              className="font-medium text-brand"
            >
              {destination.parent.name}
            </Link>
          </>
        ) : null}
      </p>
      <p className="mt-3 text-sm font-medium tracking-wide text-brand uppercase">
        {destination.region}, {destination.country}
      </p>
      <h1 className="mt-2 text-4xl font-semibold">{destination.name}</h1>
      <p className="mt-4 max-w-2xl text-base leading-7 text-muted">
        {destination.summary}
      </p>

      {destination.children.length > 0 ? (
        <section className="mt-12">
          <h2 className="text-xl font-semibold">Places in {destination.name}</h2>
          <div className="mt-4">
            <DestinationGrid destinations={destination.children} />
          </div>
        </section>
      ) : null}

      <div className="mt-12 grid gap-10">
        {modules.tours ? (
          <CatalogBlock title="Tours and treks" empty="No tours published here yet.">
            {destination.tours.map((tour) => (
              <article
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
                  <h3 className="font-semibold text-navy">{tour.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-muted">{tour.summary}</p>
                  <p className="mt-3 text-sm">
                    {tour.durationDays} days · {tour.difficulty} ·{" "}
                    {formatMoney(tour.priceFrom, tour.currency)}
                  </p>
                </div>
              </article>
            ))}
          </CatalogBlock>
        ) : null}
        {modules.hotels ? (
          <CatalogBlock title="Hotels" empty="No hotels published here yet.">
            {destination.hotels.map((hotel) => (
              <article key={hotel.id} className="rounded-xl border border-line bg-white p-5">
                <h3 className="font-semibold">{hotel.name}</h3>
                <p className="mt-2 text-sm text-muted">{hotel.summary}</p>
              </article>
            ))}
          </CatalogBlock>
        ) : null}
        {modules.cars || modules.bikes ? (
          <CatalogBlock title="Rentals" empty="No vehicles published here yet.">
            {destination.vehicles.map((vehicle) => (
              <article key={vehicle.id} className="rounded-xl border border-line bg-white p-5">
                <h3 className="font-semibold">{vehicle.name}</h3>
                <p className="mt-2 text-sm capitalize text-muted">{vehicle.kind}</p>
              </article>
            ))}
          </CatalogBlock>
        ) : null}
        {modules.buses ? (
          <CatalogBlock title="Buses" empty="No bus routes published here yet.">
            {destination.busRoutes.map((route) => (
              <article key={route.id} className="rounded-xl border border-line bg-white p-5">
                <h3 className="font-semibold">{route.name}</h3>
                <p className="mt-2 text-sm text-muted">
                  {route.fromCity} to {route.toCity}
                </p>
              </article>
            ))}
          </CatalogBlock>
        ) : null}
      </div>

      <Link href="/contact" className="mt-10 inline-flex text-sm font-medium text-brand">
        Enquire about {destination.name}
      </Link>
    </div>
  );
}

function CatalogBlock({
  title,
  empty,
  children,
}: {
  title: string;
  empty: string;
  children: React.ReactNode[];
}) {
  return (
    <section>
      <h2 className="text-xl font-semibold">{title}</h2>
      {children.length === 0 ? (
        <p className="mt-4 text-sm text-muted">{empty}</p>
      ) : (
        <div className="mt-4 grid gap-4 md:grid-cols-2">{children}</div>
      )}
    </section>
  );
}
