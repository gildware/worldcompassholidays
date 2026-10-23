import type { Metadata } from "next";
import { BookingDeskList } from "@/components/admin/BookingDeskList";

export const metadata: Metadata = { title: "Hotel bookings" };

export default function AdminHotelBookingsPage() {
  return <BookingDeskList module="hotel" />;
}
