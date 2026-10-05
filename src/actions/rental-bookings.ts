"use server";

import { isRedirectError } from "next/dist/client/components/redirect-error";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import type { FormState } from "@/lib/forms";
import { requireCustomer, requirePermission } from "@/lib/auth/guards";
import { can, getCurrentUser } from "@/lib/auth/session";
import { handoverModes, cancellationRefund } from "@/lib/rentals/availability";
import { parseDateTimeLocal, rentalReference } from "@/lib/rentals/dates";
import {
  blockingBookingStatuses,
  bookingTransitions,
  customerCancelStatuses,
  paymentMethods,
} from "@/lib/rentals/labels";
import { extraReturnCharges, quoteRental, type RentalQuote } from "@/lib/rentals/pricing";
import { deleteDocument } from "@/lib/storage/documents";

function fail(error: unknown): FormState {
  if (error instanceof Error && error.message) return { error: error.message };
  return { error: "Something went wrong. Try again." };
}

function revalidateBooking(reference?: string, slug?: string) {
  revalidatePath("/rentals");
  revalidatePath("/account/rentals");
  revalidatePath("/admin/rentals");
  revalidatePath("/admin/rentals/bookings");
  revalidatePath("/admin/rentals/payments");
  revalidatePath("/admin/rentals/customers");
  revalidatePath("/admin/rentals/reports");
  if (reference) revalidatePath(`/account/rentals/${reference}`);
  if (slug) revalidatePath(`/rentals/${slug}`);
}

type UploadedDoc = {
  configId: string;
  fileUrl: string;
  fileKey: string;
  fileDriver: "local" | "cloudinary";
  fileResource: "image" | "raw";
  number: string;
  issueDate: string;
  expiryDate: string;
};

function readDocuments(raw: string): UploadedDoc[] {
  const parsed = JSON.parse(raw) as UploadedDoc[];
  if (!Array.isArray(parsed)) return [];
  return parsed.filter((item) => item && item.configId && item.fileUrl);
}

export async function confirmRentalBooking(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  const user = await getCurrentUser();
  if (!user || user.scope !== "customer" || !can(user, "account.bookings.update")) {
    return { error: "Create an account or sign in before confirming this rental." };
  }

  try {
    const vehicleId = String(formData.get("vehicleId") ?? "");
    const pickupAt = parseDateTimeLocal(String(formData.get("pickupAt") ?? ""));
    const returnAt = parseDateTimeLocal(String(formData.get("returnAt") ?? ""));
    const pickupMode = String(formData.get("pickupMode") ?? "");
    const returnMode = String(formData.get("returnMode") ?? "");
    const pickupLocationId = String(formData.get("pickupLocationId") ?? "") || null;
    const returnLocationId = String(formData.get("returnLocationId") ?? "") || null;
    const deliveryAddress = String(formData.get("deliveryAddress") ?? "").trim();
    const returnAddress = String(formData.get("returnAddress") ?? "").trim();
    const sameReturn = formData.get("sameReturn") === "on";
    const notes = String(formData.get("notes") ?? "").trim().slice(0, 500);
    const addonIds = formData.getAll("addonIds").map(String).filter(Boolean);
    if (!pickupAt || !returnAt) return { error: "Choose a pickup and return time." };

    let documents: UploadedDoc[] = [];
    try {
      documents = readDocuments(String(formData.get("documentsJson") || "[]"));
    } catch {
      return { error: "Customer documents could not be read. Upload them again." };
    }

    const booking = await prisma.$transaction(async (tx) => {
      await tx.vehicle.update({
        where: { id: vehicleId },
        data: { updatedAt: new Date() },
      });

      const vehicle = await tx.vehicle.findUnique({
        where: { id: vehicleId },
        include: {
          addonLinks: { include: { config: true } },
          locationLinks: true,
        },
      });
      const settings = await tx.rentalSettings.findUnique({ where: { id: "default" } });
      if (!vehicle || !vehicle.published || !settings) {
        throw new Error("This vehicle is not available to book.");
      }
      if (vehicle.status !== "available") {
        throw new Error("This vehicle cannot be booked in its current status.");
      }

      const modes = handoverModes({
        systemPickup: settings.allowCounterPickup,
        systemDelivery: settings.allowHomeDelivery,
        vehiclePickup: vehicle.allowCounterPickup,
        vehicleDelivery: vehicle.allowHomeDelivery,
      });
      const resolvedReturnMode = sameReturn ? pickupMode : returnMode;
      const resolvedReturnLocation = sameReturn ? pickupLocationId : returnLocationId;
      const resolvedReturnAddress = sameReturn ? deliveryAddress : returnAddress;
      if (pickupMode !== "counter" && pickupMode !== "delivery") {
        throw new Error("Choose how you will receive the vehicle.");
      }
      if (resolvedReturnMode !== "counter" && resolvedReturnMode !== "delivery") {
        throw new Error("Choose how you will return the vehicle.");
      }
      if (
        (pickupMode === "counter" && !modes.counter) ||
        (pickupMode === "delivery" && !modes.delivery) ||
        (resolvedReturnMode === "counter" && !modes.counter) ||
        (resolvedReturnMode === "delivery" && !modes.delivery)
      ) {
        throw new Error("That handover option is not offered for this vehicle.");
      }

      const allowedLocations = vehicle.locationLinks.map((link) => link.locationId);
      async function assertLocation(id: string | null, label: string) {
        if (!id) throw new Error(`Choose a ${label} location.`);
        const location = await tx.rentalLocation.findFirst({
          where: { id, active: true },
        });
        if (!location) throw new Error(`Choose an active ${label} location.`);
        if (allowedLocations.length > 0 && !allowedLocations.includes(id)) {
          throw new Error(`This vehicle is not offered at that ${label} location.`);
        }
      }
      if (pickupMode === "counter") await assertLocation(pickupLocationId, "pickup");
      else if (deliveryAddress.length < 8) throw new Error("Enter the full delivery address.");
      if (resolvedReturnMode === "counter") await assertLocation(resolvedReturnLocation, "return");
      else if (resolvedReturnAddress.length < 8) throw new Error("Enter the full return address.");

      const clash = await tx.rentalBooking.findFirst({
        where: {
          vehicleId,
          status: { in: [...blockingBookingStatuses] },
          pickupAt: { lt: returnAt },
          returnAt: { gt: pickupAt },
        },
        select: { id: true },
      });
      const block = await tx.vehicleBlock.findFirst({
        where: {
          vehicleId,
          startAt: { lt: returnAt },
          endAt: { gt: pickupAt },
        },
        select: { id: true },
      });
      if (clash || block) throw new Error("Those dates are no longer available.");

      const selectedAddons = vehicle.addonLinks
        .map((link) => link.config)
        .filter((config) => config.active && addonIds.includes(config.id));
      if (selectedAddons.length !== new Set(addonIds).size) {
        throw new Error("One of the add-ons is not offered on this vehicle.");
      }

      const quote = quoteRental({
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
        taxPercent: settings.taxPercent,
        currency: vehicle.currency || settings.currency,
        addons: selectedAddons.map((config) => ({
          configId: config.id,
          name: config.name,
          price: config.price,
          priceUnit: config.priceUnit,
          quantity: 1,
        })),
      });

      const requiredDocs = await tx.rentalConfig.findMany({
        where: {
          kind: "customer_document",
          active: true,
          OR: [{ appliesTo: "all" }, { appliesTo: vehicle.kind }],
        },
      });
      const docRows = requiredDocs.map((config) => {
        const uploaded = documents.find((item) => item.configId === config.id);
        return { config, uploaded };
      });
      for (const row of docRows) {
        if (!row.uploaded) continue;
        if (row.config.requiresNumber && !row.uploaded.number.trim()) {
          throw new Error(`${row.config.name} needs a number.`);
        }
        if (row.config.requiresIssueDate && !row.uploaded.issueDate) {
          throw new Error(`${row.config.name} needs an issue date.`);
        }
        if (row.config.requiresExpiry && !row.uploaded.expiryDate) {
          throw new Error(`${row.config.name} needs an expiry date.`);
        }
      }
      const missing = docRows.some((row) => !row.uploaded);
      const status = requiredDocs.length === 0 ? "pending" : missing ? "documents_required" : "documents_under_review";

      const created = await tx.rentalBooking.create({
        data: {
          reference: rentalReference(),
          vehicleId,
          userId: user.id,
          status,
          pickupAt,
          returnAt,
          pickupMode,
          returnMode: resolvedReturnMode,
          pickupLocationId: pickupMode === "counter" ? pickupLocationId : null,
          returnLocationId: resolvedReturnMode === "counter" ? resolvedReturnLocation : null,
          deliveryAddress: pickupMode === "delivery" ? deliveryAddress : "",
          returnAddress: resolvedReturnMode === "delivery" ? resolvedReturnAddress : "",
          currency: quote.currency,
          rentalDays: quote.days,
          baseAmount: quote.baseAmount,
          addonsAmount: quote.addonsAmount,
          discountAmount: quote.discountAmount,
          taxAmount: quote.taxAmount,
          securityDeposit: quote.securityDeposit,
          totalAmount: quote.totalAmount,
          amountDue: quote.amountDue,
          pricingSnapshot: JSON.stringify(quote satisfies RentalQuote),
          contactName: user.name,
          contactEmail: user.email,
          contactPhone: user.phone,
          notes,
          documents: {
            create: docRows
              .filter((row) => row.uploaded)
              .map((row) => ({
                configId: row.config.id,
                typeName: row.config.name,
                fileUrl: row.uploaded!.fileUrl,
                fileKey: row.uploaded!.fileKey,
                fileDriver: row.uploaded!.fileDriver,
                fileResource: row.uploaded!.fileResource,
                number: row.uploaded!.number.trim(),
                issueDate: row.uploaded!.issueDate ? new Date(`${row.uploaded!.issueDate}T00:00`) : null,
                expiryDate: row.uploaded!.expiryDate ? new Date(`${row.uploaded!.expiryDate}T00:00`) : null,
                status: "pending",
              })),
          },
          addons: {
            create: quote.addons.map((addon) => ({
              configId: addon.configId,
              name: addon.name,
              priceUnit: addon.priceUnit,
              unitPrice: addon.price,
              quantity: addon.quantity,
              amount: addon.amount,
            })),
          },
          payments: {
            create: [
              ...(quote.totalAmount > 0
                ? [{ kind: "rental", status: "unpaid", amount: quote.totalAmount, method: "pending_gateway" }]
                : []),
              ...(quote.securityDeposit > 0
                ? [{ kind: "deposit", status: "unpaid", amount: quote.securityDeposit, method: "pending_gateway" }]
                : []),
            ],
          },
          events: {
            create: {
              status,
              message: "Booking request received. Payment stays unpaid until a gateway or a staff member records it.",
              actorId: user.id,
            },
          },
        },
      });
      return created;
    });

    revalidateBooking(booking.reference);
    const { redirect } = await import("next/navigation");
    redirect(`/account/rentals/${booking.reference}?confirmed=1`);
    return { error: null };
  } catch (error) {
    if (isRedirectError(error)) throw error;
    return fail(error);
  }
}

export async function saveCustomerRentalDocument(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  const user = await requireCustomer("account.bookings.update");
  try {
    const booking = await prisma.rentalBooking.findFirst({
      where: { id: String(formData.get("bookingId") ?? ""), userId: user.id },
      include: { vehicle: true, documents: true },
    });
    if (!booking) return { error: "Booking not found." };
    if (!["pending", "documents_required", "documents_under_review"].includes(booking.status)) {
      return { error: "Documents can no longer be changed on this booking." };
    }
    const config = await prisma.rentalConfig.findFirst({
      where: { id: String(formData.get("configId") ?? ""), kind: "customer_document", active: true },
    });
    if (!config) return { error: "Choose a document type." };
    const file = JSON.parse(String(formData.get("fileJson") || "{}")) as {
      url?: string;
      key?: string;
      driver?: "local" | "cloudinary";
      resourceType?: "image" | "raw";
    };
    if (!file.url || !file.key || !file.driver || !file.resourceType) {
      return { error: "Upload the document file." };
    }
    const number = String(formData.get("number") ?? "").trim();
    const issueDate = String(formData.get("issueDate") ?? "");
    const expiryDate = String(formData.get("expiryDate") ?? "");
    if (config.requiresNumber && !number) return { error: `${config.name} needs a number.` };
    if (config.requiresIssueDate && !issueDate) return { error: `${config.name} needs an issue date.` };
    if (config.requiresExpiry && !expiryDate) return { error: `${config.name} needs an expiry date.` };

    const previous = booking.documents.find((document) => document.configId === config.id);
    if (previous) {
      await prisma.rentalBookingDocument.delete({ where: { id: previous.id } });
      await deleteDocument({
        key: previous.fileKey,
        driver: previous.fileDriver,
        resourceType: previous.fileResource,
      });
    }
    await prisma.rentalBookingDocument.create({
      data: {
        bookingId: booking.id,
        configId: config.id,
        typeName: config.name,
        fileUrl: file.url,
        fileKey: file.key,
        fileDriver: file.driver,
        fileResource: file.resourceType,
        number,
        issueDate: issueDate ? new Date(`${issueDate}T00:00`) : null,
        expiryDate: expiryDate ? new Date(`${expiryDate}T00:00`) : null,
        status: "pending",
      },
    });

    const required = await prisma.rentalConfig.findMany({
      where: {
        kind: "customer_document",
        active: true,
        OR: [{ appliesTo: "all" }, { appliesTo: booking.vehicle.kind }],
      },
      select: { id: true },
    });
    const current = await prisma.rentalBookingDocument.findMany({
      where: { bookingId: booking.id },
    });
    const complete = required.every((item) =>
      current.some((document) => document.configId === item.id && document.fileUrl && document.status !== "rejected"),
    );
    const nextStatus = complete ? "documents_under_review" : "documents_required";
    if (nextStatus !== booking.status) {
      await prisma.rentalBooking.update({
        where: { id: booking.id },
        data: {
          status: nextStatus,
          events: {
            create: {
              status: nextStatus,
              message: complete
                ? "All required documents are in review."
                : "A required document is still missing.",
              actorId: user.id,
            },
          },
        },
      });
    }
    revalidateBooking(booking.reference, booking.vehicle.slug);
    return { error: null, success: "Document saved." };
  } catch (error) {
    return fail(error);
  }
}

export async function cancelRentalBooking(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  const actor = await getCurrentUser();
  if (!actor) return { error: "Sign in required." };
  const staff = actor.scope === "staff" && can(actor, "vehicles.manage");
  const customer = actor.scope === "customer" && can(actor, "account.bookings.update");
  if (!staff && !customer) return { error: "You cannot cancel this booking." };

  try {
    const booking = await prisma.rentalBooking.findUnique({
      where: { id: String(formData.get("bookingId") ?? "") },
      include: { payments: true, vehicle: { select: { slug: true } } },
    });
    if (!booking) return { error: "Booking not found." };
    if (customer && booking.userId !== actor.id) return { error: "Booking not found." };
    const allowed = staff
      ? bookingTransitions[booking.status]?.includes("cancelled")
      : customerCancelStatuses.includes(booking.status as (typeof customerCancelStatuses)[number]);
    if (!allowed) return { error: "This booking can no longer be cancelled." };

    const reason = String(formData.get("reason") ?? "").trim();
    if (reason.length < 3) return { error: "Enter a short reason for the cancellation." };
    const policies = await prisma.rentalPolicy.findMany({
      where: { kind: "cancellation", active: true },
    });
    const decision = cancellationRefund({
      pickupAt: booking.pickupAt,
      cancelledAt: new Date(),
      policies,
    });
    const paidRental = booking.payments
      .filter((payment) => payment.status === "paid" && (payment.kind === "rental" || payment.kind === "extra"))
      .reduce((sum, payment) => sum + payment.amount, 0);
    const paidDeposit = booking.payments
      .filter((payment) => payment.status === "paid" && payment.kind === "deposit")
      .reduce((sum, payment) => sum + payment.amount, 0);
    const alreadyRefunded = booking.payments
      .filter((payment) => payment.kind === "refund" && payment.status !== "failed")
      .reduce((sum, payment) => sum + payment.amount, 0);
    const rentalRefund = Math.round((paidRental * decision.refundPercent) / 100);
    const depositRefund = paidDeposit;
    const refundAmount = Math.max(0, rentalRefund + depositRefund - alreadyRefunded);

    await prisma.rentalBooking.update({
      where: { id: booking.id },
      data: {
        status: "cancelled",
        cancellationReason: reason,
        cancelledAt: new Date(),
        payments:
          refundAmount > 0
            ? {
                create: {
                  kind: "refund",
                  status: "unpaid",
                  amount: refundAmount,
                  method: "pending_gateway",
                  note: `${decision.policyName}: ${decision.refundPercent}% of paid rental charges. Security deposit included in full.`,
                },
              }
            : undefined,
        events: {
          create: {
            status: "cancelled",
            message: `Cancelled. ${decision.policyName} (${decision.refundPercent}% of paid rental charges).`,
            actorId: actor.id,
          },
        },
      },
    });
    revalidateBooking(booking.reference, booking.vehicle.slug);
    return { error: null, success: "Booking cancelled." };
  } catch (error) {
    return fail(error);
  }
}

export async function updateRentalBookingStatus(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  const actor = await requirePermission("vehicles.manage");
  try {
    const booking = await prisma.rentalBooking.findUnique({
      where: { id: String(formData.get("bookingId") ?? "") },
      include: { documents: true, vehicle: true },
    });
    if (!booking) return { error: "Booking not found." };
    const next = String(formData.get("status") ?? "");
    if (!bookingTransitions[booking.status]?.includes(next)) {
      return { error: "That status change is not allowed." };
    }
    if (next === "confirmed") {
      const rejected = booking.documents.some((document) => document.status === "rejected");
      const pending = booking.documents.some((document) => document.status !== "verified");
      if (booking.documents.length > 0 && (rejected || pending)) {
        return { error: "Verify every customer document before confirming." };
      }
      await prisma.vehicle.update({
        where: { id: booking.vehicleId },
        data: { updatedAt: new Date() },
      });
      const clash = await prisma.rentalBooking.findFirst({
        where: {
          vehicleId: booking.vehicleId,
          id: { not: booking.id },
          status: { in: [...blockingBookingStatuses] },
          pickupAt: { lt: booking.returnAt },
          returnAt: { gt: booking.pickupAt },
        },
        select: { reference: true },
      });
      if (clash) return { error: `Dates clash with ${clash.reference}.` };
      if (booking.vehicle.status !== "available") {
        return { error: "The vehicle status does not allow this booking to be confirmed." };
      }
    }
    const note = String(formData.get("note") ?? "").trim();
    if ((next === "rejected" || next === "cancelled") && note.length < 3) {
      return { error: "Enter a reason." };
    }
    await prisma.rentalBooking.update({
      where: { id: booking.id },
      data: {
        status: next,
        rejectionReason: next === "rejected" ? note : booking.rejectionReason,
        cancellationReason: next === "cancelled" ? note : booking.cancellationReason,
        cancelledAt: next === "cancelled" ? new Date() : booking.cancelledAt,
        events: {
          create: {
            status: next,
            message: note || `Status changed to ${next.replaceAll("_", " ")}.`,
            actorId: actor.id,
          },
        },
      },
    });
    revalidateBooking(booking.reference, booking.vehicle.slug);
    return { error: null, success: "Booking updated." };
  } catch (error) {
    return fail(error);
  }
}

export async function reviewCustomerDocument(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  const actor = await requirePermission("vehicles.manage");
  const document = await prisma.rentalBookingDocument.findUnique({
    where: { id: String(formData.get("documentId") ?? "") },
    include: { booking: { include: { vehicle: true, documents: true } } },
  });
  if (!document) return { error: "Document not found." };
  const status = String(formData.get("status") ?? "");
  if (status !== "verified" && status !== "rejected") {
    return { error: "Choose verified or rejected." };
  }
  const rejectionReason = String(formData.get("rejectionReason") ?? "").trim();
  if (status === "rejected" && rejectionReason.length < 3) {
    return { error: "Enter why this document was rejected." };
  }
  await prisma.rentalBookingDocument.update({
    where: { id: document.id },
    data: {
      status,
      rejectionReason: status === "rejected" ? rejectionReason : "",
      verifiedAt: status === "verified" ? new Date() : null,
      verifiedById: status === "verified" ? actor.id : null,
    },
  });
  if (status === "rejected" && document.booking.status === "documents_under_review") {
    await prisma.rentalBooking.update({
      where: { id: document.bookingId },
      data: {
        status: "documents_required",
        events: {
          create: {
            status: "documents_required",
            message: `${document.typeName} was rejected. ${rejectionReason}`,
            actorId: actor.id,
          },
        },
      },
    });
  }
  revalidateBooking(document.booking.reference, document.booking.vehicle.slug);
  return { error: null, success: status === "verified" ? "Document verified." : "Document rejected." };
}

export async function recordRentalPayment(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  const actor = await requirePermission("vehicles.manage");
  const payment = await prisma.rentalPayment.findUnique({
    where: { id: String(formData.get("paymentId") ?? "") },
    include: { booking: { include: { vehicle: { select: { slug: true } } } } },
  });
  if (!payment) return { error: "Payment not found." };
  const status = String(formData.get("status") ?? "");
  const method = String(formData.get("method") ?? "");
  if (!["unpaid", "paid", "failed"].includes(status)) return { error: "Choose a payment status." };
  if (!paymentMethods.includes(method as (typeof paymentMethods)[number])) {
    return { error: "Choose a payment method." };
  }
  await prisma.rentalPayment.update({
    where: { id: payment.id },
    data: {
      status,
      method,
      gatewayRef: String(formData.get("gatewayRef") ?? "").trim(),
      note: String(formData.get("note") ?? "").trim(),
      recordedById: actor.id,
    },
  });
  await prisma.rentalBookingEvent.create({
    data: {
      bookingId: payment.bookingId,
      status: payment.booking.status,
      message: `${payment.kind} payment marked ${status} (${method}).`,
      actorId: actor.id,
    },
  });
  revalidateBooking(payment.booking.reference, payment.booking.vehicle.slug);
  return { error: null, success: "Payment updated." };
}

export async function addRentalCharge(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  const actor = await requirePermission("vehicles.manage");
  const booking = await prisma.rentalBooking.findUnique({
    where: { id: String(formData.get("bookingId") ?? "") },
    include: { vehicle: { select: { slug: true } } },
  });
  if (!booking) return { error: "Booking not found." };
  if (!["active", "return_pending", "completed"].includes(booking.status)) {
    return { error: "Extra charges can be added once the rental has started." };
  }
  const drivenKm = Number(formData.get("drivenKm") || 0);
  const lateHours = Number(formData.get("lateHours") || 0);
  if (!Number.isInteger(drivenKm) || drivenKm < 0 || !Number.isInteger(lateHours) || lateHours < 0) {
    return { error: "Enter whole numbers for kilometres and late hours." };
  }
  const quote = JSON.parse(booking.pricingSnapshot) as {
    includedKmPerDay?: number;
    extraKmCharge?: number;
    lateReturnChargePerHour?: number;
  };
  const charges = extraReturnCharges({
    includedKmPerDay: quote.includedKmPerDay ?? 0,
    days: booking.rentalDays,
    drivenKm,
    extraKmCharge: quote.extraKmCharge ?? 0,
    lateHours,
    lateReturnChargePerHour: quote.lateReturnChargePerHour ?? 0,
  });
  if (charges.total < 1) return { error: "Those figures do not add an extra charge." };
  await prisma.rentalPayment.create({
    data: {
      bookingId: booking.id,
      kind: "extra",
      status: "unpaid",
      amount: charges.total,
      method: "pending_gateway",
      note: `${charges.extraKm} extra km (${charges.kmAmount}) and ${charges.lateHours} late hour${charges.lateHours === 1 ? "" : "s"} (${charges.lateAmount}).`,
      recordedById: actor.id,
    },
  });
  await prisma.rentalBooking.update({
    where: { id: booking.id },
    data: {
      amountDue: booking.amountDue + charges.total,
      events: {
        create: {
          status: booking.status,
          message: `Extra charges of ${charges.total} added from the booking price snapshot.`,
          actorId: actor.id,
        },
      },
    },
  });
  revalidateBooking(booking.reference, booking.vehicle.slug);
  return { error: null, success: "Extra charges added." };
}
