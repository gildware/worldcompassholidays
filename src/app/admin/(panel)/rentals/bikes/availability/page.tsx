import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AvailabilityScreen } from "@/components/admin/rentals/AvailabilityScreen";
import { modules } from "@/config/modules";

export const metadata: Metadata = { title: "Bike availability" };

export default function BikeAvailabilityPage() {
  if (!modules.bikes) notFound();
  return <AvailabilityScreen kind="bike" />;
}
