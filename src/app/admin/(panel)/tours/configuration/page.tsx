import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CatalogConfigScreen } from "@/components/admin/CatalogConfigScreen";
import { modules } from "@/config/modules";

export const metadata: Metadata = { title: "Tour configuration" };

export default function TourConfigurationPage() {
  if (!modules.tours) notFound();
  return <CatalogConfigScreen section="tours" />;
}
