import type { ReactNode } from "react";
import type { Metadata } from "next";
import { BookingStatusForm } from "@/components/admin/BookingStatusForm";
import { VisaStaffNoteForm } from "@/components/admin/VisaStaffNoteForm";
import { requirePermission } from "@/lib/auth/guards";
import { can } from "@/lib/auth/session";
import { statusLabel } from "@/lib/bookings";
import { prisma } from "@/lib/db";
import { formatDate } from "@/lib/format";
import { readVisaDetails, visaTypeLabel, whatsAppHref } from "@/lib/visa";

export const metadata: Metadata = { title: "Visa requests" };

export default async function AdminVisaPage() {
  const user = await requirePermission("bookings.view");
  const canManage = can(user, "bookings.manage");
  const requests = await prisma.booking.findMany({
    where: { module: "visa" },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <h1 className="text-2xl font-semibold">Visa requests</h1>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
        Every application from the visa page. Email or call the traveller, then update the status as the file moves.
        {canManage ? "" : " Your role can view requests but not change the status."}
      </p>
      {requests.length === 0 ? (
        <p className="mt-8 text-sm text-muted">No visa requests yet.</p>
      ) : (
        <ul className="mt-8 grid gap-4">
          {requests.map((request) => {
            const details = readVisaDetails(request.details);
            return (
              <li key={request.id} className="rounded-xl border border-line bg-white p-5 text-sm">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-xs text-muted">{request.reference}</p>
                    <h2 className="mt-1 text-lg font-semibold">{request.contactName}</h2>
                  </div>
                  <p className="rounded-full bg-surface px-3 py-1 text-xs font-medium">
                    {statusLabel(request.status)}
                  </p>
                </div>
                <dl className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  <Detail label="Email">
                    <a className="font-medium text-brand" href={`mailto:${request.contactEmail}`}>
                      {request.contactEmail}
                    </a>
                  </Detail>
                  <Detail label="Phone">
                    {request.contactPhone ? (
                      <span className="flex flex-wrap gap-3">
                        <a className="font-medium text-brand" href={`tel:${request.contactPhone}`}>
                          {request.contactPhone}
                        </a>
                        {whatsAppHref(request.contactPhone) ? (
                          <a
                            className="font-medium text-brand"
                            href={whatsAppHref(request.contactPhone) ?? undefined}
                            target="_blank"
                            rel="noreferrer"
                          >
                            WhatsApp
                          </a>
                        ) : null}
                      </span>
                    ) : (
                      <span className="text-muted">Not given</span>
                    )}
                  </Detail>
                  <Detail label="Visa type">{visaTypeLabel(details.visaType)}</Detail>
                  {details.channel === "whatsapp" ? (
                    <Detail label="Channel">Saved on the site, then continued on WhatsApp.</Detail>
                  ) : null}
                  <Detail label="Destination">{details.country || "Not set"}</Detail>
                  <Detail label="Nationality">{details.nationality || "Not set"}</Detail>
                  <Detail label="Travellers">{String(request.guests)}</Detail>
                  <Detail label="Departure">
                    {request.startDate ? formatDate(request.startDate) : "Not set"}
                  </Detail>
                  <Detail label="Return">
                    {request.endDate ? formatDate(request.endDate) : "Not set"}
                  </Detail>
                  <Detail label="Received">{formatDate(request.createdAt)}</Detail>
                </dl>
                {request.notes ? (
                  <p className="mt-4 whitespace-pre-line rounded-lg bg-surface px-3 py-3 leading-6">
                    {request.notes}
                  </p>
                ) : null}
                {canManage ? (
                  <>
                    <BookingStatusForm bookingId={request.id} status={request.status} />
                    <VisaStaffNoteForm bookingId={request.id} note={details.staffNote} />
                  </>
                ) : details.staffNote ? (
                  <p className="mt-4 whitespace-pre-line rounded-lg bg-surface px-3 py-3 leading-6">
                    {details.staffNote}
                  </p>
                ) : null}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function Detail({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <dt className="text-xs text-muted">{label}</dt>
      <dd className="mt-1 font-medium">{children}</dd>
    </div>
  );
}
