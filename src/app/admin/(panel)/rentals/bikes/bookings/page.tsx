import { redirect } from "next/navigation";

export default function BikeBookingsRedirectPage() {
  redirect("/admin/bookings/bikes");
}
