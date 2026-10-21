import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { FleetConfigScreen } from "@/components/admin/rentals/FleetConfigScreen";
import { modules } from "@/config/modules";

export const metadata: Metadata = { title: "Bike configuration" };

export default function BikeConfigurationPage() {
  if (!modules.bikes) notFound();
  return <FleetConfigScreen fleet="bike" />;
}
