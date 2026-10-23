import { redirect } from "next/navigation";

export default function AdminMeetAssistRedirectPage() {
  redirect("/admin/bookings/assist");
}
