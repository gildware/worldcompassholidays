import type { Metadata } from "next";
import Link from "next/link";
import { modules } from "@/config/modules";
import { requireStaff } from "@/lib/auth/guards";
import type { StaffPermission } from "@/lib/auth/permissions";
import { can } from "@/lib/auth/session";
import { moduleLabel, statusLabel } from "@/lib/bookings";
import { prisma } from "@/lib/db";
import { formatDate, formatMoney } from "@/lib/format";
import { OverviewCharts } from "@/components/admin/ops/OverviewCharts";

export const metadata: Metadata = { title: "Overview" };

type Stat = {
  label: string;
  href: string;
  permission: StaffPermission;
  enabled: boolean;
  hint: string;
  count: () => Promise<number>;
};

const catalogStats: Stat[] = [
  {
    label: "Destinations",
    href: "/admin/destinations",
    permission: "destinations.view",
    enabled: true,
    hint: "Places on the site",
    count: () => prisma.destination.count(),
  },
  {
    label: "Tours",
    href: "/admin/tours",
    permission: "tours.view",
    enabled: modules.tours,
    hint: "Packages & treks",
    count: () => prisma.tour.count(),
  },
  {
    label: "Hotels",
    href: "/admin/hotels",
    permission: "hotels.view",
    enabled: modules.hotels,
    hint: "Stay inventory",
    count: () => prisma.hotel.count(),
  },
  {
    label: "Cars",
    href: "/admin/rentals/cars/overview",
    permission: "vehicles.view",
    enabled: modules.cars,
    hint: "Fleet vehicles",
    count: () => prisma.vehicle.count({ where: { kind: "car" } }),
  },
  {
    label: "Bikes",
    href: "/admin/rentals/bikes/overview",
    permission: "vehicles.view",
    enabled: modules.bikes,
    hint: "Fleet bikes",
    count: () => prisma.vehicle.count({ where: { kind: "bike" } }),
  },
  {
    label: "Customers",
    href: "/admin/customers",
    permission: "customers.view",
    enabled: true,
    hint: "Customer accounts",
    count: () => prisma.user.count({ where: { role: { scope: "customer" } } }),
  },
];

function statusClass(status: string) {
  switch (status) {
    case "confirmed":
    case "paid":
    case "completed":
      return "st-confirmed";
    case "quoted":
      return "st-deposit";
    case "enquiry":
      return "st-pending";
    case "cancelled":
      return "st-cancelled";
    default:
      return "st-pending";
  }
}

export default async function AdminHomePage() {
  const user = await requireStaff();
  const visible = catalogStats.filter((s) => s.enabled && can(user, s.permission));
  const counts = await Promise.all(visible.map((s) => s.count()));
  const canSeeBookings = can(user, "bookings.view");
  const canSeeTours = modules.tours && can(user, "tours.view");

  const [bookingTotal, statusGroups, latest, tours, tourCount] = await Promise.all([
    canSeeBookings ? prisma.booking.count() : Promise.resolve(0),
    canSeeBookings
      ? prisma.booking.groupBy({ by: ["status"], _count: { _all: true } })
      : Promise.resolve([] as { status: string; _count: { _all: number } }[]),
    canSeeBookings
      ? prisma.booking.findMany({ orderBy: { createdAt: "desc" }, take: 8 })
      : Promise.resolve([]),
    canSeeTours
      ? prisma.tour.findMany({
          where: { published: true },
          orderBy: { updatedAt: "desc" },
          take: 5,
          select: {
            id: true,
            title: true,
            priceFrom: true,
            currency: true,
            durationLabel: true,
            durationDays: true,
            imageUrl: true,
            featuredImageUrl: true,
            difficulty: true,
          },
        })
      : Promise.resolve([]),
    canSeeTours ? prisma.tour.count() : Promise.resolve(0),
  ]);

  const statusCount = Object.fromEntries(
    statusGroups.map((g) => [g.status, g._count._all]),
  ) as Record<string, number>;

  const enquiry = statusCount.enquiry ?? 0;
  const quoted = statusCount.quoted ?? 0;
  const confirmed =
    (statusCount.confirmed ?? 0) + (statusCount.paid ?? 0) + (statusCount.completed ?? 0);
  const cancelled = statusCount.cancelled ?? 0;
  const needsAction = enquiry + quoted;
  const pipelineMax = Math.max(enquiry, quoted, confirmed, 1);

  const hotelStat = visible.find((s) => s.href === "/admin/hotels");
  const hotelCount = hotelStat ? counts[visible.indexOf(hotelStat)] : 0;
  const destStat = visible.find((s) => s.href === "/admin/destinations");
  const destCount = destStat ? counts[visible.indexOf(destStat)] : 0;

  return (
    <>
      {canSeeBookings && needsAction > 0 ? (
        <section className="attention" aria-label="Needs attention">
          <div className="attention-icon" aria-hidden>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 9v4M12 17h.01M10.3 4.3 2.5 18a2 2 0 0 0 1.7 3h15.6a2 2 0 0 0 1.7-3L13.7 4.3a2 2 0 0 0-3.4 0Z" />
            </svg>
          </div>
          <div>
            <strong>
              {needsAction} booking{needsAction === 1 ? "" : "s"} need a reply
            </strong>
            <p>
              {enquiry} enquir{enquiry === 1 ? "y" : "ies"} · {quoted} quoted — waiting in the queue
            </p>
          </div>
          <Link className="btn" href="/admin/bookings">
            Resolve queue
          </Link>
        </section>
      ) : null}

      <section className="hero-grid" aria-label="Key performance" style={{ marginTop: 16 }}>
        <article className="card card-pad north">
          <div className="label">North star · bookings</div>
          <div className="value">{bookingTotal}</div>
          <div className="meta">
            <span className="delta-up">{needsAction} open</span>
            <span>·</span>
            <span>{confirmed} confirmed / paid</span>
          </div>
          <div className="progress" aria-hidden>
            <span
              style={{
                width: `${bookingTotal ? Math.min(100, Math.round((confirmed / Math.max(bookingTotal, 1)) * 100)) : 0}%`,
              }}
            />
          </div>
          <div className="progress-meta">
            <span>
              {bookingTotal
                ? `${Math.round((confirmed / Math.max(bookingTotal, 1)) * 100)}% converted`
                : "No bookings yet"}
            </span>
            <span>{cancelled} cancelled</span>
          </div>
        </article>

        <article className="card card-pad kpi">
          <div className="k-label">Tours & treks</div>
          <div className="k-value">{tourCount}</div>
          <div className="k-foot">
            <span>In catalog</span>
            <Link className="chip chip-up" href="/admin/tours">
              Open
            </Link>
          </div>
        </article>

        <article className="card card-pad kpi">
          <div className="k-label">Hotels</div>
          <div className="k-value">{hotelCount}</div>
          <div className="k-foot">
            <span>Stay inventory</span>
            <Link className="chip chip-flat" href="/admin/hotels">
              Open
            </Link>
          </div>
        </article>

        <article className="card card-pad kpi">
          <div className="k-label">Destinations</div>
          <div className="k-value">{destCount}</div>
          <div className="k-foot">
            <span>Places live</span>
            <Link className="chip chip-flat" href="/admin/destinations">
              Open
            </Link>
          </div>
        </article>
      </section>

      <section className="mid" id="pipeline" style={{ marginTop: 14 }}>
        <article className="card card-pad">
          <div className="card-h">
            <div>
              <h2>Booking pace</h2>
              <p>Recent booking volume · last 30 days shape</p>
            </div>
            <Link className="linkish" href="/admin/bookings">
              All bookings
            </Link>
          </div>
          <OverviewCharts total={bookingTotal} confirmed={confirmed} open={needsAction} />
        </article>

        <article className="card card-pad">
          <div className="card-h">
            <div>
              <h2>Enquiry pipeline</h2>
              <p>Live statuses from your bookings</p>
            </div>
            <Link className="linkish" href="/admin/bookings">
              Open board
            </Link>
          </div>
          <div className="pipeline" aria-label="Pipeline stages">
            <div className="pipe-row">
              <span>Enquiry</span>
              <div className="bar">
                <i style={{ width: `${(enquiry / pipelineMax) * 100}%`, background: "#94a3b8" }} />
              </div>
              <span>{enquiry}</span>
            </div>
            <div className="pipe-row">
              <span>Quoted</span>
              <div className="bar">
                <i style={{ width: `${(quoted / pipelineMax) * 100}%`, background: "#2563eb" }} />
              </div>
              <span>{quoted}</span>
            </div>
            <div className="pipe-row">
              <span>Confirmed</span>
              <div className="bar">
                <i style={{ width: `${(confirmed / pipelineMax) * 100}%`, background: "#0e8f7a" }} />
              </div>
              <span>{confirmed}</span>
            </div>
            <div className="pipe-row">
              <span>Cancelled</span>
              <div className="bar">
                <i style={{ width: `${(cancelled / pipelineMax) * 100}%`, background: "#c23b3b" }} />
              </div>
              <span>{cancelled}</span>
            </div>
          </div>
          <div className="conv">
            <div>
              <strong>
                {bookingTotal
                  ? `${Math.round((confirmed / Math.max(bookingTotal, 1)) * 100)}%`
                  : "—"}
              </strong>
              <span>Confirm rate</span>
            </div>
            <div>
              <strong>{needsAction}</strong>
              <span>Need action</span>
            </div>
          </div>
        </article>
      </section>

      <section className="triple" style={{ marginTop: 14 }}>
        <article className="card card-pad">
          <div className="card-h">
            <div>
              <h2>Recent tours</h2>
              <p>Latest packages in your catalog</p>
            </div>
            <Link className="linkish" href="/admin/tours">
              Manifests
            </Link>
          </div>
          {tours.length === 0 ? (
            <p style={{ color: "var(--muted)", fontSize: 13 }}>No published tours yet.</p>
          ) : (
            <div className="dept-list">
              {tours.map((tour) => {
                const duration =
                  tour.durationLabel ||
                  (tour.durationDays ? `${tour.durationDays}D` : "Tour");
                return (
                  <Link key={tour.id} href={`/admin/tours/${tour.id}`} className="dept">
                    <div
                      className="date-box"
                      style={
                        tour.featuredImageUrl || tour.imageUrl
                          ? {
                              backgroundImage: `url(${tour.featuredImageUrl || tour.imageUrl})`,
                              backgroundSize: "cover",
                              backgroundPosition: "center",
                              color: "transparent",
                            }
                          : undefined
                      }
                    >
                      <b>{duration.slice(0, 2)}</b>
                      <span>{tour.difficulty?.slice(0, 3) || "pkg"}</span>
                    </div>
                    <div>
                      <h3>{tour.title}</h3>
                      <p>
                        {duration}
                        {tour.priceFrom
                          ? ` · from ${formatMoney(tour.priceFrom, tour.currency)}`
                          : ""}
                      </p>
                    </div>
                    <div className="load">
                      <strong>Edit</strong>
                      open
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </article>

        <article className="card card-pad">
          <div className="card-h">
            <div>
              <h2>Catalog mix</h2>
              <p>What you can manage</p>
            </div>
          </div>
          <div className="rank-list">
            {visible.length === 0 ? (
              <p style={{ color: "var(--muted)", fontSize: 13 }}>No modules visible for your role.</p>
            ) : (
              visible.slice(0, 5).map((stat, index) => (
                <Link key={stat.href} href={stat.href} className="rank">
                  <div className="n">{index + 1}</div>
                  <div>
                    <h3>{stat.label}</h3>
                    <p>{stat.hint}</p>
                  </div>
                  <div className="amt">{counts[index]}</div>
                </Link>
              ))
            )}
          </div>
        </article>

        <article className="card card-pad">
          <div className="card-h">
            <div>
              <h2>Channel focus</h2>
              <p>Work the open queue first</p>
            </div>
          </div>
          <div className="channel">
            <div className="ch-row">
              <div className="ch-meta">
                <span>Open enquiries</span>
                <strong>{enquiry}</strong>
              </div>
              <div className="ch-bar">
                <i
                  style={{
                    width: `${bookingTotal ? (enquiry / bookingTotal) * 100 : 0}%`,
                    background: "#c47a12",
                  }}
                />
              </div>
            </div>
            <div className="ch-row">
              <div className="ch-meta">
                <span>Quoted</span>
                <strong>{quoted}</strong>
              </div>
              <div className="ch-bar">
                <i
                  style={{
                    width: `${bookingTotal ? (quoted / bookingTotal) * 100 : 0}%`,
                    background: "#2563eb",
                  }}
                />
              </div>
            </div>
            <div className="ch-row">
              <div className="ch-meta">
                <span>Confirmed+</span>
                <strong>{confirmed}</strong>
              </div>
              <div className="ch-bar">
                <i
                  style={{
                    width: `${bookingTotal ? (confirmed / bookingTotal) * 100 : 0}%`,
                    background: "#0e8f7a",
                  }}
                />
              </div>
            </div>
          </div>
          <div className="conv" style={{ marginTop: 16 }}>
            <div>
              <strong>{user.roleName}</strong>
              <span>Your role</span>
            </div>
            <div>
              <strong>{visible.length}</strong>
              <span>Modules</span>
            </div>
          </div>
        </article>
      </section>

      {canSeeBookings ? (
        <section className="card card-pad" id="bookings" style={{ marginTop: 14 }}>
          <div className="card-h">
            <div>
              <h2>Recent bookings</h2>
              <p>Real enquiries from your website</p>
            </div>
            <Link className="linkish" href="/admin/bookings">
              View all bookings
            </Link>
          </div>

          {latest.length === 0 ? (
            <p style={{ color: "var(--muted)", fontSize: 13 }}>Website enquiries will land here.</p>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Booking</th>
                    <th>Guest</th>
                    <th>Service</th>
                    <th>Status</th>
                    <th>Created</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {latest.map((booking) => (
                    <tr key={booking.id}>
                      <td>
                        <strong>{booking.reference}</strong>
                      </td>
                      <td>
                        <strong>{booking.contactName}</strong>
                        <br />
                        <span style={{ color: "var(--muted)", fontSize: 12 }}>
                          {booking.contactEmail}
                        </span>
                      </td>
                      <td>
                        <div className="tour">
                          <div
                            className="tour-thumb"
                            style={{
                              backgroundImage: "linear-gradient(135deg,#0e8f7a,#134e4a)",
                            }}
                            aria-hidden
                          />
                          <div>
                            <strong>{booking.title || moduleLabel(booking.module)}</strong>
                            <span>{moduleLabel(booking.module)}</span>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className={`status ${statusClass(booking.status)}`}>
                          {statusLabel(booking.status)}
                        </span>
                      </td>
                      <td>{formatDate(booking.createdAt)}</td>
                      <td>
                        <div className="actions">
                          <Link
                            className="icon-btn"
                            href={`/admin/bookings/${booking.id}`}
                            aria-label={`Open ${booking.reference}`}
                          >
                            <svg
                              width="14"
                              height="14"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                            >
                              <path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12Z" />
                              <circle cx="12" cy="12" r="3" />
                            </svg>
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      ) : null}
    </>
  );
}
