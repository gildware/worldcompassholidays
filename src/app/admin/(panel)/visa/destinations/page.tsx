import type { Metadata } from "next";
import { CatalogConfigScreen } from "@/components/admin/CatalogConfigScreen";

export const metadata: Metadata = { title: "Visa destinations" };

export default function VisaDestinationsPage() {
  return <CatalogConfigScreen section="visa" kinds={["visa_destination"]} />;
}
