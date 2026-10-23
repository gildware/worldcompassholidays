import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BookingsScreen } from "@/components/admin/rentals/BookingsScreen";
import { modules } from "@/config/modules";

export const metadata: Metadata = { title: "Car bookings" };

export default function AdminCarBookingsPage() {
  if (!modules.cars) notFound();
  return <BookingsScreen kind="car" />;
}
