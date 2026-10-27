import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CatalogConfigScreen } from "@/components/admin/CatalogConfigScreen";
import { modules } from "@/config/modules";
import { ensureBusCatalog } from "@/lib/bus-catalog";

export const metadata: Metadata = { title: "Bus facilities" };

export default async function BusConfigurationPage() {
  if (!modules.buses) notFound();
  await ensureBusCatalog();
  return <CatalogConfigScreen section="buses" kinds={["bus_facility"]} />;
}
