import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { EmptyState, PageIntro } from "@/components/site/PageIntro";
import { modules } from "@/config/modules";
import { prisma } from "@/lib/db";

export const metadata: Metadata = { title: "Buses" };

function one(value: string | string[] | undefined) {
  return (Array.isArray(value) ? value[0] : value) ?? "";
}

export default async function BusesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  if (!modules.buses) notFound();
  const params = await searchParams;
  const from = one(params.from).trim().toLowerCase();
  const to = one(params.to).trim().toLowerCase();

  const routes = (
    await prisma.busRoute.findMany({
      where: { published: true },
      orderBy: { name: "asc" },
    })
  ).filter((route) => {
    if (from && !route.fromCity.toLowerCase().includes(from)) return false;
    if (to && !route.toCity.toLowerCase().includes(to)) return false;
    return true;
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
            title={from || to ? "No routes match this search" : "No routes yet"}
            body={
              from || to
                ? "Try another city pair, or browse every published route."
                : "Bus booking is the last module. The tables are ready for routes and seats."
            }
            href={from || to ? "/buses" : undefined}
            action={from || to ? "Show all routes" : undefined}
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
