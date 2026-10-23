import { BookingsWorkspace } from "@/components/admin/BookingsWorkspace";
import { requirePermission } from "@/lib/auth/guards";
import { can } from "@/lib/auth/session";
import { loadDeskBookings, toBookingListRow } from "@/lib/booking-admin";
import { bookingDesks, type BookingDeskKey } from "@/lib/booking-desks";
import { notFound } from "next/navigation";

export async function BookingDeskList({ module }: { module: BookingDeskKey }) {
  const desk = bookingDesks.find((d) => d.key === module && d.enabled);
  if (!desk) notFound();

  const user = await requirePermission("bookings.view");
  const canManage = can(user, "bookings.manage");
  const bookings = await loadDeskBookings(module);

  return (
    <BookingsWorkspace
      canManage={canManage}
      deskTitle={desk.label}
      deskHint={desk.description}
      lockedModule={module}
      bookings={bookings.map(toBookingListRow)}
    />
  );
}
