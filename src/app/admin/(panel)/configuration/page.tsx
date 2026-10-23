import { redirect } from "next/navigation";
import { modules } from "@/config/modules";
import { requireStaff } from "@/lib/auth/guards";
import { can } from "@/lib/auth/session";

/** Legacy shared config URL — send people to the module-scoped screens. */
export default async function ConfigurationRedirectPage({
  searchParams,
}: {
  searchParams: Promise<{ section?: string }>;
}) {
  const user = await requireStaff();
  const { section } = await searchParams;

  if (section === "hotels" && modules.hotels && can(user, "hotels.manage")) {
    redirect("/admin/hotels/configuration");
  }
  if (section === "tours" && modules.tours && can(user, "tours.manage")) {
    redirect("/admin/tours/configuration");
  }
  if (section === "rentals") {
    if (modules.cars && can(user, "vehicles.manage")) {
      redirect("/admin/rentals/cars/configuration");
    }
    if (modules.bikes && can(user, "vehicles.manage")) {
      redirect("/admin/rentals/bikes/configuration");
    }
  }

  if (modules.tours && can(user, "tours.manage")) {
    redirect("/admin/tours/configuration");
  }
  if (modules.hotels && can(user, "hotels.manage")) {
    redirect("/admin/hotels/configuration");
  }
  if (modules.cars && can(user, "vehicles.manage")) {
    redirect("/admin/rentals/cars/configuration");
  }
  if (modules.bikes && can(user, "vehicles.manage")) {
    redirect("/admin/rentals/bikes/configuration");
  }

  redirect("/admin/no-access");
}
