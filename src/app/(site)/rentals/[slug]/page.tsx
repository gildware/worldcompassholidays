import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { modules } from "@/config/modules";
import { prisma } from "@/lib/db";
import { formatMoney } from "@/lib/format";
import { fleetKinds, fleetLabel } from "@/lib/rentals/labels";
import { getRentalSetup } from "@/lib/rentals/setup";
import { handoverModes } from "@/lib/rentals/availability";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const vehicle = await prisma.vehicle.findUnique({ where: { slug } });
  return { title: vehicle?.name ?? "Rental" };
}

export default async function RentalDetailPage({ params }: Props) {
  if (!modules.cars && !modules.bikes) notFound();
  const { slug } = await params;
  const vehicle = await prisma.vehicle.findUnique({
    where: { slug },
    include: {
      images: { orderBy: { sortOrder: "asc" } },
      vehicleType: true,
      fuelType: true,
      transmission: true,
      destination: true,
      features: { include: { config: true } },
      addonLinks: { include: { config: true } },
      locationLinks: { include: { location: true } },
    },
  });
  const kinds = fleetKinds();
  if (!vehicle || !vehicle.published || !kinds.includes(vehicle.kind as "car" | "bike")) {
    notFound();
  }

  const setup = await getRentalSetup();
  const modes = handoverModes({
    systemPickup: setup.settings.allowCounterPickup,
    systemDelivery: setup.settings.allowHomeDelivery,
    vehiclePickup: vehicle.allowCounterPickup,
    vehicleDelivery: vehicle.allowHomeDelivery,
  });
  const features = vehicle.features
    .map((feature) => feature.config)
    .filter((feature) => feature.active)
    .sort((a, b) => a.sortOrder - b.sortOrder);
  const addons = vehicle.addonLinks
    .map((link) => link.config)
    .filter((addon) => addon.active);
  const locations =
    vehicle.locationLinks.length > 0
      ? vehicle.locationLinks.map((link) => link.location).filter((location) => location.active)
      : setup.locations.filter((location) => location.active);
  const rules = setup.policies.filter((policy) => policy.kind === "rule" && policy.active);
  const cancellations = setup.policies.filter((policy) => policy.kind === "cancellation" && policy.active);

  const facts = [
    ["Type", vehicle.vehicleType?.name],
    ["Fleet", fleetLabel(vehicle.kind)],
    ["Seats", String(vehicle.seats)],
    ["Transmission", vehicle.transmission?.name],
    ["Fuel", vehicle.fuelType?.name],
    ["Doors", vehicle.doors ? String(vehicle.doors) : ""],
    ["Luggage", vehicle.luggage ? String(vehicle.luggage) : ""],
    ["Destination", vehicle.destination.name],
    ["Included km / day", vehicle.includedKmPerDay > 0 ? String(vehicle.includedKmPerDay) : "Unlimited"],
  ].filter((item) => item[1]);

  return (
    <div className="mx-auto grid max-w-6xl gap-8 px-5 py-10 lg:grid-cols-[1.4fr_0.8fr]">
      <div>
        <p className="text-sm font-medium text-brand uppercase">{fleetLabel(vehicle.kind)}</p>
        <h1 className="mt-2 text-3xl font-semibold">{vehicle.name}</h1>
        {vehicle.summary ? <p className="mt-3 text-muted">{vehicle.summary}</p> : null}
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          {vehicle.images.length === 0 ? (
            <div className="flex h-64 items-center justify-center rounded-2xl bg-surface text-sm text-muted sm:col-span-2">
              No photos yet
            </div>
          ) : (
            vehicle.images.map((image) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={image.id} src={image.url} alt="" className="h-64 w-full rounded-2xl object-cover" />
            ))
          )}
        </div>
        <dl className="mt-8 grid gap-3 sm:grid-cols-2">
          {facts.map(([label, value]) => (
            <div key={label} className="rounded-xl border border-line px-4 py-3">
              <dt className="text-xs text-muted">{label}</dt>
              <dd className="mt-1 font-medium">{value}</dd>
            </div>
          ))}
        </dl>
        {vehicle.description ? (
          <p className="mt-6 whitespace-pre-wrap text-sm leading-6">{vehicle.description}</p>
        ) : null}
        {features.length > 0 ? (
          <section className="mt-8">
            <h2 className="text-lg font-semibold">Features</h2>
            <ul className="mt-3 flex flex-wrap gap-2">
              {features.map((feature) => (
                <li key={feature.id} className="rounded-full bg-surface px-3 py-1.5 text-sm">
                  {feature.name}
                </li>
              ))}
            </ul>
          </section>
        ) : null}
        <section className="mt-8">
          <h2 className="text-lg font-semibold">Rental rules</h2>
          <ul className="mt-3 grid gap-3">
            {rules.map((rule) => (
              <li key={rule.id} className="rounded-xl border border-line px-4 py-3 text-sm">
                <p className="font-medium">{rule.name}</p>
                <p className="mt-1 text-muted">{rule.description}</p>
              </li>
            ))}
            {cancellations.map((rule) => (
              <li key={rule.id} className="rounded-xl border border-line px-4 py-3 text-sm">
                <p className="font-medium">{rule.name}</p>
                <p className="mt-1 text-muted">{rule.description}</p>
              </li>
            ))}
          </ul>
        </section>
      </div>
      <aside className="h-fit rounded-2xl border border-line bg-white p-5">
        <p className="text-2xl font-semibold">
          {formatMoney(vehicle.pricePerDay, vehicle.currency)}
          <span className="text-base font-normal text-muted"> / day</span>
        </p>
        <ul className="mt-4 grid gap-2 text-sm text-muted">
          {vehicle.pricePerWeek > 0 ? <li>Weekly {formatMoney(vehicle.pricePerWeek, vehicle.currency)}</li> : null}
          {vehicle.pricePerMonth > 0 ? <li>Monthly {formatMoney(vehicle.pricePerMonth, vehicle.currency)}</li> : null}
          <li>Security deposit {formatMoney(vehicle.securityDeposit, vehicle.currency)}</li>
          <li>Extra km {formatMoney(vehicle.extraKmCharge, vehicle.currency)}</li>
          <li>Late return {formatMoney(vehicle.lateReturnCharge, vehicle.currency)} / hour</li>
          {setup.settings.taxPercent > 0 ? <li>Tax {setup.settings.taxPercent}% on the rental</li> : null}
        </ul>
        {addons.length > 0 ? (
          <ul className="mt-4 grid gap-1 text-sm">
            {addons.map((addon) => (
              <li key={addon.id}>
                {addon.name} · {formatMoney(addon.price, vehicle.currency)}
                {addon.priceUnit === "per_day" ? " / day" : ""}
              </li>
            ))}
          </ul>
        ) : null}
        <div className="mt-4 text-sm">
          {modes.counter ? <p>Pickup at: {locations.map((location) => location.name).join(", ") || "a rental desk"}</p> : null}
          {modes.delivery ? <p>Home delivery is available for this vehicle.</p> : null}
          {!modes.counter && !modes.delivery ? <p>Handover is not configured yet.</p> : null}
        </div>
        <Link
          href={`/rentals/${vehicle.slug}/book`}
          className="mt-5 inline-flex h-11 w-full items-center justify-center rounded-lg bg-brand text-sm font-medium text-white"
        >
          Book now
        </Link>
        <Link href="/rentals" className="mt-3 inline-flex w-full justify-center text-sm text-brand">
          Back to search
        </Link>
      </aside>
    </div>
  );
}
