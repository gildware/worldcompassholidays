import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { EmptyState, PageIntro } from "@/components/site/PageIntro";
import { modules } from "@/config/modules";
import { prisma } from "@/lib/db";
import { formatMoney } from "@/lib/format";

export const metadata: Metadata = { title: "Rentals" };

export default async function RentalsPage() {
  if (!modules.cars && !modules.bikes) notFound();

  const kinds = [
    modules.cars ? "car" : null,
    modules.bikes ? "bike" : null,
  ].filter((kind): kind is string => Boolean(kind));

  const vehicles = await prisma.vehicle.findMany({
    where: { published: true, kind: { in: kinds } },
    include: { destination: true },
    orderBy: { name: "asc" },
  });

  return (
    <div className="mx-auto max-w-6xl px-5 py-14">
      <PageIntro
        eyebrow="Rentals"
        title="Cars and bikes"
        description="Same rental model, two fleets. Pickup, drop, and daily price."
      />
      <div className="mt-10">
        {vehicles.length === 0 ? (
          <EmptyState
            title="No vehicles yet"
            body="Cars and bikes share one catalog. Add them when this module is filled in."
          />
        ) : (
          <ul className="grid gap-4 md:grid-cols-2">
            {vehicles.map((vehicle) => (
              <li key={vehicle.id} className="rounded-xl border border-line bg-white p-5">
                <p className="text-xs font-medium text-brand uppercase">
                  {vehicle.kind} · {vehicle.destination.name}
                </p>
                <h2 className="mt-2 text-lg font-semibold">{vehicle.name}</h2>
                <p className="mt-2 text-sm text-muted">{vehicle.summary}</p>
                <p className="mt-4 text-sm">
                  {vehicle.seats} seats · {formatMoney(vehicle.pricePerDay, vehicle.currency)}{" "}
                  / day
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
