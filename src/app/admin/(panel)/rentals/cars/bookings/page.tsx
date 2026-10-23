import { redirect } from "next/navigation";

export default function CarBookingsRedirectPage() {
  redirect("/admin/bookings/cars");
}
