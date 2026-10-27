import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { modules } from "@/config/modules";
import { requirePermission } from "@/lib/auth/guards";
import { can } from "@/lib/auth/session";
import { loadBusFacilities } from "@/lib/bus-catalog";
import { busAmenityLabels, coachLabel, parseGallery } from "@/lib/buses";
import { prisma } from "@/lib/db";
import { ButtonLink } from "@/components/ui/Button";

export const metadata: Metadata = { title: "Bus" };

export default async function ViewBusPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  if (!modules.buses) notFound();
  const user = await requirePermission("buses.view");
  const { id } = await params;
  const [bus, facilities] = await Promise.all([
    prisma.bus.findUnique({
      where: { id },
      include: {
        routes: {
          orderBy: [{ fromCity: "asc" }, { departTime: "asc" }],
          select: {
            id: true,
            fromCity: true,
            toCity: true,
            departTime: true,
            duration: true,
            published: true,
          },
        },
      },
    }),
    loadBusFacilities(),
  ]);
  if (!bus) notFound();

  const photos = [
    ...new Set([bus.imageUrl, ...parseGallery(bus.galleryJson).map((item) => item.url)].filter(Boolean)),
  ];
  const amenities = busAmenityLabels(bus.amenitiesJson, facilities);

  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <Link href="/admin/buses" className="text-xs font-medium text-brand hover:underline">
            ← All buses
          </Link>
          <h1 className="mt-1 text-xl font-semibold tracking-tight text-navy">{bus.name}</h1>
          <p className="mt-1 text-sm text-muted">
            {bus.operator || "Listed coach"} · {coachLabel(bus.coachType)} · {bus.published ? "Published" : "Draft"}
          </p>
        </div>
        {can(user, "buses.manage") ? (
          <ButtonLink href={`/admin/buses/${bus.id}`} size="sm">
            Edit
          </ButtonLink>
        ) : null}
      </div>

      {bus.summary || bus.about ? (
        <section className="rounded-xl border border-line bg-white p-4">
          {bus.summary ? <p className="text-sm font-medium text-navy">{bus.summary}</p> : null}
          {bus.about ? <p className="mt-2 whitespace-pre-line text-sm text-muted">{bus.about}</p> : null}
        </section>
      ) : null}

      {amenities.length ? (
        <section className="rounded-xl border border-line bg-white p-4">
          <h2 className="text-sm font-semibold text-navy">Facilities</h2>
          <ul className="mt-2 flex flex-wrap gap-2">
            {amenities.map((item) => (
              <li key={item} className="rounded-full bg-surface px-2.5 py-1 text-xs text-navy">
                {item}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {photos.length ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {photos.map((src) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={src} src={src} alt="" className="h-28 w-full rounded-lg border border-line object-cover" />
          ))}
        </div>
      ) : null}

      <section className="rounded-xl border border-line bg-white p-4">
        <h2 className="text-sm font-semibold text-navy">Routes</h2>
        {bus.routes.length ? (
          <ul className="mt-2 grid gap-2">
            {bus.routes.map((route) => (
              <li key={route.id}>
                <Link href={`/admin/buses/routes/${route.id}/view`} className="text-sm text-navy hover:text-brand hover:underline">
                  {route.fromCity} → {route.toCity}
                  {route.departTime ? ` · ${route.departTime}` : ""}
                  {route.duration ? ` · ${route.duration}` : ""}
                  {route.published ? "" : " · Draft"}
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-2 text-sm text-muted">
            This bus is not on a route yet.{" "}
            {can(user, "buses.manage") ? (
              <Link href="/admin/buses/routes/new" className="font-medium text-brand hover:underline">
                Add a route
              </Link>
            ) : null}
          </p>
        )}
      </section>
    </div>
  );
}
