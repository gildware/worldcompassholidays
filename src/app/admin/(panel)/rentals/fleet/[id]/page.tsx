import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { VehicleCalendar } from "@/components/admin/rentals/VehicleCalendar";
import { VehicleDocuments } from "@/components/admin/rentals/VehicleDocuments";
import { VehicleForm } from "@/components/admin/rentals/VehicleForm";
import { requirePermission } from "@/lib/auth/guards";
import { can } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import { formatDate } from "@/lib/format";
import { expiryState } from "@/lib/rentals/availability";
import { blockingBookingStatuses, fleetKinds } from "@/lib/rentals/labels";
import { configsOf, getRentalSetup } from "@/lib/rentals/setup";

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ step?: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const vehicle = await prisma.vehicle.findUnique({ where: { id } });
  return { title: vehicle?.name ?? "Vehicle" };
}

export default async function EditVehiclePage({ params, searchParams }: Props) {
  const user = await requirePermission("vehicles.view");
  const { id } = await params;
  const { step } = await searchParams;
  const initialStep = Number(step);
  const vehicle = await prisma.vehicle.findUnique({
    where: { id },
    include: {
      images: { orderBy: { sortOrder: "asc" } },
      features: true,
      addonLinks: true,
      locationLinks: true,
      documents: { orderBy: { createdAt: "desc" } },
      blocks: true,
      rentalBookings: {
        where: { status: { in: [...blockingBookingStatuses] } },
        select: { id: true, reference: true, pickupAt: true, returnAt: true, status: true },
      },
    },
  });
  if (!vehicle) notFound();
  const setup = await getRentalSetup();
  const manage = can(user, "vehicles.manage");

  const documents = manage ? (
    <VehicleDocuments
      vehicleId={vehicle.id}
      types={configsOf(setup.configs, "vehicle_document", true)}
      documents={vehicle.documents.map((document) => ({
        id: document.id,
        typeName: document.typeName,
        number: document.number,
        fileUrl: document.fileUrl,
        status: document.status,
        issueDate: document.issueDate ? formatDate(document.issueDate) : "",
        expiryDate: document.expiryDate ? formatDate(document.expiryDate) : "",
        expiry: expiryState(document.expiryDate),
        note: document.note,
      }))}
    />
  ) : (
    <p className="text-sm text-muted">Your role can view this vehicle but not change its documents.</p>
  );

  const calendar = (
    <VehicleCalendar
      vehicleId={vehicle.id}
      events={[
        ...vehicle.rentalBookings.map((booking) => ({
          id: booking.id,
          label: booking.reference,
          kind: "booking" as const,
          start: booking.pickupAt.toISOString(),
          end: booking.returnAt.toISOString(),
          removable: false,
        })),
        ...vehicle.blocks.map((block) => ({
          id: block.id,
          label: block.reason || (block.kind === "maintenance" ? "Maintenance" : "Hold"),
          kind: block.kind === "maintenance" ? ("maintenance" as const) : ("hold" as const),
          start: block.startAt.toISOString(),
          end: block.endAt.toISOString(),
          removable: manage && !block.maintenanceId,
        })),
      ]}
    />
  );

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-hidden">
      <div className="shrink-0">
        <Link href="/admin/rentals/fleet" className="text-xs font-medium text-brand hover:underline">
          ← All vehicles
        </Link>
        <h1 className="mt-1 text-xl font-semibold tracking-tight text-navy">Edit vehicle</h1>
        <p className="mt-0.5 truncate text-xs text-muted">
          {vehicle.name}
          {vehicle.published ? (
            <>
              {" · "}
              <Link href={`/rentals/${vehicle.slug}`} className="font-medium text-brand hover:underline">
                View on the website
              </Link>
            </>
          ) : (
            " · Draft"
          )}
        </p>
      </div>

      {manage ? (
        <VehicleForm
          initialStep={Number.isInteger(initialStep) ? initialStep : 0}
          values={{
            id: vehicle.id,
            name: vehicle.name,
            kind: fleetKinds().includes(vehicle.kind as "car" | "bike") ? (vehicle.kind as "car" | "bike") : "car",
            brand: vehicle.brand,
            modelName: vehicle.modelName,
            year: vehicle.year ? String(vehicle.year) : "",
            summary: vehicle.summary,
            description: vehicle.description,
            destinationId: vehicle.destinationId,
            vehicleTypeId: vehicle.vehicleTypeId ?? "",
            fuelTypeId: vehicle.fuelTypeId ?? "",
            transmissionId: vehicle.transmissionId ?? "",
            seats: String(vehicle.seats),
            doors: vehicle.doors ? String(vehicle.doors) : "",
            luggage: vehicle.luggage ? String(vehicle.luggage) : "",
            includedKmPerDay: String(vehicle.includedKmPerDay),
            status: vehicle.status,
            published: vehicle.published,
            allowCounterPickup: vehicle.allowCounterPickup,
            allowHomeDelivery: vehicle.allowHomeDelivery,
            pricePerDay: String(vehicle.pricePerDay),
            pricePerWeek: String(vehicle.pricePerWeek),
            pricePerMonth: String(vehicle.pricePerMonth),
            securityDeposit: String(vehicle.securityDeposit),
            extraKmCharge: String(vehicle.extraKmCharge),
            lateReturnCharge: String(vehicle.lateReturnCharge),
            discountType: vehicle.discountType,
            discountValue: String(vehicle.discountValue),
            featureIds: vehicle.features.map((feature) => feature.configId),
            addonIds: vehicle.addonLinks.map((addon) => addon.configId),
            locationIds: vehicle.locationLinks.map((link) => link.locationId),
            images: vehicle.images.map((image) => ({
              url: image.url,
              key: image.key,
              driver: image.driver === "cloudinary" ? "cloudinary" : "local",
            })),
          }}
          kinds={fleetKinds()}
          destinations={setup.destinations}
          types={configsOf(setup.configs, "vehicle_type")}
          fuels={configsOf(setup.configs, "fuel")}
          transmissions={configsOf(setup.configs, "transmission")}
          features={configsOf(setup.configs, "feature")}
          addons={configsOf(setup.configs, "addon")}
          locations={setup.locations.filter((location) => location.active)}
          systemPickup={setup.settings.allowCounterPickup}
          systemDelivery={setup.settings.allowHomeDelivery}
          documents={documents}
          calendar={calendar}
        />
      ) : (
        <div className="grid min-h-0 flex-1 gap-6 overflow-y-auto">
          <section className="grid gap-3">
            <h2 className="text-lg font-semibold">Vehicle documents</h2>
            {documents}
          </section>
          <section className="grid gap-3">
            <h2 className="text-lg font-semibold">Availability</h2>
            {calendar}
          </section>
        </div>
      )}
    </div>
  );
}
