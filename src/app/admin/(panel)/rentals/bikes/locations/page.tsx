import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LocationsScreen } from "@/components/admin/rentals/LocationsScreen";
import { modules } from "@/config/modules";

export const metadata: Metadata = { title: "Bike locations" };

export default async function BikeLocationsPage({
  searchParams,
}: {
  searchParams: Promise<{ blocked?: string }>;
}) {
  if (!modules.bikes) notFound();
  const { blocked } = await searchParams;
  return <LocationsScreen fleet="bike" blocked={blocked === "used"} />;
}
