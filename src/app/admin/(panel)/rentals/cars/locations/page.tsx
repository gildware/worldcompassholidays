import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LocationsScreen } from "@/components/admin/rentals/LocationsScreen";
import { modules } from "@/config/modules";

export const metadata: Metadata = { title: "Car locations" };

export default async function CarLocationsPage({
  searchParams,
}: {
  searchParams: Promise<{ blocked?: string }>;
}) {
  if (!modules.cars) notFound();
  const { blocked } = await searchParams;
  return <LocationsScreen fleet="car" blocked={blocked === "used"} />;
}
