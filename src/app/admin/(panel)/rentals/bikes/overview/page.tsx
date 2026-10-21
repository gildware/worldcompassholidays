import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { RentalDesk } from "@/components/admin/rentals/RentalDesk";
import { modules } from "@/config/modules";

export const metadata: Metadata = { title: "Bike rental" };

export default function BikeOverviewPage() {
  if (!modules.bikes) notFound();
  return <RentalDesk kind="bike" />;
}
