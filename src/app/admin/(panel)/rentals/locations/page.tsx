import { redirect } from "next/navigation";
import { modules } from "@/config/modules";

export default function RentalLocationsPage() {
  redirect(modules.cars ? "/admin/rentals/cars/locations" : "/admin/rentals/bikes/locations");
}
