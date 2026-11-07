import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BusRequestScreen, type BusRequestSearchParams } from "@/components/bus/BusRequestScreen";
import { modules } from "@/config/modules";
import { pageMetadata } from "@/lib/seo";

const pageTitle = "Request Intercity Bus Hire";
const pageDescription =
  "Send the cities, travel date, and coach type you want. We quote listed buses and options that are not on the list — nothing is booked until you accept.";

export const metadata: Metadata = pageMetadata({
  title: pageTitle,
  description: pageDescription,
  path: "/buses/request",
});

export default async function BusRequestPage({
  searchParams,
}: {
  searchParams: Promise<BusRequestSearchParams>;
}) {
  if (!modules.buses) notFound();
  return <BusRequestScreen searchParams={await searchParams} />;
}
