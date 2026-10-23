import type { Metadata } from "next";
import { BookingDeskList } from "@/components/admin/BookingDeskList";

export const metadata: Metadata = { title: "Meet & assist" };

export default function AdminAssistBookingsPage() {
  return <BookingDeskList module="assist" />;
}
