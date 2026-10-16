import type { Metadata } from "next";
import { FleetScreen } from "@/components/admin/rentals/FleetScreen";

export const metadata: Metadata = { title: "Fleet" };

export default function FleetPage({
  searchParams,
}: {
  searchParams: Promise<{ deleted?: string; saved?: string; notice?: string }>;
}) {
  return <FleetScreen searchParams={searchParams} />;
}
