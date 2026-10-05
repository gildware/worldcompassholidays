import Link from "next/link";
import { DestinationGrid } from "@/components/site/DestinationGrid";
import { Hero } from "@/components/site/Hero";
import { moduleLabels, modules, type ModuleKey } from "@/config/modules";
import { prisma } from "@/lib/db";

const serviceCopy: Record<ModuleKey, { href: string; text: string }> = {
  tours: {
    href: "/tours",
    text: "Fixed departures and private treks with itineraries and group size.",
  },
  hotels: {
    href: "/hotels",
    text: "Stays by destination, with rooms and nightly rates.",
  },
  cars: {
    href: "/rentals",
    text: "Cars and bikes for pickup and drop, priced by the day.",
  },
  bikes: {
    href: "/rentals",
    text: "Bikes for the same rental window as cars.",
  },
  buses: {
    href: "/buses",
    text: "Routes, schedules, and seats between cities.",
  },
};

export default async function HomePage() {
  const [featured, destinations] = await Promise.all([
    prisma.destination.findMany({
      where: { published: true, parentId: null },
      orderBy: { name: "asc" },
      include: {
        children: {
          where: { published: true },
          select: { name: true },
          orderBy: { name: "asc" },
        },
      },
    }),
    prisma.destination.findMany({
      where: { published: true },
      orderBy: { name: "asc" },
      select: { slug: true, name: true },
    }),
  ]);

  const services = (Object.keys(modules) as ModuleKey[]).filter((key) => {
    if (!modules[key]) return false;
    if (key === "bikes" && modules.cars) return false;
    return true;
  });

  return (
    <>
      <Hero destinations={destinations} />
      <section className="mx-auto max-w-6xl px-5 py-16">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold">Destinations</h2>
            <p className="mt-2 text-sm text-muted">
              Top-level places. Open one to see the destinations inside it.
            </p>
          </div>
          <Link href="/destinations" className="text-sm font-medium text-brand">
            View all
          </Link>
        </div>
        <div className="mt-8">
          <DestinationGrid destinations={featured} />
        </div>
      </section>
      <section className="bg-surface">
        <div className="mx-auto max-w-6xl px-5 py-16">
          <h2 className="text-2xl font-semibold">What you can book</h2>
          <ul className="mt-8 grid gap-4 md:grid-cols-2">
            {services.map((key) => (
              <li key={key}>
                <Link
                  href={serviceCopy[key].href}
                  className="block h-full rounded-xl border border-line bg-white p-5"
                >
                  <p className="font-semibold">
                    {key === "cars" && modules.bikes
                      ? "Car and bike rental"
                      : moduleLabels[key]}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-muted">
                    {serviceCopy[key].text}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
