import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BusForm } from "@/components/admin/BusForm";
import { modules } from "@/config/modules";
import { requirePermission } from "@/lib/auth/guards";
import { ensureBusCatalog, loadBusFacilities } from "@/lib/bus-catalog";

export const metadata: Metadata = { title: "Add bus" };

export default async function NewBusPage() {
  if (!modules.buses) notFound();
  await requirePermission("buses.manage");
  await ensureBusCatalog();
  const facilities = await loadBusFacilities();

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3">
      <div className="shrink-0">
        <Link href="/admin/buses" className="text-xs font-medium text-brand hover:underline">
          ← All buses
        </Link>
        <h1 className="mt-1 text-xl font-semibold tracking-tight text-navy">Add a bus</h1>
        <p className="mt-1 text-xs text-muted">
          Photos and facilities belong to the bus. The route, cities, and run time are added under Routes.
        </p>
      </div>
      <BusForm
        bus={null}
        facilities={facilities.map((item) => ({
          id: item.id,
          title: item.title,
          iconUrl: item.iconUrl,
        }))}
      />
    </div>
  );
}
