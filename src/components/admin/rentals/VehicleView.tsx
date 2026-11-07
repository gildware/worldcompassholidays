import Link from "next/link";
import type { ReactNode } from "react";
import { StatusPill } from "@/components/rentals/VehicleCard";
import { Badge } from "@/components/ui/Card";
import { ButtonLink } from "@/components/ui/Button";
import { formatDate, formatMoney } from "@/lib/format";
import { fleetLabel, rentalStatusLabel, vehicleStatusLabel } from "@/lib/rentals/labels";

export type VehicleViewBooking = {
  id: string;
  reference: string;
  status: string;
  contactName: string;
  pickupAt: string;
  returnAt: string;
  amountDue: number;
  currency: string;
};

export type VehicleViewData = {
  id: string;
  slug: string;
  name: string;
  registrationNumber: string;
  kind: string;
  brand: string;
  modelName: string;
  year: number | null;
  summary: string;
  description: string;
  typeName: string;
  transmission: string;
  fuel: string;
  seats: number;
  doors: number | null;
  luggage: number | null;
  includedKmPerDay: number;
  pricePerDay: number;
  pricePerWeek: number;
  pricePerMonth: number;
  securityDeposit: number;
  currency: string;
  status: string;
  published: boolean;
  allowCounterPickup: boolean;
  allowHomeDelivery: boolean;
  destinationName: string;
  locations: string[];
  features: string[];
  tags: string[];
  included: string[];
  excluded: string[];
  addons: { name: string; price: number; priceUnit: string }[];
  images: string[];
  bookings: VehicleViewBooking[];
};

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <dt className="text-[11px] font-medium uppercase tracking-wide text-muted">{label}</dt>
      <dd className="mt-0.5 truncate text-sm font-semibold text-navy">{value || "—"}</dd>
    </div>
  );
}

function ChipList({ items }: { items: string[] }) {
  return (
    <ul className="flex flex-wrap gap-1.5">
      {items.map((item) => (
        <li key={item} className="rounded-md border border-line bg-surface px-2 py-0.5 text-xs text-navy">
          {item}
        </li>
      ))}
    </ul>
  );
}

function Section({
  title,
  children,
  className = "",
}: {
  title: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`rounded-xl border border-line bg-white p-3 sm:p-4 ${className}`}>
      <h2 className="text-xs font-semibold uppercase tracking-wide text-muted">{title}</h2>
      <div className="mt-2">{children}</div>
    </section>
  );
}

function looksLikeHtml(value: string) {
  return /<\/?[a-z][\s\S]*>/i.test(value);
}

export function VehicleView({
  vehicle,
  canManage,
}: {
  vehicle: VehicleViewData;
  canManage: boolean;
}) {
  const noun = vehicle.kind === "bike" ? "bike" : "car";
  const listHref = vehicle.kind === "bike" ? "/admin/rentals/bikes" : "/admin/rentals/cars";
  const cover = vehicle.images[0] ?? "";
  const makeModel =
    [vehicle.brand, vehicle.modelName, vehicle.year].filter(Boolean).join(" ") || "—";
  const pickup = [
    vehicle.allowCounterPickup ? "Counter" : null,
    vehicle.allowHomeDelivery ? "Delivery" : null,
  ]
    .filter(Boolean)
    .join(" · ");
  const locations =
    vehicle.locations.length > 0
      ? vehicle.locations
      : vehicle.destinationName
        ? [vehicle.destinationName]
        : [];
  const money = (amount: number) =>
    amount > 0 ? formatMoney(amount, vehicle.currency) : "—";
  const description = vehicle.description.trim();
  const descriptionIsHtml = looksLikeHtml(description);

  const headerLists = [
    { title: "Locations", items: locations },
    { title: "Features", items: vehicle.features },
    { title: "Included", items: vehicle.included },
  ].filter((block) => block.items.length > 0);

  const detailBlocks = [
    { title: "Tags", items: vehicle.tags },
    { title: "Not included", items: vehicle.excluded },
  ].filter((block) => block.items.length > 0);

  return (
    <div className="grid gap-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Link href={listHref} className="text-xs font-medium text-brand hover:underline">
          ← All {noun}s
        </Link>
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone={vehicle.published ? "success" : "warning"}>
            {vehicle.published ? "Published" : "Draft"}
          </Badge>
          <Badge tone="neutral">{vehicleStatusLabel(vehicle.status)}</Badge>
          {vehicle.published ? (
            <ButtonLink
              href={`/rentals/${vehicle.slug}`}
              variant="secondary"
              size="sm"
              target="_blank"
              rel="noopener noreferrer"
            >
              View on website
            </ButtonLink>
          ) : null}
          {canManage ? (
            <ButtonLink href={`/admin/rentals/fleet/${vehicle.id}`} size="sm">
              Edit
            </ButtonLink>
          ) : null}
        </div>
      </div>

      <section className="rounded-xl border border-line bg-white p-3 sm:p-4">
        <div className="grid gap-4 lg:grid-cols-[15rem_minmax(0,1fr)] lg:items-start">
          <div className="overflow-hidden rounded-lg border border-line bg-surface">
            {cover ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={cover} alt="" className="aspect-[4/3] w-full object-contain p-2" />
            ) : (
              <div className="flex aspect-[4/3] items-center justify-center text-sm text-muted">
                No photo
              </div>
            )}
          </div>

          <div className="min-w-0">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[11px] font-medium tracking-wide text-brand uppercase">
                  {fleetLabel(vehicle.kind)}
                  {vehicle.typeName ? ` · ${vehicle.typeName}` : ""}
                </p>
                <h1 className="mt-1 text-xl font-semibold tracking-tight text-navy sm:text-2xl">
                  {vehicle.name}
                </h1>
                <p className="mt-1 text-sm text-muted">
                  {[
                    vehicle.destinationName,
                    vehicle.registrationNumber,
                    makeModel !== "—" && makeModel !== vehicle.name ? makeModel : null,
                  ]
                    .filter(Boolean)
                    .join(" · ")}
                </p>
              </div>
              <div className="text-right">
                <p className="text-lg font-semibold text-navy">
                  {formatMoney(vehicle.pricePerDay, vehicle.currency)}
                </p>
                <p className="text-xs text-muted">per day</p>
              </div>
            </div>

            {vehicle.summary ? (
              <p className="mt-2 line-clamp-2 text-sm leading-6 text-navy">{vehicle.summary}</p>
            ) : null}

            <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2.5 border-t border-line pt-3 sm:grid-cols-4 lg:grid-cols-4 xl:grid-cols-8">
              <Fact label="Week" value={money(vehicle.pricePerWeek)} />
              <Fact label="Month" value={money(vehicle.pricePerMonth)} />
              <Fact label="Deposit" value={money(vehicle.securityDeposit)} />
              <Fact label="Seats" value={String(vehicle.seats)} />
              <Fact label="Doors" value={vehicle.doors != null ? String(vehicle.doors) : "—"} />
              <Fact label="Luggage" value={vehicle.luggage != null ? String(vehicle.luggage) : "—"} />
              <Fact
                label="Km / day"
                value={vehicle.includedKmPerDay ? String(vehicle.includedKmPerDay) : "—"}
              />
              <Fact label="Gearbox" value={vehicle.transmission || "—"} />
              <Fact label="Fuel" value={vehicle.fuel || "—"} />
              <Fact label="Pickup" value={pickup || "—"} />
              <Fact label="Slug" value={vehicle.slug || "—"} />
              <Fact label="Currency" value={vehicle.currency || "—"} />
            </dl>

            {headerLists.length > 0 ? (
              <div className="mt-3 grid gap-3 border-t border-line pt-3 sm:grid-cols-2 lg:grid-cols-3">
                {headerLists.map((block) => (
                  <div key={block.title} className="min-w-0">
                    <h2 className="text-[11px] font-medium uppercase tracking-wide text-muted">
                      {block.title}
                    </h2>
                    <div className="mt-1.5">
                      <ChipList items={block.items} />
                    </div>
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        </div>
      </section>

      <div
        className={
          vehicle.addons.length > 0
            ? "grid gap-3 lg:grid-cols-[minmax(0,1fr)_17rem] lg:items-start"
            : "grid gap-3"
        }
      >
        <div className="grid gap-3">
          {description ? (
            <Section title="Description">
              {descriptionIsHtml ? (
                <div
                  className="prose prose-sm max-w-none text-sm text-navy [&_p]:my-2 [&_p:first-child]:mt-0 [&_p:last-child]:mb-0"
                  dangerouslySetInnerHTML={{ __html: description }}
                />
              ) : (
                <p className="whitespace-pre-wrap text-sm leading-6 text-navy">{description}</p>
              )}
            </Section>
          ) : null}

          {vehicle.images.length > 0 ? (
            <Section title={`Photos · ${vehicle.images.length}`}>
              <ul className="grid grid-cols-3 gap-1.5 sm:grid-cols-4 md:grid-cols-6">
                {vehicle.images.map((url) => (
                  <li key={url} className="overflow-hidden rounded-md border border-line bg-surface">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={url} alt="" className="aspect-[4/3] w-full object-contain p-1" />
                  </li>
                ))}
              </ul>
            </Section>
          ) : null}

          <Section title={`Bookings · ${vehicle.bookings.length}`}>
            {vehicle.bookings.length === 0 ? (
              <p className="text-sm text-muted">No bookings for this {noun} yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="border-b border-line text-left">
                      <th scope="col" className="pb-2 pr-3 text-xs font-semibold text-navy">
                        Reference
                      </th>
                      <th scope="col" className="pb-2 pr-3 text-xs font-semibold text-navy">
                        Guest
                      </th>
                      <th scope="col" className="pb-2 pr-3 text-xs font-semibold text-navy">
                        Dates
                      </th>
                      <th scope="col" className="pb-2 pr-3 text-xs font-semibold text-navy">
                        Status
                      </th>
                      <th scope="col" className="pb-2 text-right text-xs font-semibold text-navy">
                        Due
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {vehicle.bookings.map((booking) => (
                      <tr key={booking.id} className="border-b border-line last:border-b-0">
                        <td className="py-2.5 pr-3">
                          <Link
                            href={`/admin/rentals/bookings/${booking.id}`}
                            className="font-semibold text-navy hover:text-brand hover:underline"
                          >
                            {booking.reference}
                          </Link>
                        </td>
                        <td className="py-2.5 pr-3 text-navy">{booking.contactName || "—"}</td>
                        <td className="py-2.5 pr-3 text-navy">
                          {formatDate(new Date(booking.pickupAt))} –{" "}
                          {formatDate(new Date(booking.returnAt))}
                        </td>
                        <td className="py-2.5 pr-3">
                          <StatusPill status={booking.status} label={rentalStatusLabel(booking.status)} />
                        </td>
                        <td className="py-2.5 text-right tabular-nums text-navy">
                          {formatMoney(booking.amountDue, booking.currency)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Section>

          {detailBlocks.length > 0 ? (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {detailBlocks.map((block) => (
                <Section key={block.title} title={block.title}>
                  <ChipList items={block.items} />
                </Section>
              ))}
            </div>
          ) : null}
        </div>

        {vehicle.addons.length > 0 ? (
          <aside>
            <Section title="Add-ons">
              <ul className="divide-y divide-line">
                {vehicle.addons.map((addon) => (
                  <li
                    key={addon.name}
                    className="flex items-start justify-between gap-3 py-2 first:pt-0 last:pb-0"
                  >
                    <span className="text-sm font-medium text-navy">{addon.name}</span>
                    <span className="shrink-0 text-xs text-muted">
                      {addon.price > 0
                        ? `${formatMoney(addon.price, vehicle.currency)}${
                            addon.priceUnit ? ` / ${addon.priceUnit}` : ""
                          }`
                        : "Included"}
                    </span>
                  </li>
                ))}
              </ul>
            </Section>
          </aside>
        ) : null}
      </div>
    </div>
  );
}
