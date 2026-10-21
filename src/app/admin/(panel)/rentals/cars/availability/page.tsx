import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AvailabilityScreen } from "@/components/admin/rentals/AvailabilityScreen";
import { modules } from "@/config/modules";

export const metadata: Metadata = { title: "Car availability" };

export default function CarAvailabilityPage() {
  if (!modules.cars) notFound();
  return <AvailabilityScreen kind="car" />;
}
