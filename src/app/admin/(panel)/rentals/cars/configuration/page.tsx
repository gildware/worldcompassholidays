import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { FleetConfigScreen } from "@/components/admin/rentals/FleetConfigScreen";
import { modules } from "@/config/modules";

export const metadata: Metadata = { title: "Car configuration" };

export default function CarConfigurationPage() {
  if (!modules.cars) notFound();
  return <FleetConfigScreen fleet="car" />;
}