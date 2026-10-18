import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { RulesScreen } from "@/components/admin/rentals/RulesScreen";
import { modules } from "@/config/modules";

export const metadata: Metadata = { title: "Car rules" };

export default function CarRulesPage() {
  if (!modules.cars) notFound();
  return <RulesScreen fleet="car" />;
}
