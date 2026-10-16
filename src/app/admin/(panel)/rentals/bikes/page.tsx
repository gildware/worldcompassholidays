import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { FleetScreen } from "@/components/admin/rentals/FleetScreen";
import { modules } from "@/config/modules";

export const metadata: Metadata = { title: "Bike rental" };

export default function AdminBikesPage({
  searchParams,
}: {
  searchParams: Promise<{ deleted?: string; saved?: string; notice?: string }>;
}) {
  if (!modules.bikes) notFound();
  return <FleetScreen kind="bike" searchParams={searchParams} />;
}
