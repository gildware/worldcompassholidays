import { redirect } from "next/navigation";

export default function RentalConfigurationPage() {
  redirect("/admin/configuration?section=rentals");
}
