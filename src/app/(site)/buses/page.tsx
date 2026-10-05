import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { EmptyState, PageIntro } from "@/components/site/PageIntro";
import { modules } from "@/config/modules";
import { prisma } from "@/lib/db";

export const metadata: Metadata = { title: "Buses" };

export default async function BusesPage() {
  if (!modules.buses) notFound();

  const routes = await prisma.busRoute.findMany({
    where: { published: true },
    orderBy: { name: "asc" },
  });

  return (
    <div className="mx-auto max-w-6xl px-5 py-14">
      <PageIntro
        eyebrow="Buses"
        title="Bus routes"
        description="Schedules and seat counts will attach to each route."
      />
      <div className="mt-10">
        {routes.length === 0 ? (
          <EmptyState
            title="No routes yet"
            body="Bus booking is the last module. The tables are ready for routes and seats."
          />
        ) : (
          <ul className="grid gap-4">
            {routes.map((route) => (
              <li key={route.id} className="rounded-xl border border-line bg-white p-5">
                <h2 className="text-lg font-semibold">{route.name}</h2>
                <p className="mt-2 text-sm text-muted">
                  {route.fromCity} to {route.toCity}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
