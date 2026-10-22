import Link from "next/link";
import { notFound } from "next/navigation";
import { BookingList } from "@/components/account/BookingList";
import { StatusPill } from "@/components/rentals/VehicleCard";
import { requireCustomer } from "@/lib/auth/guards";
import { accountSectionForFleet } from "@/lib/account-sections";
import { prisma } from "@/lib/db";
import { formatDateTime, formatMoney } from "@/lib/format";
import { rentalListGroup, rentalStatusLabel } from "@/lib/rentals/labels";

const groups = [
  { id: "upcoming", label: "Upcoming" },
  { id: "active", label: "Active" },
  { id: "completed", label: "Completed" },
  { id: "cancelled", label: "Cancelled" },
] as const;

export type AccountRentalRow = {
  id: string;
  reference: string;
  status: string;
  pickupAt: Date;
  returnAt: Date;
  amountDue: number;
  currency: string;
  vehicle: { name: string; registrationNumber: string };
};

export function RentalAccountList({ bookings }: { bookings: AccountRentalRow[] }) {
  return (
    <ul className="divide-y divide-line overflow-hidden rounded-lg border border-line bg-white">
      {bookings.map((booking) => (
        <li key={booking.id}>
          <Link
            href={`/account/rentals/${booking.reference}`}
            className="flex flex-wrap items-center justify-between gap-3 px-3.5 py-2.5 text-sm hover:bg-surface"
          >
            <div className="min-w-0">
              <p className="truncate font-medium">{booking.vehicle.name}</p>
              <p className="text-xs font-medium tracking-wide">{booking.vehicle.registrationNumber}</p>
              <p className="text-xs text-muted">
                {booking.reference} · {formatDateTime(booking.pickupAt)} – {formatDateTime(booking.returnAt)}
              </p>
            </div>
            <div className="text-right">
              <StatusPill status={booking.status} label={rentalStatusLabel(booking.status)} />
              <p className="mt-1 text-muted">{formatMoney(booking.amountDue, booking.currency)}</p>
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}

export async function FleetAccountPage({ fleet, view }: { fleet: "car" | "bike"; view?: string }) {
  const section = accountSectionForFleet(fleet);
  if (!section) notFound();

  const user = await requireCustomer("account.bookings.view");
  const selected = groups.some((group) => group.id === view) ? view! : "upcoming";
  const [rentals, enquiries] = await Promise.all([
    prisma.rentalBooking.findMany({
      where: { userId: user.id, vehicle: { kind: fleet } },
      include: { vehicle: { select: { name: true, registrationNumber: true, kind: true } } },
      orderBy: { pickupAt: "desc" },
    }),
    prisma.booking.findMany({
      where: { userId: user.id, module: fleet },
      orderBy: { createdAt: "desc" },
    }),
  ]);
  const visible = rentals.filter((booking) => rentalListGroup(booking.status) === selected);

  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold leading-tight">{section.label}</h1>
          <p className="mt-1 text-sm text-muted">{section.description}</p>
        </div>
        <Link href={section.actionHref} className="rounded-md bg-brand px-3 py-1.5 text-sm font-medium text-white">
          {section.actionLabel}
        </Link>
      </div>

      {enquiries.length > 0 ? (
        <section className="grid gap-2">
          <h2 className="text-sm font-semibold">Enquiries</h2>
          <BookingList bookings={enquiries} showModule={false} />
        </section>
      ) : null}

      {rentals.length === 0 && enquiries.length === 0 ? (
        <p className="rounded-lg border border-dashed border-line bg-white px-4 py-6 text-sm text-muted">
          {section.empty}{" "}
          <Link href={section.actionHref} className="text-brand">
            {section.actionLabel}
          </Link>
        </p>
      ) : null}

      {rentals.length > 0 ? (
        <section className="grid gap-3">
          <div className="flex gap-1.5 overflow-x-auto">
            {groups.map((group) => (
              <Link
                key={group.id}
                href={`${section.href}?view=${group.id}`}
                className={[
                  "rounded-full border px-3 py-1 text-sm",
                  selected === group.id ? "border-brand bg-brand-soft font-medium text-brand" : "border-line bg-white",
                ].join(" ")}
              >
                {group.label}
              </Link>
            ))}
          </div>
          {visible.length === 0 ? (
            <p className="rounded-lg border border-dashed border-line bg-white px-4 py-6 text-sm text-muted">
              Nothing in {selected} {fleet} bookings.
            </p>
          ) : (
            <RentalAccountList bookings={visible} />
          )}
        </section>
      ) : null}
    </div>
  );
}
