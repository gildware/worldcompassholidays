import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { RentalDesk } from "@/components/admin/rentals/RentalDesk";
import { modules } from "@/config/modules";

export const metadata: Metadata = { title: "Car rental" };

export default function CarOverviewPage() {
  if (!modules.cars) notFound();
  return <RentalDesk kind="car" />;
}
