import { redirect } from "next/navigation";

export default function AdminVisaRedirectPage() {
  redirect("/admin/bookings/visa");
}
