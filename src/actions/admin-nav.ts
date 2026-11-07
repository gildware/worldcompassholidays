"use server";

import { requireStaff } from "@/lib/auth/guards";
import { can } from "@/lib/auth/session";
import {
  applyBookingNavBadges,
  loadBookingNavStats,
  loadFleetActionCounts,
} from "@/lib/booking-admin";
import { getAdminNav, type NavItem } from "@/lib/navigation";
import { cached } from "@/lib/ttl-cache";

/** Sidebar badges — cached briefly so menu clicks stay snappy. */
export async function loadAdminNavBadges(): Promise<NavItem[] | null> {
  const user = await requireStaff();
  const canSeeBookings = can(user, "bookings.view");
  const canSeeFleet = can(user, "vehicles.view");
  if (!canSeeBookings && !canSeeFleet) return null;

  const [stats, fleet] = await Promise.all([
    canSeeBookings
      ? cached("admin-nav-booking-stats", 20_000, loadBookingNavStats)
      : Promise.resolve([]),
    canSeeBookings || canSeeFleet
      ? cached("admin-nav-fleet-stats", 20_000, loadFleetActionCounts)
      : Promise.resolve({ cars: 0, bikes: 0 }),
  ]);

  return applyBookingNavBadges(
    getAdminNav((permission) => can(user, permission)),
    stats,
    fleet,
  );
}
