import type { Metadata } from "next";
import { BookingDeskList } from "@/components/admin/BookingDeskList";

export const metadata: Metadata = { title: "Visa requests" };

export default function AdminVisaBookingsPage() {
  return <BookingDeskList module="visa" />;
}
