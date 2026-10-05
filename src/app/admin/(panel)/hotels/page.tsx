import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { modules } from "@/config/modules";
import { requirePermission } from "@/lib/auth/guards";
import { prisma } from "@/lib/db";

export const metadata: Metadata = { title: "Hotels" };

export default async function AdminHotelsPage() {
  if (!modules.hotels) notFound();
  await requirePermission("hotels.view");

  const hotels = await prisma.hotel.findMany({
    include: { destination: true, rooms: true },
    orderBy: { name: "asc" },
  });

  return (
    <div>
      <h1 className="text-2xl font-semibold">Hotels</h1>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
        Rooms and nightly rates already have tables. The public list reads
        published hotels.
      </p>
      {hotels.length === 0 ? (
        <p className="mt-8 text-sm text-muted">No hotels yet.</p>
      ) : (
        <ul className="mt-8 divide-y divide-line rounded-xl border border-line bg-white">
          {hotels.map((hotel) => (
            <li key={hotel.id} className="px-4 py-3 text-sm">
              <p className="font-medium">{hotel.name}</p>
              <p className="text-muted">
                {hotel.destination.name} · {hotel.rooms.length} rooms
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
