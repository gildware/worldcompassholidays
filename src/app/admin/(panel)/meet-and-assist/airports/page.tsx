import type { Metadata } from "next";
import { CatalogConfigScreen } from "@/components/admin/CatalogConfigScreen";

export const metadata: Metadata = { title: "Meet & assist airports" };

export default function AssistAirportsPage() {
  return <CatalogConfigScreen section="assist" kinds={["assist_airport"]} />;
}
