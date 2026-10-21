import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BookingsScreen } from "@/components/admin/rentals/BookingsScreen";
import { modules } from "@/config/modules";

export const metadata: Metadata = { title: "Bike bookings" };

export default function BikeBookingsPage() {
  if (!modules.bikes) notFound();
  return <BookingsScreen kind="bike" />;
}
