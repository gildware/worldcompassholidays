import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { RentalDetailView } from "@/components/rentals/RentalDetailView";
import { modules } from "@/config/modules";
import { prisma } from "@/lib/db";
import { formatDateTime, formatMoney } from "@/lib/format";
import { getCurrentUser } from "@/lib/auth/session";
import { mapApiKey } from "@/lib/map-key";
import { documentsRequiredToBook } from "@/lib/rentals/booking-documents";
import { listProfileDocuments } from "@/lib/rentals/profile-documents";
import { fleetKinds, fleetLabel } from "@/lib/rentals/labels";
import { getRentalSetup } from "@/lib/rentals/setup";
import { JsonLd } from "@/components/seo/JsonLd";
import { findAvailabilityConflicts, handoverModes, unavailableReason, vehicleCanBeBooked } from "@/lib/rentals/availability";
import { parseDateTimeLocal, resolvePickupLocal, resolveReturnLocal } from "@/lib/rentals/dates";
import { quoteRental } from "@/lib/rentals/pricing";
import {
  absoluteUrl,
  breadcrumbNode,
  graphLd,
  offerNode,
  organizationNode,
  pageMetadata,
  plainText,
  privateMetadata,
} from "@/lib/seo";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function one(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const vehicle = await prisma.vehicle.findUnique({
    where: { slug },
    select: {
      name: true,
      summary: true,
      description: true,
      kind: true,
      published: true,
      destination: { select: { name: true } },
      images: { orderBy: { sortOrder: "asc" }, take: 1, select: { url: true } },
    },
  });
  if (!vehicle?.published) return privateMetadata("Rental");
  const noun = vehicle.kind === "bike" ? "bike rental" : "car rental";
  const title = vehicle.name.toLowerCase().includes("rental") ? vehicle.name : `${vehicle.name} ${noun}`;
  const place = vehicle.destination?.name;
  return pageMetadata({
    title,
    description:
      vehicle.summary.trim() ||
      plainText(vehicle.description) ||
      `${vehicle.name} for rent${place ? ` in ${place}` : ""}. Daily rate, seats, and pickup details.`,
    path: `/rentals/${slug}`,
    image: vehicle.images[0]?.url,
    imageAlt: vehicle.name,
  });
}

export default async function RentalDetailPage({ params, searchParams }: Props) {
  if (!modules.cars && !modules.bikes) notFound();
  const { slug } = await params;
  const query = await searchParams;
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
      relatedLinks: {
        orderBy: { sortOrder: "asc" },
        include: {
          related: {
            include: {
              images: { orderBy: { sortOrder: "asc" }, take: 1 },
              vehicleType: { select: { name: true } },
              transmission: { select: { name: true } },
              fuelType: { select: { name: true } },
            },
          },
        },
      },
    },
  });
  const kinds = fleetKinds();
  if (!vehicle || !vehicle.published || !kinds.includes(vehicle.kind as "car" | "bike")) {
    notFound();
  }

  const [setup, user] = await Promise.all([
    getRentalSetup(vehicle.kind === "bike" ? "bike" : "car"),
    getCurrentUser(),
  ]);
  const profile =
    user?.scope === "customer"
      ? await prisma.user.findUnique({
          where: { id: user.id },
          select: { address: true, mapLat: true, mapLng: true },
        })
      : null;
  const modes = handoverModes({
    systemPickup: setup.settings.allowCounterPickup,
    systemDelivery: setup.settings.allowHomeDelivery,
    vehiclePickup: vehicle.allowCounterPickup,
    vehicleDelivery: vehicle.allowHomeDelivery,
  });
  const chosen = vehicle.features
    .map((feature) => feature.config)
    .filter((feature) => feature.active)
    .sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name));
  const features = chosen.filter((feature) => feature.kind === "included" || feature.kind === "feature");
  const excluded = chosen.filter((feature) => feature.kind === "excluded");
  const addons = vehicle.addonLinks
    .map((link) => link.config)
    .filter((addon) => addon.active);
  const locations =
    vehicle.locationLinks.length > 0
      ? vehicle.locationLinks.map((link) => link.location).filter((location) => location.active)
      : setup.locations.filter((location) => location.active);
  const rules = setup.policies.filter((policy) => policy.kind === "rule" && policy.active);
  const cancellations = setup.policies.filter((policy) => policy.kind === "cancellation" && policy.active);

  const fact = (
    label: string,
    value: string | null | undefined,
    icon: "brand" | "pin" | "calendar" | "specs" | "seat" | "gear" | "fuel" | "road",
  ) => (value ? [{ label, value, icon }] : []);
  const vehicleFacts = [
    ...fact("Brand", vehicle.brand, "brand"),
    ...fact("Model", vehicle.modelName, "brand"),
    ...fact("Year", vehicle.year ? String(vehicle.year) : "", "calendar"),
    ...fact("Available in", vehicle.destination.name, "pin"),
  ];
  const specFacts = [
    ...fact("Type", vehicle.vehicleType?.name, "specs"),
    ...fact("Seats", String(vehicle.seats), "seat"),
    ...fact("Transmission", vehicle.transmission?.name, "gear"),
    ...fact("Fuel", vehicle.fuelType?.name, "fuel"),
    ...fact("Doors", vehicle.doors ? String(vehicle.doors) : "", "specs"),
    ...fact("Luggage", vehicle.luggage ? String(vehicle.luggage) : "", "specs"),
    ...fact(
      "Km included",
      vehicle.includedKmPerDay > 0 ? `${vehicle.includedKmPerDay} / day` : "Unlimited",
      "road",
    ),
  ];
  const pickup = one(query.pickup);
  const ret = one(query.return);
  const placeQuery = one(query.q).trim();
  const pickupAt = parseDateTimeLocal(pickup);
  const returnAt = parseDateTimeLocal(ret);
  const bookingPickup = resolvePickupLocal(pickup);
  const bookingReturn = resolveReturnLocal(bookingPickup, ret);
  const currency = vehicle.currency || "INR";
  let quote: ReturnType<typeof quoteRental> | null = null;
  if (pickupAt && returnAt && returnAt > pickupAt && vehicle.pricePerDay >= 1) {
    try {
      quote = quoteRental({
        pickupAt,
        returnAt,
        pricePerDay: vehicle.pricePerDay,
        pricePerWeek: vehicle.pricePerWeek,
        pricePerMonth: vehicle.pricePerMonth,
        securityDeposit: vehicle.securityDeposit,
        extraKmCharge: vehicle.extraKmCharge,
        lateReturnCharge: vehicle.lateReturnCharge,
        includedKmPerDay: vehicle.includedKmPerDay,
        discountType: vehicle.discountType,
        discountValue: vehicle.discountValue,
        taxPercent: setup.settings.taxPercent,
        currency,
        addons: [],
      });
    } catch {
      quote = null;
    }
  }

  const namedPlace = locations.find(
    (location) => location.name.toLowerCase() === placeQuery.toLowerCase(),
  );
  const place = placeQuery || locations[0]?.name || vehicle.destination.name;
  const placeDetail = namedPlace?.address || (!placeQuery ? locations[0]?.address || "" : "");
  const conflicts =
    pickupAt && returnAt
      ? await findAvailabilityConflicts({ vehicleId: vehicle.id, pickupAt, returnAt })
      : { bookings: [], blocks: [] };
  const blocked = unavailableReason({
    status: vehicle.status,
    bookings: conflicts.bookings,
    blocks: conflicts.blocks,
  });
  const available = vehicleCanBeBooked(vehicle.status) && !blocked;
  const availabilityNote = !pickupAt || !returnAt
    ? vehicleCanBeBooked(vehicle.status)
      ? "Add dates to check this trip"
      : blocked || "Not available to book"
    : available
      ? "Available for these dates"
      : blocked || "Not available for these dates";

  const kept = new URLSearchParams();
  if (pickup) kept.set("pickup", pickup);
  if (ret) kept.set("return", ret);
  if (placeQuery) kept.set("q", placeQuery);
  if (namedPlace) kept.set("location", namedPlace.id);
  const keptQuery = kept.toString();
  const path = `/rentals/${vehicle.slug}`;
  const fleetHref = vehicle.kind === "bike" ? "/rentals/bikes" : "/rentals/cars";
  const backHref = keptQuery ? `${fleetHref}?${keptQuery}` : fleetHref;
  const money = (amount: number) => (amount > 0 ? formatMoney(amount, currency) : "Not set");
  const prices = [
    { label: "Daily price", value: formatMoney(vehicle.pricePerDay, currency) },
    { label: "Weekly price", value: vehicle.pricePerWeek > 0 ? formatMoney(vehicle.pricePerWeek, currency) : "Billed at the daily rate" },
    { label: "Monthly price", value: vehicle.pricePerMonth > 0 ? formatMoney(vehicle.pricePerMonth, currency) : "Billed at the daily rate" },
    { label: "Security deposit", value: money(vehicle.securityDeposit) },
    ...(vehicle.extraKmCharge > 0
      ? [{ label: "Per extra km", value: formatMoney(vehicle.extraKmCharge, currency) }]
      : []),
    ...(vehicle.lateReturnCharge > 0
      ? [{ label: "Late return", value: `${formatMoney(vehicle.lateReturnCharge, currency)} / hour` }]
      : []),
    ...(vehicle.discountType === "percent" && vehicle.discountValue > 0
      ? [{ label: "Discount", value: `${vehicle.discountValue}% off the base rental` }]
      : []),
    ...(vehicle.discountType === "flat" && vehicle.discountValue > 0
      ? [{ label: "Discount", value: `${formatMoney(vehicle.discountValue, currency)} off the base rental` }]
      : []),
  ];
  const documents = documentsRequiredToBook(
    vehicle.kind,
    chosen,
    setup.configs,
  );
  const savedDocuments =
    user?.scope === "customer" ? await listProfileDocuments(user.id) : [];
  const description =
    vehicle.summary.trim() ||
    plainText(vehicle.description) ||
    `${vehicle.name} for rent in ${vehicle.destination.name}.`;

  return (
    <>
      <JsonLd
        data={graphLd([
          organizationNode(),
          breadcrumbNode([
            { name: "Home", path: "/" },
            { name: `${fleetLabel(vehicle.kind)} rental`, path: fleetHref },
            { name: vehicle.name, path },
          ]),
          {
            "@type": vehicle.kind === "bike" ? "Motorcycle" : "Car",
            name: vehicle.name,
            description,
            url: absoluteUrl(path),
            ...(vehicle.images[0]?.url ? { image: absoluteUrl(vehicle.images[0].url) } : {}),
            ...(vehicle.brand ? { brand: { "@type": "Brand", name: vehicle.brand } } : {}),
            vehicleSeatingCapacity: vehicle.seats,
            offers: offerNode({
              price: vehicle.pricePerDay,
              currency: vehicle.currency || "INR",
              path,
              unitText: "DAY",
              availability: vehicle.status === "available" ? "InStock" : "OutOfStock",
            }),
          },
        ])}
      />
      <RentalDetailView
        name={vehicle.name}
        summary={vehicle.summary}
        description={vehicle.description}
        kindLabel={[vehicle.brand, vehicle.vehicleType?.name || fleetLabel(vehicle.kind)].filter(Boolean).join(" · ")}
        vehicleFacts={vehicleFacts}
        specFacts={specFacts}
        images={vehicle.images.map((image) => ({ id: image.id, url: image.url }))}
        included={features.map((feature) => ({ id: feature.id, name: feature.name }))}
        excluded={excluded.map((feature) => ({ id: feature.id, name: feature.name }))}
        prices={prices}
        handover={{
          counter: modes.counter,
          delivery: modes.delivery,
          locations: locations.map((location) => ({
            id: location.id,
            name: location.name,
            address: location.address,
          })),
        }}
        rules={[...rules, ...cancellations].map((rule) => ({
          id: rule.id,
          name: rule.name,
          description: rule.description,
        }))}
        addons={addons.map((addon) => ({
          id: addon.id,
          name: addon.name,
          price: addon.price,
          priceUnit: addon.priceUnit,
        }))}
        currency={currency}
        pricePerDay={vehicle.pricePerDay}
        securityDeposit={vehicle.securityDeposit}
        extraKmCharge={vehicle.extraKmCharge}
        lateReturnCharge={vehicle.lateReturnCharge}
        includedKmPerDay={vehicle.includedKmPerDay}
        quote={quote}
        pickupLabel={pickupAt ? formatDateTime(pickupAt) : ""}
        returnLabel={returnAt ? formatDateTime(returnAt) : ""}
        place={modes.counter ? place : ""}
        placeDetail={placeDetail}
        deliveryNote={
          modes.delivery
            ? "Home delivery is available."
            : !modes.counter
              ? "Handover is not configured yet."
              : ""
        }
        fleetHref={fleetHref}
        fleetName={`${fleetLabel(vehicle.kind)} rental`}
        backHref={backHref}
        available={available}
        availabilityNote={availabilityNote}
        relatedTitle={vehicle.kind === "bike" ? "Related bikes" : "Related cars"}
        related={vehicle.relatedLinks
          .map((link) => link.related)
          .filter((item) => item.published && item.kind === vehicle.kind)
          .map((item) => ({
            slug: item.slug,
            name: item.name,
            typeName: item.vehicleType?.name || "",
            meta: [
              item.seats ? `${item.seats} seats` : "",
              item.transmission?.name || "",
              item.fuelType?.name || "",
            ]
              .filter(Boolean)
              .join(" · "),
            priceLabel: formatMoney(item.pricePerDay, item.currency || currency),
            imageUrl: item.images[0]?.url || "",
            href: keptQuery ? `/rentals/${item.slug}?${keptQuery}` : `/rentals/${item.slug}`,
          }))}
        booking={{
          slug: vehicle.slug,
          vehicleId: vehicle.id,
          vehicleName: vehicle.name,
          currency,
          pricePerDay: vehicle.pricePerDay,
          signedIn: user?.scope === "customer",
          rider:
            user?.scope === "customer"
              ? { name: user.name, phone: user.phone }
              : null,
          loginHref: `/login?next=${encodeURIComponent(`/rentals/${vehicle.slug}`)}`,
          counter: modes.counter,
          delivery: modes.delivery,
          locations: locations.map((location) => ({
            id: location.id,
            name: location.name,
            address: location.address,
          })),
          addons: addons.map((addon) => ({
            id: addon.id,
            name: addon.name,
            price: addon.price,
            priceUnit: addon.priceUnit,
          })),
          documents: documents.map((item) => ({
            id: item.id,
            name: item.name,
            description: item.description,
            requiresNumber: item.requiresNumber,
            requiresIssueDate: item.requiresIssueDate,
            requiresExpiry: item.requiresExpiry,
          })),
          savedDocuments: savedDocuments.filter((item) => documents.some((document) => document.id === item.configId)),
          defaultPickup: bookingPickup,
          defaultReturn: bookingReturn,
          defaultLocationId: namedPlace?.id || locations[0]?.id || "",
          mapApiKey: mapApiKey(),
          savedAddress: profile?.address ?? "",
          savedLat: profile?.mapLat ?? "",
          savedLng: profile?.mapLng ?? "",
        }}
      />
    </>
  );
}
