import { redirect } from "next/navigation";
import { modules } from "@/config/modules";

export default function RentalConfigurationPage() {
  if (modules.cars) redirect("/admin/rentals/cars/configuration");
  if (modules.bikes) redirect("/admin/rentals/bikes/configuration");
  redirect("/admin");
}
