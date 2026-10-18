import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { RulesScreen } from "@/components/admin/rentals/RulesScreen";
import { modules } from "@/config/modules";

export const metadata: Metadata = { title: "Bike rules" };

export default function BikeRulesPage() {
  if (!modules.bikes) notFound();
  return <RulesScreen fleet="bike" />;
}
