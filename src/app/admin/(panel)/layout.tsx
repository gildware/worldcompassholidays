import type { Metadata } from "next";
import { Suspense } from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import { LogoutButton } from "@/components/auth/LogoutButton";
import { requireStaff } from "@/lib/auth/guards";
import { can } from "@/lib/auth/session";
import {
  applyBookingNavBadges,
  loadBookingDeskStats,
  loadFleetActionCounts,
} from "@/lib/booking-admin";
import { getAdminNav } from "@/lib/navigation";
import { noIndexRobots } from "@/lib/seo";

export const metadata: Metadata = {
  title: {
    default: "Admin",
    template: "%s · Admin",
  },
  description: "Staff tools for World Compass Holidays.",
  robots: noIndexRobots,
};

export default async function AdminPanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireStaff();
  const canSeeBookings = can(user, "bookings.view");
  const canSeeFleet = can(user, "vehicles.view");
  const [stats, fleet] = await Promise.all([
    canSeeBookings ? loadBookingDeskStats() : Promise.resolve([]),
    canSeeBookings || canSeeFleet
      ? loadFleetActionCounts()
      : Promise.resolve({ cars: 0, bikes: 0 }),
  ]);
  const items = applyBookingNavBadges(
    getAdminNav((permission) => can(user, permission)),
    stats,
    fleet,
  );

  return (
    <Suspense fallback={<div className="p-6 text-sm text-muted">Loading desk…</div>}>
      <AdminShell
        items={items}
        user={{ name: user.name, roleName: user.roleName }}
        signOut={
          <LogoutButton
            to="admin"
            className="block w-full rounded-lg px-3 py-2 text-left text-sm text-slate-300 hover:bg-white/5 hover:text-white"
          />
        }
      >
        {children}
      </AdminShell>
    </Suspense>
  );
}
