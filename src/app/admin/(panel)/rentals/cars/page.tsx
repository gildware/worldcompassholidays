import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { FleetScreen } from "@/components/admin/rentals/FleetScreen";
import { modules } from "@/config/modules";

export const metadata: Metadata = { title: "Car rental" };

export default function AdminCarsPage({
  searchParams,
}: {
  searchParams: Promise<{ deleted?: string; saved?: string; notice?: string }>;
}) {
  if (!modules.cars) notFound();
  return <FleetScreen kind="car" searchParams={searchParams} />;
}
