import Link from "next/link";
import { formatMoney } from "@/lib/format";
import { fleetLabel, rentalStatusLabel, vehicleStatusLabel } from "@/lib/rentals/labels";

export type VehicleCardData = {
  slug: string;
  name: string;
  kind: string;
  typeName: string;
  seats: number;
  transmission: string;
  fuel: string;
  features: string[];
  pricePerDay: number;
  currency: string;
  imageUrl: string;
  availability: string;
  bookable: boolean;
  bookHref: string;
};

export function VehicleCard({ vehicle }: { vehicle: VehicleCardData }) {
  return (
    <article className="flex h-full flex-col overflow-hidden rounded-2xl border border-line bg-white">
      {vehicle.imageUrl ? (
        // Uploads may be local files or Cloudinary URLs.
        // eslint-disable-next-line @next/next/no-img-element
        <img src={vehicle.imageUrl} alt="" className="h-44 w-full object-cover" />
      ) : (
        <div className="flex h-44 items-center justify-center bg-surface text-sm text-muted">
          No photo yet
        </div>
      )}
      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-medium tracking-wide text-brand uppercase">
              {fleetLabel(vehicle.kind)}
              {vehicle.typeName ? ` · ${vehicle.typeName}` : ""}
            </p>
            <h2 className="mt-1 text-lg font-semibold">{vehicle.name}</h2>
          </div>
          <p className="text-right text-sm">
            <span className="font-semibold">{formatMoney(vehicle.pricePerDay, vehicle.currency)}</span>
            <span className="text-muted"> / day</span>
          </p>
        </div>
        <p className="mt-3 text-sm text-muted">
          {vehicle.seats} seats
          {vehicle.transmission ? ` · ${vehicle.transmission}` : ""}
          {vehicle.fuel ? ` · ${vehicle.fuel}` : ""}
        </p>
        {vehicle.features.length > 0 ? (
          <ul className="mt-3 flex flex-wrap gap-1.5">
            {vehicle.features.slice(0, 3).map((feature) => (
              <li key={feature} className="rounded-full bg-surface px-2.5 py-1 text-xs text-navy">
                {feature}
              </li>
            ))}
          </ul>
        ) : null}
        <p className="mt-4 text-sm font-medium">
          {vehicle.availability}
        </p>
        <div className="mt-4 flex gap-2">
          <Link
            href={`/rentals/${vehicle.slug}`}
            className="inline-flex h-10 flex-1 items-center justify-center rounded-lg border border-line text-sm font-medium"
          >
            View details
          </Link>
          {vehicle.bookable ? (
            <Link
              href={vehicle.bookHref}
              className="inline-flex h-10 flex-1 items-center justify-center rounded-lg bg-brand text-sm font-medium text-white"
            >
              Book now
            </Link>
          ) : (
            <span className="inline-flex h-10 flex-1 items-center justify-center rounded-lg bg-surface text-sm text-muted">
              Unavailable
            </span>
          )}
        </div>
      </div>
    </article>
  );
}

export function StatusPill({ status, label }: { status: string; label?: string }) {
  const tone =
    status === "available" || status === "confirmed" || status === "completed" || status === "paid" || status === "verified"
      ? "bg-emerald-50 text-emerald-800"
      : status === "active" || status === "ready_for_pickup" || status === "documents_under_review"
        ? "bg-brand-soft text-brand"
        : status === "cancelled" || status === "rejected" || status === "inactive" || status === "failed" || status === "expired"
          ? "bg-red-50 text-red-700"
          : "bg-amber-50 text-amber-800";

  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${tone}`}>
      {label ??
        (rentalStatusLabel(status) !== status
          ? rentalStatusLabel(status)
          : vehicleStatusLabel(status))}
    </span>
  );
}
