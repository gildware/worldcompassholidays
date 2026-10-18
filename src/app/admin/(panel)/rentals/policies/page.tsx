import { redirect } from "next/navigation";
import { modules } from "@/config/modules";

export default function RentalPoliciesPage() {
  redirect(modules.cars ? "/admin/rentals/cars/rules" : "/admin/rentals/bikes/rules");
}
