import type { Metadata } from "next";
import { BookingDeskList } from "@/components/admin/BookingDeskList";

export const metadata: Metadata = { title: "Tour bookings" };

export default function AdminTourBookingsPage() {
  return <BookingDeskList module="tour" />;
}
