"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { StatusPill } from "@/components/rentals/VehicleCard";
import { SearchableSelect } from "@/components/ui/SearchableSelect";
import { formatMoney } from "@/lib/format";
import { bookingStatuses, rentalStatusLabel } from "@/lib/rentals/labels";

export type BookingVehicle = {
  id: string;
  name: string;
  registrationNumber: string;
  kind: string;
  typeId: string;
  typeName: string;
  imageUrl: string;
};

export type BookingItem = {
  id: string;
  reference: string;
  status: string;
  contactName: string;
  pickupAt: string;
  returnAt: string;
  amountDue: number;
  currency: string;
  vehicleId: string;
};

function isoDate(date: Date) {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

function parseDay(iso: string) {
  const [year, month, day] = iso.split("-").map(Number);
  return new Date(year, (month ?? 1) - 1, day ?? 1);
}

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function monthEnd(iso: string) {
  const start = parseDay(iso);
  return isoDate(new Date(start.getFullYear(), start.getMonth() + 1, 0));
}

function overlaps(booking: BookingItem, start: Date, end: Date) {
  return new Date(booking.pickupAt) < end && new Date(booking.returnAt) > start;
}

function formatRange(start: string, end: string) {
  const options: Intl.DateTimeFormatOptions = { day: "numeric", month: "short" };
  return `${new Date(start).toLocaleDateString(undefined, options)} – ${new Date(end).toLocaleDateString(undefined, options)}`;
}

export function BookingsWorkspace({
  vehicles,
  bookings,
  types,
}: {
  vehicles: BookingVehicle[];
  bookings: BookingItem[];
  types: { id: string; name: string }[];
}) {
  const today = useMemo(() => isoDate(new Date()), []);
  const [from, setFrom] = useState(today);
  const [to, setTo] = useState(monthEnd(today));
  const [typeId, setTypeId] = useState("all");
  const [status, setStatus] = useState("all");

  const rangeInvalid = !from || !to || to < from;
  const window = useMemo(() => {
    if (rangeInvalid) return null;
    return { start: parseDay(from), end: addDays(parseDay(to), 1) };
  }, [from, rangeInvalid, to]);

  const vehicleById = useMemo(() => new Map(vehicles.map((vehicle) => [vehicle.id, vehicle])), [vehicles]);

  const visible = useMemo(() => {
    return bookings.filter((booking) => {
      const vehicle = vehicleById.get(booking.vehicleId);
      if (!vehicle) return false;
      if (typeId !== "all" && vehicle.typeId !== typeId) return false;
      if (status !== "all" && booking.status !== status) return false;
      if (!window) return false;
      return overlaps(booking, window.start, window.end);
    });
  }, [bookings, status, typeId, vehicleById, window]);

  return (
    <div className="grid gap-4">
      <div className="flex items-center gap-3 overflow-x-auto">
        <h1 className="shrink-0 text-xl font-semibold tracking-tight text-navy">Bookings</h1>
        <div className="ml-auto flex shrink-0 items-center gap-3">
          <p className="text-xs text-muted">
            {rangeInvalid ? "Pick a valid date range" : `${visible.length} booking${visible.length === 1 ? "" : "s"}`}
          </p>
          <label className="flex items-center gap-2 text-xs text-muted">
            From
            <input type="date" value={from} onChange={(event) => setFrom(event.target.value)} className="!h-10" />
          </label>
          <label className="flex items-center gap-2 text-xs text-muted">
            To
            <input type="date" value={to} onChange={(event) => setTo(event.target.value)} className="!h-10" />
          </label>
          <SearchableSelect
            ariaLabel="Filter by vehicle type"
            value={typeId}
            onChange={setTypeId}
            searchPlaceholder="Search vehicle types"
            options={[
              { value: "all", label: "All vehicle types" },
              ...types.map((type) => ({ value: type.id, label: type.name })),
            ]}
            className="!h-10"
            wrapperClassName="w-52"
          />
          <SearchableSelect
            ariaLabel="Filter by booking status"
            value={status}
            onChange={setStatus}
            searchPlaceholder="Search statuses"
            options={[
              { value: "all", label: "All statuses" },
              ...bookingStatuses.map((item) => ({ value: item, label: rentalStatusLabel(item) })),
            ]}
            className="!h-10"
            wrapperClassName="w-52"
          />
        </div>
      </div>

      {rangeInvalid ? (
        <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
          The end date has to be on or after the start date.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-line bg-white">
          <table className="w-full min-w-[52rem] border-collapse text-sm">
            <thead className="border-b border-line bg-surface">
              <tr>
                <th scope="col" className="w-16 px-3 py-2.5">
                  <span className="sr-only">Image</span>
                </th>
                <th scope="col" className="px-3 py-2.5 text-left text-xs font-semibold text-navy">
                  Vehicle
                </th>
                <th scope="col" className="px-3 py-2.5 text-left text-xs font-semibold text-navy">
                  Customer
                </th>
                <th scope="col" className="px-3 py-2.5 text-left text-xs font-semibold text-navy">
                  Dates
                </th>
                <th scope="col" className="px-3 py-2.5 text-left text-xs font-semibold text-navy">
                  Status
                </th>
                <th scope="col" className="px-3 py-2.5 text-right text-xs font-semibold text-navy">
                  Due
                </th>
              </tr>
            </thead>
            <tbody>
              {visible.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-3 py-8 text-center text-sm text-muted">
                    No bookings in this range.
                  </td>
                </tr>
              ) : (
                visible.map((booking) => {
                  const vehicle = vehicleById.get(booking.vehicleId);
                  if (!vehicle) return null;
                  return (
                    <tr key={booking.id} className="border-b border-line last:border-b-0">
                      <td className="px-3 py-2">
                        {vehicle.imageUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={vehicle.imageUrl} alt="" className="h-10 w-14 rounded-md border border-line object-cover" />
                        ) : (
                          <div className="h-10 w-14 rounded-md border border-line bg-surface" />
                        )}
                      </td>
                      <td className="px-3 py-2">
                        <Link href={`/admin/rentals/bookings/${booking.id}`} className="font-semibold text-navy hover:text-brand hover:underline">
                          {vehicle.name}
                        </Link>
                        <p className="text-xs font-medium tracking-wide text-navy">{vehicle.registrationNumber}</p>
                        <p className="text-xs text-muted">{booking.reference}</p>
                      </td>
                      <td className="px-3 py-2 text-navy">{booking.contactName}</td>
                      <td className="px-3 py-2 text-navy">{formatRange(booking.pickupAt, booking.returnAt)}</td>
                      <td className="px-3 py-2">
                        <StatusPill status={booking.status} label={rentalStatusLabel(booking.status)} />
                      </td>
                      <td className="px-3 py-2 text-right tabular-nums text-navy">
                        {formatMoney(booking.amountDue, booking.currency)}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
